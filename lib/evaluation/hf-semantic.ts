/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Hugging Face Inference API utilities for semantic similarity
 * Uses sentence-transformers (all-mpnet-base-v2) for semantic comparison
 */
import { InferenceClient } from "@huggingface/inference";

interface EmbeddingResult {
	embedding: number[];
}

interface CachedEmbedding {
	text: string;
	embedding: number[];
	timestamp: number;
}

// Simple in-memory cache for embeddings (survives during test runs)
const embeddingCache = new Map<string, CachedEmbedding>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Initialize HF API client
 * Requires HF_TOKEN environment variable to be set
 */
export class HFSemanticSimilarity {
	private static apiToken: string | null = null;
	private static initialized = false;

	static {
		// Try to get token from environment
		if (typeof process !== "undefined" && process.env) {
			this.apiToken = process.env.HF_TOKEN || null;
		}
	}

	/**
	 * Set HF API token (call this at app initialization if using client-side)
	 */
	static setApiToken(token: string): void {
		this.apiToken = token;
		this.initialized = true;
	}

	/**
	 * Get embeddings from Hugging Face Inference API
	 * Uses all-mpnet-base-v2 model for semantic similarity
	 */
	static async getEmbeddings(text: string): Promise<number[]> {
		// Check cache first
		const cached = embeddingCache.get(text);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return cached.embedding;
		}

		if (!this.apiToken) {
			console.warn(
				"HF_TOKEN not set. Semantic similarity will be disabled. Set environment variable or call HFSemanticSimilarity.setApiToken(token)",
			);
			return [];
		}

		try {
			const client = new InferenceClient(process.env.HF_TOKEN);

			const output = await client.sentenceSimilarity({
				model: "sentence-transformers/all-mpnet-base-v2",
				inputs: {
					source_sentence: text,
					sentences: [
						"That is a happy dog",
						"That is a very happy person",
						"Today is a sunny day",
					],
				},
				provider: "hf-inference",
			});

			const embedding = output || [];

			// Cache the result
			embeddingCache.set(text, {
				text,
				embedding,
				timestamp: Date.now(),
			});

			return embedding;
		} catch (error) {
			console.error("Error getting embeddings from HF:", error);
			// Return empty array on error - will fall back to keyword matching
			return [];
		}
	}

	/**
	 * Calculate cosine similarity between two embedding vectors
	 */
	static cosineSimilarity(vec1: number[], vec2: number[]): number {
		if (vec1.length === 0 || vec2.length === 0) {
			return 0; // Cannot calculate if either vector is empty
		}

		if (vec1.length !== vec2.length) {
			return 0; // Vectors must be same length
		}

		let dotProduct = 0;
		let norm1 = 0;
		let norm2 = 0;

		for (let i = 0; i < vec1.length; i++) {
			dotProduct += vec1[i] * vec2[i];
			norm1 += vec1[i] * vec1[i];
			norm2 += vec2[i] * vec2[i];
		}

		const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
		if (magnitude === 0) return 0;

		return dotProduct / magnitude;
	}

	/**
	 * Compare two texts semantically
	 * Returns similarity score 0-1
	 */
	static async compareSemantic(
		text1: string,
		text2: string,
	): Promise<number> {
		if (!text1 || !text2) return 0;

		// const [emb1, emb2] = await Promise.all([
		// 	this.getEmbeddings(text1),
		// 	this.getEmbeddings(text2),
		// ]);

		const client = new InferenceClient(process.env.HF_TOKEN);

		const output = await client.sentenceSimilarity({
			model: "sentence-transformers/all-mpnet-base-v2",
			inputs: {
				source_sentence: text1,
				sentences: [text2],
			},
			provider: "hf-inference",
		});

		if (output.length === 0) {
			// Fallback: if semantic similarity fails, return 0
			// The overall score will still include Levenshtein and keyword matching
			return 0;
		}

		// const similarity = this.cosineSimilarity(emb1, emb2);
		// Cosine similarity is -1 to 1, normalize to 0-1
		return output[0];
	}

	/**
	 * Clear the embedding cache
	 */
	static clearCache(): void {
		embeddingCache.clear();
	}

	/**
	 * Get cache statistics (for debugging)
	 */
	static getCacheStats() {
		return {
			size: embeddingCache.size,
			entries: Array.from(embeddingCache.keys()),
		};
	}
}

/**
 * Alternative: Local transformers.js implementation (for offline/client-side use)
 * Requires: npm install @xenova/transformers
 *
 * Usage:
 * import { LocalSemanticSimilarity } from './hf-semantic';
 * const similarity = await LocalSemanticSimilarity.compareSemantic(text1, text2);
 */
export class LocalSemanticSimilarity {
	private static pipeline: any = null;
	private static initialized = false;

	/**
	 * Initialize the local embedding pipeline
	 * Call this once at app startup
	 */
	static async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			// Dynamically import transformers.js to avoid bundle size impact if not used
			const { pipeline } = await import("@xenova/transformers");

			// Load the sentence transformer model
			this.pipeline = await pipeline(
				"feature-extraction",
				"Xenova/all-mpnet-base-v2",
			);

			this.initialized = true;
			console.log("Local semantic similarity initialized");
		} catch (error) {
			console.warn(
				"Could not initialize local transformers. Using HF API instead:",
				error,
			);
		}
	}

	/**
	 * Check if semantic similarity is initialized
	 */
	static isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Get embeddings using local transformers.js
	 */
	static async getEmbeddings(text: string): Promise<number[]> {
		if (!this.initialized) {
			await this.initialize();
		}

		if (!this.pipeline) {
			return [];
		}

		try {
			const result = await this.pipeline(text, { pooling: "mean" });
			// Transformers.js returns { data: [...] }
			const embedding = Array.from(result.data);
			return embedding as any[];
		} catch (error) {
			console.error("Error getting local embeddings:", error);
			return [];
		}
	}

	/**
	 * Compare two texts using local embeddings
	 */
	static async compareSemantic(
		text1: string,
		text2: string,
	): Promise<number> {
		if (!text1 || !text2) return 0;

		const [emb1, emb2] = await Promise.all([
			this.getEmbeddings(text1),
			this.getEmbeddings(text2),
		]);

		if (emb1.length === 0 || emb2.length === 0) {
			return 0;
		}

		// Cosine similarity
		let dotProduct = 0;
		let norm1 = 0;
		let norm2 = 0;

		for (let i = 0; i < emb1.length; i++) {
			dotProduct += emb1[i] * emb2[i];
			norm1 += emb1[i] * emb1[i];
			norm2 += emb2[i] * emb2[i];
		}

		const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
		if (magnitude === 0) return 0;

		const similarity = dotProduct / magnitude;
		return Math.max(0, similarity);
	}
}
