/**
 * Types for research evaluation and reporting
 */

export interface EvaluationMetrics {
	// Diagnosis accuracy
	diagnosisExactMatch: boolean;
	diagnosisSemanticSimilarity: number; // 0-1 (from HF sentence transformers)
	diagnosisKeywordMatch: number; // 0-1
	diagnosisLevenshteinSimilarity: number; // 0-1
	diagnosisOverallScore: number; // 0-1 (weighted combination)

	// Triage accuracy
	triageLevelMatch: boolean;
	triageLevelDistance: number; // 0-4
	triageLevelAccuracy: "exact" | "close" | "far" | "unknown";

	// Performance
	responseTimeMs: number;
	processingSpeedCategory: "fast" | "normal" | "slow";

	// Confidence
	aiConfidence: number; // 0-1
	clinicalSignificance: "high" | "medium" | "low";
}

export interface DiagnosisEvaluationRecord {
	// Identifiers
	scenarioId: string;
	subjectId: string;
	evaluationId: string;

	// Ground Truth (from dataset)
	groundTruth: {
		chiefComplaint: string;
		acuity?: string; // ESI level if available
		inTime: Date;
		outTime: Date;
		triageDuration: number; // seconds
		modeOfArrival: string;
		gender?: string;
		vitals?: {
			temperature?: number;
			pulse?: number;
			respiratoryRate?: number;
			bloodPressure?: string;
			oxygenSaturation?: number;
		};
	};

	// AI Prediction
	aiPrediction: {
		diagnosis: string;
		triageLevel: string;
		treatment: string;
		confidence: number;
		reasoningExplanation?: string;
	};

	// Metrics
	metrics: EvaluationMetrics;

	// Research metadata
	research: {
		evaluationDate: Date;
		evaluationType: "automated" | "manual" | "hybrid";
		evaluatorId?: string; // clinician ID if manual
		notes?: string;
		includeInStudy: boolean;
		excludeReason?: string;
	};

	// Clinician review (optional)
	clinicianReview?: {
		clinicianId: string;
		correct: boolean;
		feedback?: string;
		suggestedDiagnosis?: string;
		reviewedAt: Date;
	};
}

export interface ResearchReportSummary {
	// Report metadata
	reportId: string;
	projectName: string;
	generatedAt: Date;

	// Evaluation scope
	totalScenariosEvaluated: number;
	totalScenariosIncluded: number;
	excludedCount: number;
	evaluationPeriod: {
		startDate: Date;
		endDate: Date;
	};

	// Diagnosis Accuracy
	diagnosisAccuracy: {
		exactMatch: {
			count: number;
			percentage: number;
		};
		keywordMatch: {
			average: number; // 0-1
			percentageAbove80: number;
			percentageAbove60: number;
		};
		levenshteinSimilarity: {
			average: number; // 0-1
			percentageAbove80: number;
			percentageAbove60: number;
		};
		overallScore: {
			average: number; // 0-1
			median: number;
			standardDeviation: number;
		};
	};

	// Triage Accuracy
	triageAccuracy: {
		exactMatch: {
			count: number;
			percentage: number;
		};
		withinOneLevel: {
			count: number;
			percentage: number;
		};
		distribution: {
			exact: number;
			offByOne: number;
			offByTwo: number;
			offByThreeOrMore: number;
		};
		byLevel: {
			[level: string]: {
				count: number;
				accuracy: number;
			};
		};
	};

	// Performance
	performanceMetrics: {
		responseTime: {
			average: number; // ms
			median: number;
			min: number;
			max: number;
			stdDev: number;
		};
		responseSpeedDistribution: {
			fast: number; // < 100ms
			normal: number; // 100-1000ms
			slow: number; // > 1000ms
		};
	};

	// Confidence Analysis
	confidenceAnalysis: {
		averageAIConfidence: number; // 0-1
		confidenceVsAccuracy: {
			highConfidence: { average: number; count: number };
			mediumConfidence: { average: number; count: number };
			lowConfidence: { average: number; count: number };
		};
	};

	// Detailed Analysis
	analysis: {
		topAccurateDiagnoses: Array<{
			diagnosis: string;
			count: number;
			accuracy: number;
		}>;

		commonMisdiagnoses: Array<{
			actual: string;
			predicted: string;
			frequency: number;
			averageAccuracyScore: number;
		}>;

		difficultCases: Array<{
			scenarioId: string;
			subjectId: string;
			chiefComplaint: string;
			accuracyScore: number;
			reason?: string;
		}>;

		triageLevelCorrelation: number; // correlation between diagnosis accuracy and triage accuracy
	};

	// Recommendations
	recommendations: {
		strengths: string[];
		areasForImprovement: string[];
		suggestedActions: string[];
	};

	// Statistical Summary
	statistics: {
		diagnosisCorrelationWithTriageAccuracy: number;
		diagnosisCorrelationWithResponseTime: number;
		triageAccuracyByChiefComplaintCategory: Record<string, number>;
	};
}

export interface ResearchDataExport {
	reportSummary: ResearchReportSummary;
	detailedRecords: DiagnosisEvaluationRecord[];
	timestamp: Date;
	exportFormat: "json" | "csv" | "xlsx";
}

// Response time categories
export const RESPONSE_TIME_CATEGORIES = {
	fast: 100, // < 100ms
	normal: 1000, // 100-1000ms
	slow: Infinity, // > 1000ms
};

// Scoring weights (updated to include semantic similarity)
export const ACCURACY_SCORING_WEIGHTS = {
	exactMatch: 0.3, // Perfect matches
	semantic: 0.3, // Meaning-equivalent phrases (from HF)
	levenshtein: 0.2, // Typos and minor variations
	keyword: 0.2, // Medical term overlap
};
