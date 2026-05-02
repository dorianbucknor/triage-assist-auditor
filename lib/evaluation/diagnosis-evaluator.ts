import Levenshtein from "js-levenshtein";
import { HFSemanticSimilarity, LocalSemanticSimilarity } from "./hf-semantic";
import { Accordion } from "@base-ui/react";

/**
 * Evaluation utilities for comparing AI diagnoses against ground truth data
 * Supports multiple similarity metrics:
 * - Exact match (binary)
 * - Levenshtein similarity (0-1, handles typos)
 * - Keyword matching (0-1, Jaccard similarity)
 * - Semantic similarity (0-1, using Hugging Face sentence transformers)
 */

export interface DiagnosisComparison {
	scenarioId: string;
	subjectId: string;

	// Ground truth
	groundTruth: {
		chiefComplaint: string;
		acuity?: string;
	};

	// AI prediction
	aiPrediction: {
		diagnosis: string;
		confidence: number;
		triageLevel: string;
	};

	// Accuracy metrics
	metrics: {
		exactMatch: boolean;
		levenshteinDistance: number;
		levenshteinSimilarity: number; // 0-1
		semanticSimilarity: number; // 0-1 (requires embedding)
		keywordMatch: number; // percentage of keywords matched
	};
}

/**
 * Calculate Levenshtein distance-based similarity (0-1)
 */
export function calculateLevenshteinSimilarity(
	str1: string,
	str2: string,
): number {
	const distance = Levenshtein(str1.toLowerCase(), str2.toLowerCase());
	const maxLength = Math.max(str1.length, str2.length);
	return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Extract keywords from diagnosis text
 */
export function extractKeywords(text: string): Set<string> {
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
	]);
	return new Set(
		text
			.toLowerCase()
			.split(/[\s,\-]+/)
			.filter((word) => word.length > 2 && !stopWords.has(word)),
	);
}

/**
 * Calculate keyword overlap similarity
 */
export function calculateKeywordSimilarity(
	diagnosis1: string,
	diagnosis2: string,
): number {
	const keywords1 = extractKeywords(diagnosis1);
	const keywords2 = extractKeywords(diagnosis2);

	if (keywords1.size === 0 && keywords2.size === 0) return 1;

	const intersection = new Set(
		[...keywords1].filter((x) => keywords2.has(x)),
	);
	const union = new Set([...keywords1, ...keywords2]);

	return union.size === 0 ? 1 : intersection.size / union.size;
}

/**
 * Compare two diagnoses
 * Now async to support semantic similarity from Hugging Face
 */
export async function compareDiagnoses(
	groundTruth: string,
	aiPrediction: string,
	confidenceScore: number,
): Promise<DiagnosisComparison["metrics"]> {
	const exactMatch =
		groundTruth.toLowerCase().trim() === aiPrediction.toLowerCase().trim();
	const levenshteinSimilarity = calculateLevenshteinSimilarity(
		groundTruth,
		aiPrediction,
	);
	const keywordSimilarity = calculateKeywordSimilarity(
		groundTruth,
		aiPrediction,
	);
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const levenshteinDistance = require("js-levenshtein")(
		groundTruth.toLowerCase(),
		aiPrediction.toLowerCase(),
	);

	let semanticSimilarity = 0;
	try {
		// Initialize the model on first use
		// if (!LocalSemanticSimilarity.isInitialized()) {
		// 	console.log("Initializing semantic similarity model...");
		// 	await LocalSemanticSimilarity.initialize();
		// }
		semanticSimilarity = await HFSemanticSimilarity.compareSemantic(
			groundTruth,
			aiPrediction,
		);
	} catch (error) {
		console.warn(
			"Semantic similarity calculation failed, using Levenshtein only:",
			error,
		);
		semanticSimilarity = levenshteinSimilarity;
	}

	return {
		exactMatch,
		levenshteinDistance,
		levenshteinSimilarity,
		semanticSimilarity, // Now calculated from HF
		keywordMatch: keywordSimilarity,
	};
}

/**
 * Calculate overall diagnosis accuracy score (0-1)
 * Weights:
 * - Exact match: 30% (perfect matches are highly valuable)
 * - Semantic similarity: 30% (catches meaning-equivalent phrases)
 * - Levenshtein: 20% (catches typos and minor variations)
 * - Keyword: 20% (catches matching medical terms)
 *
 * Example:
 * - "Chest pain" vs "Acute chest pain" → High semantic similarity
 * - "MI" vs "Myocardial infarction" → High keyword + semantic
 * - "Pneumonia" vs "Pneunomia" → High Levenshtein (typo caught)
 */
export function calculateDiagnosisAccuracyScore(
	metrics: DiagnosisComparison["metrics"],
): number {
	const weights = {
		exactMatch: 0.3,
		semantic: 0.3,
		levenshtein: 0.2,
		keyword: 0.2,
	};

	const exactMatchScore = metrics.exactMatch ? 1 : 0;
	const semanticScore = metrics.semanticSimilarity;
	const levenshteinScore = metrics.levenshteinSimilarity;
	const keywordScore = metrics.keywordMatch;

	return (
		exactMatchScore * weights.exactMatch +
		semanticScore * weights.semantic +
		levenshteinScore * weights.levenshtein +
		keywordScore * weights.keyword
	);
}

/**
 * Triage level comparison
 */
export function compareTriageLevels(
	groundTruth: string | undefined,
	aiPrediction: string,
): {
	match: boolean;
	distance: number; // how many levels off (0-4)
	accuracy: string; // "exact" | "close" | "far"
} {
	const triageLevels: Record<string, number> = {
		"ESI-1": 1,
		"1": 1,
		"ESI-2": 2,
		"2": 2,
		"ESI-3": 3,
		"3": 3,
		"ESI-4": 4,
		"4": 4,
		"ESI-5": 5,
		"5": 5,
	};

	if (!groundTruth) {
		return { match: false, distance: 0, accuracy: "unknown" };
	}

	const groundTruthLevel = triageLevels[groundTruth.toUpperCase()] || 0;
	const predictionLevel = triageLevels[aiPrediction.toUpperCase()] || 0;

	const distance = Math.abs(groundTruthLevel - predictionLevel);
	const match = distance === 0;
	const accuracy =
		distance === 0 ? "exact" : distance === 1 ? "close" : "far";

	return { match, distance, accuracy };
}
