/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Run evaluations on all AI responses against ground truth scenarios
 * Includes semantic similarity via Hugging Face sentence transformers
 *
 * Usage: npx ts-node scripts/run-evaluations.ts
 * Or: npx tsx scripts/run-evaluations.ts
 */

import * as fs from "fs";
import * as path from "path";
import { DiagnosisEvaluationService } from "../lib/evaluation/evaluation-service";
import { ResearchDataExporter } from "../lib/evaluation/research-exporter";
import { DiagnosisEvaluationRecord } from "../lib/evaluation/types";
import { HFSemanticSimilarity } from "../lib/evaluation/hf-semantic";

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
			diagnosis: { primary: string; confidence: number; reason: string };
			triage: { level: number; confidence: number; reason: string };
			treatment: {
				recommendations: string;
				confidence: number;
				reason: string;
			};
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
	const filePath = path.join(
		__dirname,
		"../mimic-iv-ed-demo-2.2/ai response results.json",
	);
	const data = fs.readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(data);
	return parsed.items || [];
}

async function loadGroundTruthScenarios(): Promise<GroundTruthScenario[]> {
	const filePath = path.join(
		__dirname,
		"../mimic-iv-ed-demo-2.2/transformed_data/scenarios_default.json",
	);
	const data = fs.readFileSync(filePath, "utf-8");
	return JSON.parse(data);
}

function matchScenarios(
	aiResponses: AIResponse[],
	groundTruthScenarios: GroundTruthScenario[],
): Map<string, { ai: AIResponse; groundTruth: GroundTruthScenario }> {
	const map = new Map();

	// Create lookup by subjectId
	const groundTruthMap = new Map<string, GroundTruthScenario>();

	for (const gt of groundTruthScenarios) {
		if (!gt.id) {
			console.warn(
				`Ground truth scenario missing id: ${JSON.stringify(gt)}`,
			);
			continue;
		}

		groundTruthMap.set(gt.id!, gt);
	}

	for (const ai of aiResponses) {
		if (!ai.triageData.id) {
			console.warn(
				`AI response missing triageData.id: ${JSON.stringify(ai)}`,
			);
			continue;
		}

		const gt = groundTruthMap.get(ai.triageData.id);
		if (!gt) {
			console.warn(
				`No ground truth found for AI response with triageData.id: ${ai.triageData.id}`,
			);
			continue;
		}

		map.set(ai.triageData.id, { ai, groundTruth: gt });
	}

	return map;
}

async function runEvaluations(
	matched: Map<string, { ai: AIResponse; groundTruth: GroundTruthScenario }>,
): Promise<DiagnosisEvaluationRecord[]> {
	const evaluations: DiagnosisEvaluationRecord[] = [];
	const entries = Array.from(matched.entries());

	console.log(`\n📊 Running evaluations on ${entries.length} scenarios...`);
	console.log(
		"⏳ This may take a few minutes with semantic similarity calculations\n",
	);

	let count = 0;

	for (const [scenarioId, { ai, groundTruth }] of entries) {
		try {
			count++;
			if (count % 20 === 0) {
				console.log(`  ✓ Processed ${count}/${entries.length}...`);
			}

			// Create scenario object for evaluation service
			const scenario = {
				id: groundTruth.id || `gen-${crypto.randomUUID()}`,
				triageData: {
					subjectId: scenarioId,
					chiefComplaint: groundTruth.chiefComplaint,
					vitals: groundTruth.vitals,
					otherLabs: groundTruth.otherLabs,
				} as any,
				aiResponse: {
					diagnosis: {
						primary: ai.response.aiResponse.diagnosis.primary,
						confidence: ai.response.aiResponse.diagnosis.confidence,
						reason: ai.response.aiResponse.diagnosis.reason,
					},
					triage: {
						level: ai.response.aiResponse.triage.level,
						confidence: ai.response.aiResponse.triage.confidence,
						reason: ai.response.aiResponse.triage.reason,
					},
					treatment: {
						recommendations: ai.response.aiResponse.treatment.recommendations,
						confidence: ai.response.aiResponse.treatment.confidence,
						reason: ai.response.aiResponse.treatment.reason,
					},
				},
			} as any;

			// Run evaluation (async to support HF semantic similarity)
			const evaluation =
				await DiagnosisEvaluationService.evaluateScenario(
					scenario,
					ai.duration,
				);

			evaluations.push(evaluation);
		} catch (error) {
			console.error(`  ✗ Error evaluating ${scenarioId}:`, error);
		}
	}

	console.log(
		`\n✅ Completed ${evaluations.length}/${entries.length} evaluations\n`,
	);
	return evaluations;
}

