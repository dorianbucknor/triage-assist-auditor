/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { DiagnosisEvaluationService } from "@/lib/evaluation/evaluation-service";
import { ResearchDataExporter } from "@/lib/evaluation/research-exporter";
import { LocalSemanticSimilarity } from "@/lib/evaluation/hf-semantic";
import { promises as fs } from "fs";
import path from "path";

/**
 * Evaluation API endpoint
 * POST /api/evaluation/run
 *
 * Runs evaluations on all AI responses against ground truth scenarios
 * and exports results to CSV, JSON, and Markdown formats.
 */

interface AIResponse {
	index: number;
	startTime: string;
	endTime: string;
	duration: number;
	triageData: {
		subjectId: string;
		chiefComplaint: { title: string; description: string };
		vitals?: Record<string, unknown>;
		otherLabs?: Record<string, unknown>;
		id?: string;
	};
	response: {
		aiResponse: {
			diagnosis: { primary: string; confidence: number };
			triage: { level: number; confidence: number };
			treatment: { recommendations: string; confidence: number };
		};
	};
}

interface GroundTruthScenario {
	subjectId: string;
	chiefComplaint: { title: string };
	vitals?: Record<string, unknown>;
	otherLabs?: Record<string, unknown>;
	id?: string;
}

async function loadAIResponses(): Promise<AIResponse[]> {
	try {
		const filePath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/ai response results.json",
		);
		const data = await fs.readFile(filePath, "utf-8");
		const parsed = JSON.parse(data);
		console.log("DEBUG loadAIResponses: parsed keys:", Object.keys(parsed));
		const items = parsed.items || [];
		console.log("DEBUG loadAIResponses: items length:", items.length);
		if (items.length > 0) {
			console.log(
				"DEBUG loadAIResponses: first item has triageData?",
				!!items[0].triageData,
			);
		}
		return items;
	} catch (error) {
		console.error("Error loading AI responses:", error);
		throw new Error(`Failed to load AI responses: ${error}`);
	}
}

async function loadGroundTruthScenarios(): Promise<GroundTruthScenario[]> {
	try {
		const filePath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/transformed_data/scenarios_default.json",
		);
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error loading ground truth:", error);
		throw new Error(`Failed to load ground truth scenarios: ${error}`);
	}
}

function matchScenarios(
	aiResponses: AIResponse[],
	groundTruthScenarios: GroundTruthScenario[],
) {
	const map = new Map();
	const groundTruthMap = new Map<string, GroundTruthScenario>();

	// Create lookup by unique scenario ID (not subjectId)
	groundTruthScenarios.forEach((gt) => {
        if (!gt.id) return;

		groundTruthMap.set(gt.id, gt);
	});

	// Match AI responses to ground truth by ID
	aiResponses.forEach((ai) => {
		const scenarioId = ai.triageData.id;

        if(!scenarioId) return;

		const gt = groundTruthMap.get(scenarioId);
		if (gt) {
			map.set(scenarioId, { ai, groundTruth: gt });
		}
	});

	return map;
}

