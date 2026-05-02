import {
	DiagnosisEvaluationRecord,
	ResearchReportSummary,
	ResearchDataExport,
} from "./types";

/**
 * Export utilities for research data
 */
export class ResearchDataExporter {
	/**
	 * Export detailed records to CSV format
	 */
	static exportRecordsToCSV(records: DiagnosisEvaluationRecord[]): string {
		const headers = [
			"ScenarioId",
			"SubjectId",
			"ChiefComplaint",
			"GroundTruthAcuity",
			"AIPredictedDiagnosis",
			"DiagnosisExactMatch",
			"DiagnosisOverallScore",
			"TriageLevelMatch",
			"TriageLevelDistance",
			"ResponseTimeMs",
			"AIConfidence",
			"ClinicalSignificance",
			"EvaluationDate",
			"IncludeInStudy",
		];

		const rows = records.map((r) => [
			r.scenarioId,
			r.subjectId,
			`"${r.groundTruth.chiefComplaint}"`,
			r.groundTruth.acuity || "N/A",
			`"${r.aiPrediction.diagnosis}"`,
			r.metrics.diagnosisExactMatch ? "Yes" : "No",
			r.metrics.diagnosisOverallScore.toFixed(3),
			r.metrics.triageLevelMatch ? "Yes" : "No",
			r.metrics.triageLevelDistance,
			r.metrics.responseTimeMs,
			r.metrics.aiConfidence.toFixed(3),
			r.metrics.clinicalSignificance,
			r.research.evaluationDate.toISOString(),
			r.research.includeInStudy ? "Yes" : "No",
		]);

		return [headers.join(","), ...rows.map((row) => row.join(","))].join(
			"\n",
		);
	}

	/**
	 * Export report summary to CSV format
	 */
	static exportReportToCSV(report: ResearchReportSummary): string {
		const lines: string[] = [];

		// Header
		lines.push("TRIAGEASSIST RESEARCH EVALUATION REPORT");
		lines.push(`Report ID,${report.reportId}`);
		lines.push(`Generated,${report.generatedAt.toISOString()}`);
		lines.push(`Project,${report.projectName}`);
		lines.push("");

		// Overview
		lines.push("EVALUATION OVERVIEW");
		lines.push(
			`Total Scenarios Evaluated,${report.totalScenariosEvaluated}`,
		);
		lines.push(`Scenarios Included,${report.totalScenariosIncluded}`);
		lines.push(`Scenarios Excluded,${report.excludedCount}`);
		lines.push("");

		// Diagnosis Accuracy
		lines.push("DIAGNOSIS ACCURACY");
		lines.push(
			`Exact Match,${report.diagnosisAccuracy.exactMatch.count},${report.diagnosisAccuracy.exactMatch.percentage.toFixed(2)}%`,
		);
		lines.push(
			`Keyword Match Average,${report.diagnosisAccuracy.keywordMatch.average.toFixed(3)}`,
		);
		lines.push(
			`Levenshtein Similarity Average,${report.diagnosisAccuracy.levenshteinSimilarity.average.toFixed(3)}`,
		);
		lines.push(
			`Overall Score Average,${report.diagnosisAccuracy.overallScore.average.toFixed(3)}`,
		);
		lines.push(
			`Overall Score Median,${report.diagnosisAccuracy.overallScore.median.toFixed(3)}`,
		);
		lines.push("");

		// Triage Accuracy
		lines.push("TRIAGE ACCURACY");
		lines.push(
			`Exact Match,${report.triageAccuracy.exactMatch.count},${report.triageAccuracy.exactMatch.percentage.toFixed(2)}%`,
		);
		lines.push(
			`Within One Level,${report.triageAccuracy.withinOneLevel.count},${report.triageAccuracy.withinOneLevel.percentage.toFixed(2)}%`,
		);
		lines.push("");

		// Performance
		lines.push("PERFORMANCE METRICS");
		lines.push(
			`Average Response Time (ms),${report.performanceMetrics.responseTime.average.toFixed(2)}`,
		);
		lines.push(
			`Median Response Time (ms),${report.performanceMetrics.responseTime.median.toFixed(2)}`,
		);
		lines.push(
			`Min Response Time (ms),${report.performanceMetrics.responseTime.min.toFixed(2)}`,
		);
		lines.push(
			`Max Response Time (ms),${report.performanceMetrics.responseTime.max.toFixed(2)}`,
		);
		lines.push("");

		// Confidence Analysis
		lines.push("CONFIDENCE ANALYSIS");
		lines.push(
			`Average AI Confidence,${report.confidenceAnalysis.averageAIConfidence.toFixed(3)}`,
		);
		lines.push(
			`High Confidence Accuracy,${report.confidenceAnalysis.confidenceVsAccuracy.highConfidence.average.toFixed(3)}`,
		);
		lines.push(
			`Medium Confidence Accuracy,${report.confidenceAnalysis.confidenceVsAccuracy.mediumConfidence.average.toFixed(3)}`,
		);
		lines.push(
			`Low Confidence Accuracy,${report.confidenceAnalysis.confidenceVsAccuracy.lowConfidence.average.toFixed(3)}`,
		);
		lines.push("");

		// Recommendations
		if (report.recommendations.strengths.length > 0) {
			lines.push("STRENGTHS");
			report.recommendations.strengths.forEach((s) =>
				lines.push(`- ${s}`),
			);
			lines.push("");
		}

		if (report.recommendations.areasForImprovement.length > 0) {
			lines.push("AREAS FOR IMPROVEMENT");
			report.recommendations.areasForImprovement.forEach((a) =>
				lines.push(`- ${a}`),
			);
			lines.push("");
		}

		return lines.join("\n");
	}