async function exportResults(
	evaluations: DiagnosisEvaluationRecord[],
): Promise<void> {
	const outputDir = path.join(
		__dirname,
		"../mimic-iv-ed-demo-2.2/evaluation_results",
	);

	// Create output directory
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	console.log("📁 Exporting results...\n");

	// Generate report summary
	const report = DiagnosisEvaluationService.generateReportSummary(
		evaluations,
		"MIMIC-IV ED Triage AI Evaluation",
	);

	// Export CSV - Records
	const csvRecords = ResearchDataExporter.exportRecordsToCSV(evaluations);
	const csvRecordsPath = path.join(outputDir, "evaluation_records.csv");
	fs.writeFileSync(csvRecordsPath, csvRecords);
	console.log(`  ✓ Exported records to: evaluation_records.csv`);

	// Export CSV - Report Summary
	const csvReport = ResearchDataExporter.exportReportToCSV(report);
	const csvReportPath = path.join(outputDir, "evaluation_summary.csv");
	fs.writeFileSync(csvReportPath, csvReport);
	console.log(`  ✓ Exported summary to: evaluation_summary.csv`);

	// Export JSON
	const jsonExport = ResearchDataExporter.exportToJSON(report, evaluations);
	const jsonPath = path.join(outputDir, "evaluation_data.json");
	fs.writeFileSync(jsonPath, JSON.stringify(jsonExport, null, 2));
	console.log(`  ✓ Exported JSON to: evaluation_data.json`);

	// Export Markdown Report
	const markdown = ResearchDataExporter.generateMarkdownReport(report);
	const markdownPath = path.join(outputDir, "EVALUATION_REPORT.md");
	fs.writeFileSync(markdownPath, markdown);
	console.log(`  ✓ Exported report to: EVALUATION_REPORT.md`);

	console.log(
		`\n📍 Results saved to: mimic-iv-ed-demo-2.2/evaluation_results/\n`,
	);
}

async function main() {
	console.log("🚀 TriageAssist AI Evaluation Framework");
	console.log("=====================================\n");

	try {
		// Initialize semantic similarity if token is available
		if (process.env.HF_TOKEN) {
			HFSemanticSimilarity.setApiToken(process.env.HF_TOKEN);
			console.log("✓ Hugging Face semantic similarity enabled");
		} else {
			console.log(
				"⚠️  No HF_TOKEN found - semantic similarity will default to 0",
			);
			console.log(
				"   Set HF_TOKEN in .env.local for full semantic comparison\n",
			);
		}

		// Load data
		console.log("📂 Loading data...\n");
		const aiResponses = await loadAIResponses();
		const groundTruthScenarios = await loadGroundTruthScenarios();
		console.log(`  ✓ Loaded ${aiResponses.length} AI responses`);
		console.log(
			`  ✓ Loaded ${groundTruthScenarios.length} ground truth scenarios\n`,
		);

		// Match scenarios
		const matched = matchScenarios(aiResponses, groundTruthScenarios);
		console.log(`🔗 Matched ${matched.size} scenarios\n`);

		// Run evaluations
		const evaluations = await runEvaluations(matched);

		// Export results
		await exportResults(evaluations);

		// Print summary
		console.log("📊 Evaluation Summary");
		console.log("====================");
		console.log(`Total Scenarios: ${evaluations.length}`);
		console.log(
			`Avg Semantic Similarity: ${(
				(evaluations.reduce(
					(sum, e) =>
						sum + (e.metrics.diagnosisSemanticSimilarity || 0),
					0,
				) /
					evaluations.length) *
				100
			).toFixed(2)}%`,
		);
		console.log(
			`Avg Diagnosis Accuracy: ${(
				(evaluations.reduce(
					(sum, e) => sum + (e.metrics.diagnosisOverallScore || 0),
					0,
				) /
					evaluations.length) *
				100
			).toFixed(2)}%`,
		);
		const triageMatches = evaluations.filter(
			(e) => e.metrics.triageLevelMatch,
		).length;
		console.log(
			`Avg Triage Accuracy: ${(
				(triageMatches / evaluations.length) *
				100
			).toFixed(2)}%`,
		);
		console.log(
			`Avg Response Time: ${(
				evaluations.reduce(
					(sum, e) => sum + (e.metrics.responseTimeMs || 0),
					0,
				) / evaluations.length
			).toFixed(0)}ms`,
		);

		console.log("\n✨ Evaluation complete!");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

main();
