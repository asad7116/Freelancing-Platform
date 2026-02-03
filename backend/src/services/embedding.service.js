/**
 * Embedding Service
 * Handles vector embeddings for semantic similarity search
 * Uses OpenAI-compatible API (e.g. OpenRouter or OpenAI) for real embeddings
 */

import "dotenv/config";
import OpenAI from "openai";

// Lazy-initialized OpenAI client
let openaiClient = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is missing or empty");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Freelancing Platform",
      }
    });
  }

  return openaiClient;
}

// Model configuration
const EMBEDDING_MODEL = "openai/text-embedding-ada-002";
const EMBEDDING_DIMENSION = 1536; // Dimensions for ada-002

/**
 * Cache for embeddings to reduce API calls
 */
const embeddingCache = new Map();
const CACHE_MAX_SIZE = 1000;

/**
 * Generate a simple hash for caching
 * @param {string} text - Input text
 * @returns {string} - Hash string
 */
function hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

/**
 * Generate embeddings using OpenAI-compatible API
 * 
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
        return generateZeroVector();
    }

    const trimmedText = text.trim().replace(/\n/g, " "); // Clean text for embeddings
    const cacheKey = hashText(trimmedText);

    // Check cache first
    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey);
    }

    try {
        const openai = getOpenAIClient();
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: trimmedText,
        });

        const embedding = response.data[0].embedding;

        // Cache the result
        if (embeddingCache.size >= CACHE_MAX_SIZE) {
            const firstKey = embeddingCache.keys().next().value;
            embeddingCache.delete(firstKey);
        }
        embeddingCache.set(cacheKey, embedding);

        return embedding;
    } catch (error) {
        console.error("[Embedding] Error generating embedding:", error.message);
        // Return zero vector fallback to avoid crashing the whole retrieval pipeline
        // but log the error so it can be fixed
        return generateZeroVector();
    }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts
 * @returns {Promise<number[][]>} - Array of embeddings
 */
export async function generateBatchEmbeddings(texts) {
    if (!texts || texts.length === 0) return [];

    try {
        // OpenAI supports batching directly
        const openai = getOpenAIClient();
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: texts.map(t => t.trim().replace(/\n/g, " ")),
        });

        return response.data.map(item => item.embedding);
    } catch (error) {
        console.error("[Embedding] Batch error:", error.message);
        // Fallback to individual processing if batch fails
        const results = [];
        for (const text of texts) {
            results.push(await generateEmbedding(text));
        }
        return results;
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} - Cosine similarity (-1 to 1)
 */
export function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
}

/**
 * Normalize a vector to unit length
 * @param {number[]} vector - Input vector
 * @returns {number[]} - Normalized vector
 */
export function normalizeVector(vector) {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return vector;
    return vector.map(val => val / norm);
}

/**
 * Generate a zero vector
 * @returns {number[]} - Zero vector of embedding dimension
 */
function generateZeroVector() {
    return new Array(EMBEDDING_DIMENSION).fill(0);
}

/**
 * Find most similar documents using vector similarity
 * @param {number[]} queryEmbedding - Query embedding
 * @param {Array<{id: string, embedding: number[], metadata: Object}>} documents
 * @param {number} topK - Number of results
 * @returns {Array<{id: string, score: number, metadata: Object}>}
 */
export function findSimilarDocuments(queryEmbedding, documents, topK = 5) {
    const results = documents.map(doc => ({
        id: doc.id,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
        metadata: doc.metadata
    }));

    return results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/**
 * Clear the embedding cache
 */
export function clearEmbeddingCache() {
    embeddingCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export function getCacheStats() {
    return {
        size: embeddingCache.size,
        maxSize: CACHE_MAX_SIZE
    };
}

export default {
    generateEmbedding,
    generateBatchEmbeddings,
    cosineSimilarity,
    normalizeVector,
    findSimilarDocuments,
    clearEmbeddingCache,
    getCacheStats
};