export async function POST(request: NextRequest) {
	try {
		console.log("🚀 Starting evaluation run...");

		// Initialize local semantic similarity (all-mpnet-base-v2)
		console.log("📊 Initializing semantic similarity model...");
		await LocalSemanticSimilarity.initialize();
		console.log("✓ Local semantic similarity (all-mpnet-base-v2) enabled");

		// Load data
		console.log("📂 Loading data...");
		const aiResponses = await loadAIResponses();
		const groundTruthScenarios = await loadGroundTruthScenarios();
		console.log(`✓ Loaded ${aiResponses.length} AI responses`);
		console.log(
			`✓ Loaded ${groundTruthScenarios.length} ground truth scenarios`,
		);

		// Match scenarios
		const matched = matchScenarios(aiResponses, groundTruthScenarios);
		console.log(`✓ Matched ${matched.size} scenarios`);
		if (aiResponses[0]?.triageData?.id) {
			console.log(
				`DEBUG: First AI scenario ID: ${aiResponses[0]?.triageData?.id}`,
			);
		}
		if (groundTruthScenarios[0]?.id) {
			console.log(
				`DEBUG: First GT scenario ID: ${groundTruthScenarios[0]?.id}`,
			);
		}

		// Run evaluations
		console.log(`\n📊 Running evaluations on ${matched.size} scenarios...`);
		const evaluations = [];
		const entries = Array.from(matched.entries());

		for (const [scenarioId, { ai, groundTruth }] of entries) {
			try {
				const scenario = {
					id: groundTruth.id,
					triageData: {
						subjectId: groundTruth.subjectId,
						id: groundTruth.id,
						inTime: new Date(groundTruth.inTime),
						outTime: new Date(groundTruth.outTime),
						triageDuration: groundTruth.triageDuration,
						chiefComplaint: groundTruth.chiefComplaint,
						vitals: groundTruth.vitals,
						otherLabs: groundTruth.otherLabs,
						modeOfArrival: groundTruth.modeOfArrival,
						gender: groundTruth.gender,
					} as any,
					aiResponse: {
						diagnosis: {
							primary: ai.response.aiResponse.diagnosis.primary,
							confidence:
								ai.response.aiResponse.diagnosis.confidence,
							reason:
								ai.response.aiResponse.diagnosis.reason || "",
						},
						triage: {
							level: ai.response.aiResponse.triage.level,
							confidence:
								ai.response.aiResponse.triage.confidence,
							reason: ai.response.aiResponse.triage.reason || "",
						},
						treatment: {
							recommendations: Array.isArray(
								ai.response.aiResponse.treatment
									.recommendations,
							)
								? ai.response.aiResponse.treatment
										.recommendations
								: [
										ai.response.aiResponse.treatment
											.recommendations,
									],
							reason:
								ai.response.aiResponse.treatment.reason || "",
							confidence:
								ai.response.aiResponse.treatment.confidence ||
								0.5,
						},
					},
				} as any;

				const evaluation =
					await DiagnosisEvaluationService.evaluateScenario(
						scenario,
						ai.duration,
					);
				evaluations.push(evaluation);

				if (evaluations.length % 50 === 0) {
					console.log(
						`✓ Processed ${evaluations.length}/${entries.length}...`,
					);
				}
			} catch (error) {
				console.error(`✗ Error evaluating ${scenarioId}:`, error);
			}
		}

		console.log(
			`\n✅ Completed ${evaluations.length}/${entries.length} evaluations`,
		);

		if (evaluations.length === 0) {
			throw new Error("No evaluations completed. Check logs for errors.");
		}

		// Generate report
		console.log("📊 Generating report...");
		const report = DiagnosisEvaluationService.generateReportSummary(
			evaluations,
			"MIMIC-IV ED Triage AI Evaluation",
		);

		// Export results
		console.log("📁 Exporting results...");
		const outputDir = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/evaluation_results",
		);

		// Create output directory if it doesn't exist
		try {
			await fs.mkdir(outputDir, { recursive: true });
		} catch (err) {
			// Directory may already exist
		}

		// Export CSV - Records
		const csvRecords = ResearchDataExporter.exportRecordsToCSV(evaluations);
		await fs.writeFile(
			path.join(outputDir, "evaluation_records.csv"),
			csvRecords,
		);

		// Export CSV - Report Summary
		const csvReport = ResearchDataExporter.exportReportToCSV(report);
		await fs.writeFile(
			path.join(outputDir, "evaluation_summary.csv"),
			csvReport,
		);

		// Export JSON
		const jsonExport = ResearchDataExporter.exportToJSON(
			report,
			evaluations,
		);
		await fs.writeFile(
			path.join(outputDir, "evaluation_data.json"),
			JSON.stringify(jsonExport, null, 2),
		);

		// Export Markdown
		const markdown = ResearchDataExporter.generateMarkdownReport(report);
		await fs.writeFile(
			path.join(outputDir, "EVALUATION_REPORT.md"),
			markdown,
		);

		console.log(
			`✓ Results exported to: mimic-iv-ed-demo-2.2/evaluation_results/`,
		);

		// Helper function to calculate statistics
		function calculateStats(values: number[]) {
			if (values.length === 0) return null;
			const sorted = [...values].sort((a, b) => a - b);
			const mean = values.reduce((a, b) => a + b, 0) / values.length;
			const variance =
				values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
				values.length;
			const stdDev = Math.sqrt(variance);
			const median =
				values.length % 2 === 0
					? (sorted[values.length / 2 - 1] +
							sorted[values.length / 2]) /
						2
					: sorted[Math.floor(values.length / 2)];

			return {
				mean,
				variance,
				stdDev,
				median,
				min: sorted[0],
				max: sorted[sorted.length - 1],
				q1: sorted[Math.floor(sorted.length * 0.25)],
				q3: sorted[Math.floor(sorted.length * 0.75)],
				count: values.length,
			};
		}

		// Calculate summary stats with full distribution
		const semanticScores = evaluations.map(
			(e) => e.metrics?.diagnosisSemanticSimilarity || 0,
		);
		const accuracyScores = evaluations.map(
			(e) => e.metrics?.diagnosisOverallScore || 0,
		);
		const responseTimes = evaluations.map(
			(e) => e.metrics?.responseTimeMs || 0,
		);

		console.log(
			`DEBUG: evaluations count: ${evaluations.length}, semanticScores: ${semanticScores.length}, accuracyScores: ${accuracyScores.length}`,
		);

		const semanticStats = calculateStats(semanticScores);
		const accuracyStats = calculateStats(accuracyScores);
		const responseTimeStats = calculateStats(responseTimes);

		if (!semanticStats || !accuracyStats || !responseTimeStats) {
			throw new Error(
				`Statistics calculation failed: semantic=${semanticStats}, accuracy=${accuracyStats}, responseTime=${responseTimeStats}`,
			);
		}

		const triageMatches = evaluations.filter(
			(e) => e.metrics.triageLevelMatch,
		).length;
		const avgTriage = (triageMatches / evaluations.length) * 100;

		const summary = {
			status: "success",
			totalScenarios: evaluations.length,
			diagnosticAccuracy: {
				mean: (semanticStats.mean * 100).toFixed(2),
				median: (semanticStats.median * 100).toFixed(2),
				stdDev: (semanticStats.stdDev * 100).toFixed(2),
				variance: (semanticStats.variance * 10000).toFixed(2),
				min: (semanticStats.min * 100).toFixed(2),
				max: (semanticStats.max * 100).toFixed(2),
				q1: (semanticStats.q1 * 100).toFixed(2),
				q3: (semanticStats.q3 * 100).toFixed(2),
				label: "Semantic Similarity (%)",
			},
			overallAccuracy: {
				mean: (accuracyStats.mean * 100).toFixed(2),
				median: (accuracyStats.median * 100).toFixed(2),
				stdDev: (accuracyStats.stdDev * 100).toFixed(2),
				variance: (accuracyStats.variance * 10000).toFixed(2),
				min: (accuracyStats.min * 100).toFixed(2),
				max: (accuracyStats.max * 100).toFixed(2),
				q1: (accuracyStats.q1 * 100).toFixed(2),
				q3: (accuracyStats.q3 * 100).toFixed(2),
				label: "Overall Diagnosis Score (%)",
			},
			triageAccuracy: {
				exactMatches: triageMatches,
				percentage: avgTriage.toFixed(2),
				totalEvaluated: evaluations.length,
				label: "Triage Level Match (%)",
			},
			responseTime: {
				mean: responseTimeStats.mean.toFixed(2),
				median: responseTimeStats.median.toFixed(2),
				stdDev: responseTimeStats.stdDev.toFixed(2),
				variance: responseTimeStats.variance.toFixed(2),
				min: responseTimeStats.min.toFixed(0),
				max: responseTimeStats.max.toFixed(0),
				q1: responseTimeStats.q1.toFixed(0),
				q3: responseTimeStats.q3.toFixed(0),
				label: "Response Time (ms)",
			},
			exportPaths: {
				csvRecords: "evaluation_records.csv",
				csvSummary: "evaluation_summary.csv",
				json: "evaluation_data.json",
				markdown: "EVALUATION_REPORT.md",
			},
			resultsDir: "mimic-iv-ed-demo-2.2/evaluation_results/",
		};

		console.log("\n✨ Evaluation complete!");
		console.log("\n📊 DIAGNOSTIC ACCURACY (Semantic Similarity):");
		console.log(
			`   Mean: ${summary.diagnosticAccuracy.mean}% ± ${summary.diagnosticAccuracy.stdDev}%`,
		);
		console.log(
			`   Median: ${summary.diagnosticAccuracy.median}%, Variance: ${summary.diagnosticAccuracy.variance}`,
		);
		console.log(
			`   Range: ${summary.diagnosticAccuracy.min}% - ${summary.diagnosticAccuracy.max}%`,
		);
		console.log(
			`   Q1: ${summary.diagnosticAccuracy.q1}%, Q3: ${summary.diagnosticAccuracy.q3}%`,
		);

		console.log("\n📊 OVERALL DIAGNOSIS SCORE:");
		console.log(
			`   Mean: ${summary.overallAccuracy.mean}% ± ${summary.overallAccuracy.stdDev}%`,
		);
		console.log(
			`   Median: ${summary.overallAccuracy.median}%, Variance: ${summary.overallAccuracy.variance}`,
		);
		console.log(
			`   Range: ${summary.overallAccuracy.min}% - ${summary.overallAccuracy.max}%`,
		);
		console.log(
			`   Q1: ${summary.overallAccuracy.q1}%, Q3: ${summary.overallAccuracy.q3}%`,
		);

		console.log("\n📊 TRIAGE ACCURACY:");
		console.log(
			`   Exact Matches: ${summary.triageAccuracy.exactMatches}/${summary.triageAccuracy.totalEvaluated} (${summary.triageAccuracy.percentage}%)`,
		);

		console.log("\n📊 RESPONSE TIME:");
		console.log(
			`   Mean: ${summary.responseTime.mean}ms ± ${summary.responseTime.stdDev}ms`,
		);
		console.log(
			`   Median: ${summary.responseTime.median}ms, Variance: ${summary.responseTime.variance}`,
		);
		console.log(
			`   Range: ${summary.responseTime.min}ms - ${summary.responseTime.max}ms`,
		);
		console.log(
			`   Q1: ${summary.responseTime.q1}ms, Q3: ${summary.responseTime.q3}ms`,
		);

		return NextResponse.json(summary);
	} catch (error) {
		console.error("❌ Evaluation error:", error);
		return NextResponse.json(
			{
				status: "error",
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
