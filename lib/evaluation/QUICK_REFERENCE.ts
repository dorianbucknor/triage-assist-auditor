// Quick reference for commonly used evaluation functions

import { DiagnosisEvaluationService } from "@/lib/evaluation/evaluation-service";
import { ResearchDataExporter } from "@/lib/evaluation/research-exporter";
import { HFSemanticSimilarity } from "@/lib/evaluation/hf-semantic";
import type { Scenario } from "@/lib/types";
import { DiagnosisEvaluationRecord } from "./types";

/**
 * QUICK START - Copy & Paste Examples
 *
 * NOTE: Now supports semantic similarity for better diagnosis comparison!
 * The functions are now async to support HF Inference API calls.
 */

// ============================================
// 0. INITIALIZE HF SEMANTIC SIMILARITY
// ============================================
export function initializeSemanticSimilarity(hfToken?: string) {
	// Option A: Use HF API (recommended)
	if (hfToken) {
		HFSemanticSimilarity.setApiToken(hfToken);
	}
	// Token is automatically picked up from process.env.HF_TOKEN on server-side

	// Option B: Use local transformers (requires @xenova/transformers)
	// await LocalSemanticSimilarity.initialize();

	console.log("Semantic similarity initialized");
}

// ============================================
// 1. EVALUATE A SINGLE SCENARIO
// ============================================
export async function evaluateSingleScenario(scenario: Scenario) {
	const evaluation = await DiagnosisEvaluationService.evaluateScenario(
		scenario,
		250, // response time in ms
	);

	console.log(
		"Diagnosis Accuracy (with semantic):",
		evaluation.metrics.diagnosisOverallScore,
	); // 0-1
	console.log("Triage Match:", evaluation.metrics.triageLevelMatch); // true/false
	console.log("Response Time:", evaluation.metrics.responseTimeMs, "ms");
	console.log("AI Confidence:", evaluation.metrics.aiConfidence); // 0-1

	return evaluation;
}

// ============================================
// 2. BATCH EVALUATE MULTIPLE SCENARIOS
// ============================================
export async function evaluateBatch(scenarios: Scenario[]) {
	// Evaluate all scenarios (now async for semantic similarity)
	const evaluations = await Promise.all(
		scenarios.map((s) =>
			DiagnosisEvaluationService.evaluateScenario(s, 300),
		),
	);

	// Generate research report
	const report = DiagnosisEvaluationService.generateReportSummary(
		evaluations,
		"TriageAssist",
	);

	console.log(`Evaluated ${evaluations.length} scenarios`);
	console.log(
		`Diagnosis Accuracy: ${report.diagnosisAccuracy.exactMatch.percentage.toFixed(1)}%`,
	);
	console.log(
		`Triage Accuracy: ${report.triageAccuracy.exactMatch.percentage.toFixed(1)}%`,
	);

	return { evaluations, report };
}

// ============================================
// 3. EXPORT TO MARKDOWN (For Papers)
// ============================================
export function exportMarkdownReport(evaluations: DiagnosisEvaluationRecord[]) {
	const report =
		DiagnosisEvaluationService.generateReportSummary(evaluations);
	const markdown = ResearchDataExporter.generateMarkdownReport(report);

	// Save to file or display
	console.log(markdown);

	// In a browser, download it
	const element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(markdown),
	);
	element.setAttribute("download", "evaluation-report.md");
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

// ============================================
// 4. EXPORT TO CSV (For Excel/Statistics)
// ============================================
export function exportCSV(evaluations: DiagnosisEvaluationRecord[]) {
	const csv = ResearchDataExporter.exportRecordsToCSV(evaluations);

	// Download
	const element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/csv;charset=utf-8," + encodeURIComponent(csv),
	);
	element.setAttribute("download", "evaluation-data.csv");
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);

	console.log("CSV exported");
}

// ============================================
// 5. EXPORT TO JSON (For Analysis Tools)
// ============================================
export function exportJSON(evaluations: DiagnosisEvaluationRecord[]) {
	const report =
		DiagnosisEvaluationService.generateReportSummary(evaluations);
	const json = ResearchDataExporter.exportToJSONString(report, evaluations);

	// Download
	const element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:application/json;charset=utf-8," + encodeURIComponent(json),
	);
	element.setAttribute("download", "evaluation-report.json");
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);

	console.log("JSON exported");
}

// ============================================
// 6. GET KEY STATISTICS
// ============================================
export function getKeyStats(evaluations: DiagnosisEvaluationRecord[]) {
	const report =
		DiagnosisEvaluationService.generateReportSummary(evaluations);

	return {
		// Diagnosis
		diagnosisExactMatch: `${report.diagnosisAccuracy.exactMatch.percentage.toFixed(1)}%`,
		diagnosisAvgScore: `${(report.diagnosisAccuracy.overallScore.average * 100).toFixed(1)}%`,

		// Triage
		triageExactMatch: `${report.triageAccuracy.exactMatch.percentage.toFixed(1)}%`,
		triageWithinOneLevel: `${report.triageAccuracy.withinOneLevel.percentage.toFixed(1)}%`,

		// Performance
		avgResponseTime: `${report.performanceMetrics.responseTime.average.toFixed(0)}ms`,
		fastResponses: `${report.performanceMetrics.responseSpeedDistribution.fast}`,
		slowResponses: `${report.performanceMetrics.responseSpeedDistribution.slow}`,

		// Confidence
		avgAIConfidence: `${(report.confidenceAnalysis.averageAIConfidence * 100).toFixed(1)}%`,
	};
}

