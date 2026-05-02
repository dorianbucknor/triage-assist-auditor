/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	DiagnosisEvaluationRecord,
	ResearchReportSummary,
	EvaluationMetrics,
	RESPONSE_TIME_CATEGORIES,
	ACCURACY_SCORING_WEIGHTS,
} from "./types";
import {
	compareTriageLevels,
	calculateDiagnosisAccuracyScore,
	compareDiagnoses,
} from "./diagnosis-evaluator";
import { Scenario, TriageData } from "@/lib/types";
import { HFSemanticSimilarity } from "./hf-semantic";

/**
 * Main evaluation service for batch evaluating scenarios against ground truth
 * Now supports semantic similarity for more intelligent diagnosis comparison
 */
export class DiagnosisEvaluationService {
	/**
	 * Evaluate a single scenario
	 * Now async to support HF semantic similarity lookups
	 */
	static async evaluateScenario(
		scenario: Scenario,
		responseTimeMs: number = 0,
		evaluatorId?: string,
	): Promise<DiagnosisEvaluationRecord> {
		const metrics = await this.calculateMetrics(
			scenario.triageData!,
			scenario.aiResponse,
			responseTimeMs,
		);

		return {
			scenarioId: scenario.id,
			subjectId: scenario.triageData?.subjectId || "unknown",
			evaluationId: `eval-${scenario.id}-${Date.now()}`,

			groundTruth: {
				chiefComplaint: scenario.triageData?.chiefComplaint.title || "",
				acuity: (scenario.triageData?.otherLabs as any)?.acuity,
				inTime: scenario.triageData?.inTime || new Date(),
				outTime: scenario.triageData?.outTime || new Date(),
				triageDuration: scenario.triageData?.triageDuration || 0,
				modeOfArrival: scenario.triageData?.modeOfArrival || "",
				gender: scenario.triageData?.gender,
				vitals: scenario.triageData?.vitals,
			},

			aiPrediction: {
				diagnosis: scenario.aiResponse.diagnosis.primary,
				triageLevel: scenario.aiResponse.triage.level,
				treatment: Array.isArray(
					scenario.aiResponse.treatment.recommendations,
				)
					? scenario.aiResponse.treatment.recommendations.join("; ")
					: scenario.aiResponse.treatment.recommendations,
				confidence: scenario.aiResponse.diagnosis.confidence,
				reasoningExplanation: scenario.aiResponse.diagnosis.reason,
			},

			metrics,

			research: {
				evaluationDate: new Date(),
				evaluationType: evaluatorId ? "manual" : "automated",
				evaluatorId,
				includeInStudy: true,
			},
		};
	}

	/**
	 * Calculate evaluation metrics for a single scenario
	 * Now async to support HF semantic similarity
	 */
	private static async calculateMetrics(
		triageData: TriageData,
		aiResponse: any,
		responseTimeMs: number,
	): Promise<EvaluationMetrics> {
		const groundTruthDiagnosis = triageData?.chiefComplaint.title || "";
		const aiDiagnosis = aiResponse.diagnosis.primary || "";
		const groundTruthTriage = (triageData?.otherLabs as any)?.acuity;
		const aiTriage = aiResponse.triage.level;

		// Diagnosis metrics (now async with HF semantic similarity)
		const diagnosisComparison = await compareDiagnoses(
			groundTruthDiagnosis,
			aiDiagnosis,
			aiResponse.diagnosis.confidence,
		);

		// Triage metrics
		const triageComparison = compareTriageLevels(
			Number.parseInt(groundTruthTriage as string, 10).toString() || "0",
			Number.parseInt(aiTriage as string, 10).toString() || "0",
		);

		// Response time category
		let processingSpeedCategory: "fast" | "normal" | "slow" = "normal";
		if (responseTimeMs < RESPONSE_TIME_CATEGORIES.fast) {
			processingSpeedCategory = "fast";
		} else if (responseTimeMs > RESPONSE_TIME_CATEGORIES.normal) {
			processingSpeedCategory = "slow";
		}

		// Overall accuracy score (now includes semantic similarity)
		const diagnosisOverallScore =
			calculateDiagnosisAccuracyScore(diagnosisComparison);

		return {
			// Diagnosis
			diagnosisExactMatch: diagnosisComparison.exactMatch,
			diagnosisSemanticSimilarity: diagnosisComparison.semanticSimilarity,
			diagnosisKeywordMatch: diagnosisComparison.keywordMatch,
			diagnosisLevenshteinSimilarity:
				diagnosisComparison.levenshteinSimilarity,
			diagnosisOverallScore,

			// Triage
			triageLevelMatch: triageComparison.match,
			triageLevelDistance: triageComparison.distance,
			triageLevelAccuracy: triageComparison.accuracy as any,

			// Performance
			responseTimeMs,
			processingSpeedCategory,

			// Confidence
			aiConfidence: aiResponse.diagnosis.confidence,
			clinicalSignificance: this.assessClinicalSignificance(
				diagnosisOverallScore,
				triageComparison.distance,
			),
		};
	}