	/**
	 * Export to JSON format
	 */
	static exportToJSON(
		reportSummary: ResearchReportSummary,
		detailedRecords: DiagnosisEvaluationRecord[],
	): ResearchDataExport {
		return {
			reportSummary,
			detailedRecords,
			timestamp: new Date(),
			exportFormat: "json",
		};
	}

	/**
	 * Export to JSON string
	 */
	static exportToJSONString(
		reportSummary: ResearchReportSummary,
		detailedRecords: DiagnosisEvaluationRecord[],
	): string {
		const data = this.exportToJSON(reportSummary, detailedRecords);
		return JSON.stringify(data, null, 2);
	}

	/**
	 * Generate a detailed markdown report for research presentation
	 */
	static generateMarkdownReport(
		reportSummary: ResearchReportSummary,
		includeDetailedTables: boolean = true,
	): string {
		let markdown = "";

		// Title and metadata
		markdown += `# TriageAssist AI Diagnosis Evaluation Report\n\n`;
		markdown += `**Report ID:** ${reportSummary.reportId}\n`;
		markdown += `**Generated:** ${reportSummary.generatedAt.toLocaleDateString()}\n`;
		markdown += `**Project:** ${reportSummary.projectName}\n\n`;

		// Executive Summary
		markdown += `## Executive Summary\n\n`;
		markdown += `- **Total Scenarios Evaluated:** ${reportSummary.totalScenariosEvaluated}\n`;
		markdown += `- **Scenarios Included in Analysis:** ${reportSummary.totalScenariosIncluded}\n`;
		markdown += `- **Scenarios Excluded:** ${reportSummary.excludedCount}\n`;
		markdown += `- **Evaluation Period:** ${reportSummary.evaluationPeriod.startDate.toLocaleDateString()} to ${reportSummary.evaluationPeriod.endDate.toLocaleDateString()}\n\n`;

		// Diagnosis Accuracy
		markdown += `## Diagnosis Accuracy\n\n`;
		markdown += `### Overview\n`;
		markdown += `| Metric | Value |\n`;
		markdown += `|--------|-------|\n`;
		markdown += `| Exact Match | ${reportSummary.diagnosisAccuracy.exactMatch.count}/${reportSummary.totalScenariosIncluded} (${reportSummary.diagnosisAccuracy.exactMatch.percentage.toFixed(1)}%) |\n`;
		markdown += `| Avg Keyword Match | ${reportSummary.diagnosisAccuracy.keywordMatch.average.toFixed(3)} |\n`;
		markdown += `| Avg Levenshtein Similarity | ${reportSummary.diagnosisAccuracy.levenshteinSimilarity.average.toFixed(3)} |\n`;
		markdown += `| Overall Accuracy Score | ${reportSummary.diagnosisAccuracy.overallScore.average.toFixed(3)} ± ${reportSummary.diagnosisAccuracy.overallScore.standardDeviation.toFixed(3)} |\n\n`;

		markdown += `### Diagnosis Accuracy Distribution\n`;
		markdown += `- **>80% Accurate:** ${reportSummary.diagnosisAccuracy.levenshteinSimilarity.percentageAbove80.toFixed(1)}%\n`;
		markdown += `- **>60% Accurate:** ${reportSummary.diagnosisAccuracy.levenshteinSimilarity.percentageAbove60.toFixed(1)}%\n\n`;

		// Triage Accuracy
		markdown += `## Triage Level Accuracy\n\n`;
		markdown += `| Metric | Value |\n`;
		markdown += `|--------|-------|\n`;
		markdown += `| Exact Match | ${reportSummary.triageAccuracy.exactMatch.count}/${reportSummary.totalScenariosIncluded} (${reportSummary.triageAccuracy.exactMatch.percentage.toFixed(1)}%) |\n`;
		markdown += `| Within One Level | ${reportSummary.triageAccuracy.withinOneLevel.count}/${reportSummary.totalScenariosIncluded} (${reportSummary.triageAccuracy.withinOneLevel.percentage.toFixed(1)}%) |\n\n`;

		markdown += `### Triage Distribution\n`;
		markdown += `- **Exact Match:** ${reportSummary.triageAccuracy.distribution.exact}\n`;
		markdown += `- **Off by 1 Level:** ${reportSummary.triageAccuracy.distribution.offByOne}\n`;
		markdown += `- **Off by 2 Levels:** ${reportSummary.triageAccuracy.distribution.offByTwo}\n`;
		markdown += `- **Off by 3+ Levels:** ${reportSummary.triageAccuracy.distribution.offByThreeOrMore}\n\n`;

		// Performance
		markdown += `## Performance Metrics\n\n`;
		markdown += `| Metric | Value |\n`;
		markdown += `|--------|-------|\n`;
		markdown += `| Average Response Time | ${reportSummary.performanceMetrics.responseTime.average.toFixed(2)} ms |\n`;
		markdown += `| Median Response Time | ${reportSummary.performanceMetrics.responseTime.median.toFixed(2)} ms |\n`;
		markdown += `| Min Response Time | ${reportSummary.performanceMetrics.responseTime.min.toFixed(2)} ms |\n`;
		markdown += `| Max Response Time | ${reportSummary.performanceMetrics.responseTime.max.toFixed(2)} ms |\n\n`;

		markdown += `### Response Speed Distribution\n`;
		markdown += `- **Fast (<100ms):** ${reportSummary.performanceMetrics.responseSpeedDistribution.fast}\n`;
		markdown += `- **Normal (100-1000ms):** ${reportSummary.performanceMetrics.responseSpeedDistribution.normal}\n`;
		markdown += `- **Slow (>1000ms):** ${reportSummary.performanceMetrics.responseSpeedDistribution.slow}\n\n`;

		// Confidence Analysis
		markdown += `## AI Confidence Analysis\n\n`;
		markdown += `| Confidence Level | Count | Avg Accuracy |\n`;
		markdown += `|------------------|-------|---------------|\n`;
		markdown += `| High (≥0.7) | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.highConfidence.count} | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.highConfidence.average.toFixed(3)} |\n`;
		markdown += `| Medium (0.4-0.7) | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.mediumConfidence.count} | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.mediumConfidence.average.toFixed(3)} |\n`;
		markdown += `| Low (<0.4) | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.lowConfidence.count} | ${reportSummary.confidenceAnalysis.confidenceVsAccuracy.lowConfidence.average.toFixed(3)} |\n\n`;

		// Top Diagnoses
		if (reportSummary.analysis.topAccurateDiagnoses.length > 0) {
			markdown += `## Top Accurate Diagnoses\n\n`;
			markdown += `| Diagnosis | Count | Accuracy |\n`;
			markdown += `|-----------|-------|----------|\n`;
			reportSummary.analysis.topAccurateDiagnoses
				.slice(0, 10)
				.forEach((d) => {
					markdown += `| ${d.diagnosis} | ${d.count} | ${(d.accuracy * 100).toFixed(1)}% |\n`;
				});
			markdown += `\n`;
		}

		// Common Misdiagnoses
		if (reportSummary.analysis.commonMisdiagnoses.length > 0) {
			markdown += `## Common Misdiagnoses\n\n`;
			markdown += `| Ground Truth | Predicted | Frequency |\n`;
			markdown += `|--------------|-----------|----------|\n`;
			reportSummary.analysis.commonMisdiagnoses
				.slice(0, 10)
				.forEach((m) => {
					markdown += `| ${m.actual} | ${m.predicted} | ${m.frequency} |\n`;
				});
			markdown += `\n`;
		}

		// Strengths and Recommendations
		markdown += `## Key Findings\n\n`;

		if (reportSummary.recommendations.strengths.length > 0) {
			markdown += `### Strengths\n`;
			reportSummary.recommendations.strengths.forEach((s) => {
				markdown += `- ${s}\n`;
			});
			markdown += `\n`;
		}

		if (reportSummary.recommendations.areasForImprovement.length > 0) {
			markdown += `### Areas for Improvement\n`;
			reportSummary.recommendations.areasForImprovement.forEach((a) => {
				markdown += `- ${a}\n`;
			});
			markdown += `\n`;
		}

		// Methodology note
		markdown += `## Methodology\n\n`;
		markdown += `This evaluation uses the following metrics:\n`;
		markdown += `- **Diagnosis Accuracy:** Weighted combination of exact match (40%), Levenshtein similarity (30%), and keyword match (30%)\n`;
		markdown += `- **Triage Accuracy:** ESI level comparison\n`;
		markdown += `- **Performance:** Response time in milliseconds\n`;
		markdown += `- **Confidence:** AI system's stated confidence in the diagnosis\n\n`;

		return markdown;
	}

	/**
	 * Save exported data to file (for Node.js/backend use)
	 */
	static async saveToFile(
		data: string,
		filename: string,
		format: "csv" | "json" | "md" = "csv",
	): Promise<void> {
		// This would require fs module - implement in API route or backend
		console.log(`Would save ${filename}.${format}`);
	}
}