// ============================================
// 7. INTEGRATION WITH YOUR PAGE
// ============================================
export async function integrateMetricsIntoUI(scenario: Scenario) {
	const evaluation =
		await DiagnosisEvaluationService.evaluateScenario(scenario);

	// This HTML shows how to display metrics
	const metricsHTML = `
    <div class="evaluation-card">
      <h3>AI Response Evaluation</h3>
      
      <div class="metric">
        <label>Diagnosis Accuracy:</label>
        <span>${(evaluation.metrics.diagnosisOverallScore * 100).toFixed(1)}%</span>
      </div>
      
      <div class="metric">
        <label>Triage Level:</label>
        <span>${evaluation.metrics.triageLevelMatch ? "✓ Correct" : "✗ Incorrect"}</span>
        ${
			evaluation.metrics.triageLevelDistance > 0
				? `<small>(off by ${evaluation.metrics.triageLevelDistance} level)</small>`
				: ""
		}
      </div>
      
      <div class="metric">
        <label>Response Speed:</label>
        <span>${evaluation.metrics.responseTimeMs}ms (${evaluation.metrics.processingSpeedCategory})</span>
      </div>
      
      <div class="metric">
        <label>AI Confidence:</label>
        <span>${(evaluation.metrics.aiConfidence * 100).toFixed(1)}%</span>
      </div>
      
      <div class="metric">
        <label>Clinical Significance:</label>
        <span>${evaluation.metrics.clinicalSignificance}</span>
      </div>
    </div>
  `;

	return metricsHTML;
}

// ============================================
// 8. FILTER EVALUATIONS BY CRITERIA
// ============================================
export function filterEvaluations(
	evaluations: DiagnosisEvaluationRecord[],
	criteria: {
		minAccuracy?: number; // 0-1
		maxResponseTime?: number; // ms
		triageMatchOnly?: boolean;
	},
) {
	return evaluations.filter((e) => {
		if (
			criteria.minAccuracy &&
			e.metrics.diagnosisOverallScore < criteria.minAccuracy
		) {
			return false;
		}
		if (
			criteria.maxResponseTime &&
			e.metrics.responseTimeMs > criteria.maxResponseTime
		) {
			return false;
		}
		if (criteria.triageMatchOnly && !e.metrics.triageLevelMatch) {
			return false;
		}
		return true;
	});
}

// ============================================
// 9. IDENTIFY PROBLEM CASES
// ============================================
export function findProblematicCases(evaluations: DiagnosisEvaluationRecord[]) {
	const lowAccuracy = evaluations.filter(
		(e) => e.metrics.diagnosisOverallScore < 0.5,
	);

	const triageMismatches = evaluations.filter(
		(e) => !e.metrics.triageLevelMatch,
	);

	const slowResponses = evaluations.filter(
		(e) => e.metrics.responseTimeMs > 1000,
	);

	const lowConfidence = evaluations.filter(
		(e) => e.metrics.aiConfidence < 0.5,
	);

	console.log("Cases to Review:");
	console.log(`- Low Diagnosis Accuracy (<50%): ${lowAccuracy.length}`);
	console.log(`- Triage Mismatches: ${triageMismatches.length}`);
	console.log(`- Slow Responses (>1000ms): ${slowResponses.length}`);
	console.log(`- Low AI Confidence: ${lowConfidence.length}`);

	return { lowAccuracy, triageMismatches, slowResponses, lowConfidence };
}

// ============================================
// 10. COMPLETE WORKFLOW EXAMPLE
// ============================================
export async function completeEvaluationWorkflow(scenarioIds: string[]) {
	// Step 1: Fetch scenarios
	const scenarios = await fetchScenariosFromDB(scenarioIds);

	// Step 2: Evaluate all (now async with semantic similarity)
	const evaluations = await Promise.all(
		scenarios.map((s) => DiagnosisEvaluationService.evaluateScenario(s)),
	);

	// Step 3: Get statistics
	const stats = getKeyStats(evaluations);
	console.log("Summary Statistics:", stats);

	// Step 4: Find problem cases
	const problems = findProblematicCases(evaluations);
	console.log("Problem Cases:", problems);

	// Step 5: Generate reports
	const report =
		DiagnosisEvaluationService.generateReportSummary(evaluations);

	// Step 6: Export all formats
	const markdown = ResearchDataExporter.generateMarkdownReport(report);
	const csv = ResearchDataExporter.exportRecordsToCSV(evaluations);
	const json = ResearchDataExporter.exportToJSONString(report, evaluations);

	// Step 7: Save or display
	return {
		report,
		markdown,
		csv,
		json,
		stats,
		problems,
	};
}

// Mock function - replace with your actual DB query
async function fetchScenariosFromDB(ids: string[]) {
	// Your implementation here
	return [];
}