	/**
	 * Assess clinical significance of the evaluation
	 */
	private static assessClinicalSignificance(
		diagnosisScore: number,
		triageDistance: number,
	): "high" | "medium" | "low" {
		// High significance: accurate diagnosis and exact triage match
		if (diagnosisScore > 0.8 && triageDistance === 0) {
			return "high";
		}
		// Low significance: poor diagnosis and far triage match
		if (diagnosisScore < 0.5 && triageDistance >= 2) {
			return "low";
		}
		return "medium";
	}

	/**
	 * Generate research report summary from evaluated scenarios
	 */
	static generateReportSummary(
		records: DiagnosisEvaluationRecord[],
		projectName: string = "TriageAssist",
	): ResearchReportSummary {
		const included = records.filter((r) => r.research.includeInStudy);
		const excluded = records.length - included.length;

		// Diagnosis metrics
		const diagnosisScores = included.map(
			(r) => r.metrics.diagnosisOverallScore,
		);
		const exactMatches = included.filter(
			(r) => r.metrics.diagnosisExactMatch,
		).length;
		const keywordMatches = included.map(
			(r) => r.metrics.diagnosisKeywordMatch,
		);
		const levenshteinScores = included.map(
			(r) => r.metrics.diagnosisLevenshteinSimilarity,
		);

		// Triage metrics
		const triageExact = included.filter(
			(r) => r.metrics.triageLevelMatch,
		).length;
		const triageWithinOne = included.filter(
			(r) => r.metrics.triageLevelDistance <= 1,
		).length;

		// Response time metrics
		const responseTimes = included.map((r) => r.metrics.responseTimeMs);

		// Build report
		const report: ResearchReportSummary = {
			reportId: `report-${Date.now()}`,
			projectName,
			generatedAt: new Date(),
			totalScenariosEvaluated: records.length,
			totalScenariosIncluded: included.length,
			excludedCount: excluded,
			evaluationPeriod: {
				startDate: new Date(
					Math.min(
						...included.map((r) =>
							r.research.evaluationDate.getTime(),
						),
					),
				),
				endDate: new Date(),
			},

			diagnosisAccuracy: {
				exactMatch: {
					count: exactMatches,
					percentage: (exactMatches / included.length) * 100,
				},
				keywordMatch: {
					average:
						keywordMatches.reduce((a, b) => a + b, 0) /
						keywordMatches.length,
					percentageAbove80:
						(keywordMatches.filter((s) => s > 0.8).length /
							keywordMatches.length) *
						100,
					percentageAbove60:
						(keywordMatches.filter((s) => s > 0.6).length /
							keywordMatches.length) *
						100,
				},
				levenshteinSimilarity: {
					average:
						levenshteinScores.reduce((a, b) => a + b, 0) /
						levenshteinScores.length,
					percentageAbove80:
						(levenshteinScores.filter((s) => s > 0.8).length /
							levenshteinScores.length) *
						100,
					percentageAbove60:
						(levenshteinScores.filter((s) => s > 0.6).length /
							levenshteinScores.length) *
						100,
				},
				overallScore: {
					average:
						diagnosisScores.reduce((a, b) => a + b, 0) /
						diagnosisScores.length,
					median: this.calculateMedian(diagnosisScores),
					standardDeviation: this.calculateStdDev(diagnosisScores),
				},
			},

			triageAccuracy: {
				exactMatch: {
					count: triageExact,
					percentage: (triageExact / included.length) * 100,
				},
				withinOneLevel: {
					count: triageWithinOne,
					percentage: (triageWithinOne / included.length) * 100,
				},
				distribution: {
					exact: triageExact,
					offByOne: included.filter(
						(r) => r.metrics.triageLevelDistance === 1,
					).length,
					offByTwo: included.filter(
						(r) => r.metrics.triageLevelDistance === 2,
					).length,
					offByThreeOrMore: included.filter(
						(r) => r.metrics.triageLevelDistance >= 3,
					).length,
				},
				byLevel: this.buildTriageDistribution(included),
			},

			performanceMetrics: {
				responseTime: {
					average:
						responseTimes.reduce((a, b) => a + b, 0) /
						responseTimes.length,
					median: this.calculateMedian(responseTimes),
					min: Math.min(...responseTimes),
					max: Math.max(...responseTimes),
					stdDev: this.calculateStdDev(responseTimes),
				},
				responseSpeedDistribution: {
					fast: included.filter(
						(r) => r.metrics.processingSpeedCategory === "fast",
					).length,
					normal: included.filter(
						(r) => r.metrics.processingSpeedCategory === "normal",
					).length,
					slow: included.filter(
						(r) => r.metrics.processingSpeedCategory === "slow",
					).length,
				},
			},

			confidenceAnalysis: {
				averageAIConfidence:
					included.reduce(
						(sum, r) => sum + r.metrics.aiConfidence,
						0,
					) / included.length,
				confidenceVsAccuracy: {
					highConfidence: {
						average: this.getAverageAccuracyForConfidenceRange(
							included,
							0.7,
							1,
						),
						count: included.filter(
							(r) => r.metrics.aiConfidence >= 0.7,
						).length,
					},
					mediumConfidence: {
						average: this.getAverageAccuracyForConfidenceRange(
							included,
							0.4,
							0.7,
						),
						count: included.filter(
							(r) =>
								r.metrics.aiConfidence >= 0.4 &&
								r.metrics.aiConfidence < 0.7,
						).length,
					},
					lowConfidence: {
						average: this.getAverageAccuracyForConfidenceRange(
							included,
							0,
							0.4,
						),
						count: included.filter(
							(r) => r.metrics.aiConfidence < 0.4,
						).length,
					},
				},
			},

			analysis: {
				topAccurateDiagnoses: this.getTopAccurateDiagnoses(
					included,
					10,
				),
				commonMisdiagnoses: this.getCommonMisdiagnoses(included, 10),
				difficultCases: this.getDifficultCases(included, 10),
				triageLevelCorrelation: this.calculateCorrelation(
					included.map((r) => r.metrics.diagnosisOverallScore),
					included.map((r) => (r.metrics.triageLevelMatch ? 1 : 0)),
				),
			},

			recommendations: {
				strengths: [],
				areasForImprovement: [],
				suggestedActions: [],
			},

			statistics: {
				diagnosisCorrelationWithTriageAccuracy: 0,
				diagnosisCorrelationWithResponseTime: 0,
				triageAccuracyByChiefComplaintCategory: {},
			},
		};

		// Now populate recommendations after report is fully initialized
		report.recommendations.strengths = this.identifyStrengths(report);
		report.recommendations.areasForImprovement =
			this.identifyAreasForImprovement(report);

		return report;
	}

