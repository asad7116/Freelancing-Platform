/**
 * BM25 (Best Matching 25) Implementation
 * A ranking function used for information retrieval
 */

// Default BM25 parameters
const DEFAULT_K1 = 1.5;  // Term frequency saturation parameter
const DEFAULT_B = 0.75;  // Length normalization parameter

/**
 * Tokenize and normalize text for BM25 processing
 * @param {string} text - Input text
 * @returns {string[]} - Array of normalized tokens
 */
export function tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Remove punctuation
        .split(/\s+/)
        .filter(token => token.length > 1)  // Remove single characters
        .filter(token => !STOP_WORDS.has(token));  // Remove stop words
}

/**
 * Common English stop words to filter out
 */
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where',
    'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there'
]);

/**
 * Calculate term frequencies for a document
 * @param {string[]} tokens - Array of tokens
 * @returns {Map<string, number>} - Term frequency map
 */
export function calculateTermFrequency(tokens) {
    const tf = new Map();
    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }
    return tf;
}

/**
 * BM25 Index class for storing and querying documents
 */
export class BM25Index {
    constructor(k1 = DEFAULT_K1, b = DEFAULT_B) {
        this.k1 = k1;
        this.b = b;
        this.documents = [];        // Array of { id, tokens, tf, length }
        this.documentFrequency = new Map();  // Term -> number of docs containing term
        this.averageDocLength = 0;
        this.totalDocuments = 0;
    }

    /**
     * Add a document to the index
     * @param {string} id - Document identifier
     * @param {string} text - Document text content
     * @param {Object} metadata - Optional metadata
     */
    addDocument(id, text, metadata = {}) {
        const tokens = tokenize(text);
        const tf = calculateTermFrequency(tokens);

        // Update document frequency for each unique term
        for (const term of tf.keys()) {
            this.documentFrequency.set(
                term,
                (this.documentFrequency.get(term) || 0) + 1
            );
        }

        this.documents.push({
            id,
            tokens,
            tf,
            length: tokens.length,
            metadata
        });

        // Update average document length
        this.totalDocuments = this.documents.length;
        const totalLength = this.documents.reduce((sum, doc) => sum + doc.length, 0);
        this.averageDocLength = totalLength / this.totalDocuments;
    }

    /**
     * Calculate IDF (Inverse Document Frequency) for a term
     * @param {string} term - The term to calculate IDF for
     * @returns {number} - IDF score
     */
    calculateIDF(term) {
        const df = this.documentFrequency.get(term) || 0;
        if (df === 0) return 0;

        // BM25 IDF formula: log((N - df + 0.5) / (df + 0.5))
        return Math.log(
            (this.totalDocuments - df + 0.5) / (df + 0.5) + 1
        );
    }

    /**
     * Calculate BM25 score for a document given a query
     * @param {Object} doc - Document object
     * @param {string[]} queryTokens - Query tokens
     * @returns {number} - BM25 score
     */
    calculateScore(doc, queryTokens) {
        let score = 0;
        const docLength = doc.length;
        const avgDL = this.averageDocLength;

        for (const term of queryTokens) {
            const tf = doc.tf.get(term) || 0;
            if (tf === 0) continue;

            const idf = this.calculateIDF(term);

            // BM25 scoring formula
            const numerator = tf * (this.k1 + 1);
            const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / avgDL));

            score += idf * (numerator / denominator);
        }

        return score;
    }

    /**
     * Search the index and return ranked results
     * @param {string} query - Search query
     * @param {number} topK - Number of results to return
     * @returns {Array<{id: string, score: number, metadata: Object}>}
     */
    search(query, topK = 5) {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) return [];

        const results = this.documents.map(doc => ({
            id: doc.id,
            score: this.calculateScore(doc, queryTokens),
            metadata: doc.metadata
        }));

        // Sort by score descending and return top K
        return results
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
     * Serialize the index to JSON for storage
     * @returns {Object} - Serialized index
     */
    toJSON() {
        return {
            k1: this.k1,
            b: this.b,
            documents: this.documents.map(doc => ({
                id: doc.id,
                tokens: doc.tokens,
                tf: Array.from(doc.tf.entries()),
                length: doc.length,
                metadata: doc.metadata
            })),
            documentFrequency: Array.from(this.documentFrequency.entries()),
            averageDocLength: this.averageDocLength,
            totalDocuments: this.totalDocuments
        };
    }

    /**
     * Load index from serialized JSON
     * @param {Object} data - Serialized index data
     * @returns {BM25Index} - Reconstructed index
     */
    static fromJSON(data) {
        const index = new BM25Index(data.k1, data.b);
        index.documents = data.documents.map(doc => ({
            id: doc.id,
            tokens: doc.tokens,
            tf: new Map(doc.tf),
            length: doc.length,
            metadata: doc.metadata
        }));
        index.documentFrequency = new Map(data.documentFrequency);
        index.averageDocLength = data.averageDocLength;
        index.totalDocuments = data.totalDocuments;
        return index;
    }

    /**
     * Get term frequency data for a specific document
     * @param {string} docId - Document ID
     * @returns {Object|null} - Term frequency data
     */
    getDocumentTF(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return null;
        return {
            terms: Array.from(doc.tf.entries()),
            length: doc.length
        };
    }

    /**
     * Get statistics about the index
     * @returns {Object} - Index statistics
     */
    getStats() {
        return {
            totalDocuments: this.totalDocuments,
            averageDocLength: this.averageDocLength,
            uniqueTerms: this.documentFrequency.size,
            k1: this.k1,
            b: this.b
        };
    }
}

export default BM25Index;