	// Utility methods
	private static calculateMedian(values: number[]): number {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2
			? sorted[mid]
			: (sorted[mid - 1] + sorted[mid]) / 2;
	}

	private static calculateStdDev(values: number[]): number {
		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		const sq = values.map((v) => Math.pow(v - mean, 2));
		return Math.sqrt(sq.reduce((a, b) => a + b, 0) / values.length);
	}

	private static calculateCorrelation(x: number[], y: number[]): number {
		const n = x.length;
		const meanX = x.reduce((a, b) => a + b, 0) / n;
		const meanY = y.reduce((a, b) => a + b, 0) / n;

		const cov =
			x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) /
			n;
		const stdX = Math.sqrt(
			x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0) / n,
		);
		const stdY = Math.sqrt(
			y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0) / n,
		);

		return stdX * stdY === 0 ? 0 : cov / (stdX * stdY);
	}

	private static buildTriageDistribution(
		records: DiagnosisEvaluationRecord[],
	): Record<string, any> {
		const distribution: Record<string, any> = {};
		records.forEach((r) => {
			const level = r.aiPrediction.triageLevel;
			if (!distribution[level]) {
				distribution[level] = { count: 0, accuracy: 0 };
			}
			distribution[level].count++;
			distribution[level].accuracy += r.metrics.triageLevelMatch ? 1 : 0;
		});

		Object.keys(distribution).forEach((key) => {
			distribution[key].accuracy /= distribution[key].count;
		});

		return distribution;
	}

	private static getAverageAccuracyForConfidenceRange(
		records: DiagnosisEvaluationRecord[],
		min: number,
		max: number,
	): number {
		const filtered = records.filter(
			(r) =>
				r.metrics.aiConfidence >= min && r.metrics.aiConfidence < max,
		);
		if (filtered.length === 0) return 0;
		return (
			filtered.reduce(
				(sum, r) => sum + r.metrics.diagnosisOverallScore,
				0,
			) / filtered.length
		);
	}

	private static getTopAccurateDiagnoses(
		records: DiagnosisEvaluationRecord[],
		limit: number,
	): Array<{ diagnosis: string; count: number; accuracy: number }> {
		const diagnosisMap = new Map<
			string,
			{ count: number; totalAccuracy: number }
		>();

		records.forEach((r) => {
			const diagnosis = r.aiPrediction.diagnosis;
			if (!diagnosisMap.has(diagnosis)) {
				diagnosisMap.set(diagnosis, { count: 0, totalAccuracy: 0 });
			}
			const entry = diagnosisMap.get(diagnosis)!;
			entry.count++;
			entry.totalAccuracy += r.metrics.diagnosisOverallScore;
		});

		return Array.from(diagnosisMap.entries())
			.map(([diagnosis, data]) => ({
				diagnosis,
				count: data.count,
				accuracy: data.totalAccuracy / data.count,
			}))
			.sort((a, b) => b.accuracy - a.accuracy)
			.slice(0, limit);
	}

	private static getCommonMisdiagnoses(
		records: DiagnosisEvaluationRecord[],
		limit: number,
	): Array<{
		actual: string;
		predicted: string;
		frequency: number;
		averageAccuracyScore: number;
	}> {
		const misdiagnosisMap = new Map<
			string,
			{ frequency: number; totalAccuracy: number }
		>();

		records.forEach((r) => {
			if (!r.metrics.diagnosisExactMatch) {
				const key = `${r.groundTruth.chiefComplaint}|${r.aiPrediction.diagnosis}`;
				if (!misdiagnosisMap.has(key)) {
					misdiagnosisMap.set(key, {
						frequency: 0,
						totalAccuracy: 0,
					});
				}
				const entry = misdiagnosisMap.get(key)!;
				entry.frequency++;
				entry.totalAccuracy += r.metrics.diagnosisOverallScore;
			}
		});

		return Array.from(misdiagnosisMap.entries())
			.map(([key, data]) => {
				const [actual, predicted] = key.split("|");
				return {
					actual,
					predicted,
					frequency: data.frequency,
					averageAccuracyScore: data.totalAccuracy / data.frequency,
				};
			})
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, limit);
	}

	private static getDifficultCases(
		records: DiagnosisEvaluationRecord[],
		limit: number,
	): Array<{
		scenarioId: string;
		subjectId: string;
		chiefComplaint: string;
		accuracyScore: number;
		reason?: string;
	}> {
		return records
			.map((r) => ({
				scenarioId: r.scenarioId,
				subjectId: r.subjectId,
				chiefComplaint: r.groundTruth.chiefComplaint,
				accuracyScore: r.metrics.diagnosisOverallScore,
				reason:
					r.metrics.triageLevelDistance > 1
						? "Triage mismatch"
						: "Diagnosis mismatch",
			}))
			.sort((a, b) => a.accuracyScore - b.accuracyScore)
			.slice(0, limit);
	}

	private static identifyStrengths(report: any): string[] {
		const strengths: string[] = [];

		if (report.diagnosisAccuracy.exactMatch.percentage > 60) {
			strengths.push(
				`High exact match rate (${report.diagnosisAccuracy.exactMatch.percentage.toFixed(1)}%)`,
			);
		}
		if (report.triageAccuracy.exactMatch.percentage > 70) {
			strengths.push(
				`Accurate triage level assignment (${report.triageAccuracy.exactMatch.percentage.toFixed(1)}%)`,
			);
		}
		if (report.performanceMetrics.responseTime.average < 500) {
			strengths.push(
				`Fast response times (${report.performanceMetrics.responseTime.average.toFixed(0)}ms average)`,
			);
		}

		return strengths;
	}

	private static identifyAreasForImprovement(report: any): string[] {
		const areas: string[] = [];

		if (report.diagnosisAccuracy.exactMatch.percentage < 60) {
			areas.push("Diagnosis accuracy could be improved");
		}
		if (report.triageAccuracy.exactMatch.percentage < 70) {
			areas.push("Triage level assignment accuracy needs improvement");
		}
		if (report.performanceMetrics.responseTime.max > 5000) {
			areas.push("Some scenarios have very high response times");
		}

		return areas;
	}
}
