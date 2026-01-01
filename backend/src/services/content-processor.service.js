/**
 * Content Processor Service
 * Handles content chunking, metadata extraction, and processing
 * for the hybrid retrieval chatbot system
 */

import { getDatabase } from "../db/mongodb.js";
import { BM25Index, tokenize } from "./bm25.service.js";
import { generateEmbedding, generateBatchEmbeddings } from "./embedding.service.js";

// Chunking configuration
const MIN_CHUNK_TOKENS = 400;
const MAX_CHUNK_TOKENS = 600;
const OVERLAP_TOKENS = 50;

/**
 * Estimate token count for text (rough approximation)
 * @param {string} text - Input text
 * @returns {number} - Estimated token count
 */
function estimateTokens(text) {
    if (!text) return 0;
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
}

/**
 * Split text into sentences
 * @param {string} text - Input text
 * @returns {string[]} - Array of sentences
 */
function splitIntoSentences(text) {
    if (!text) return [];

    // Split on sentence boundaries while preserving punctuation
    const sentences = text
        .replace(/([.!?])\s+/g, '$1|||')
        .split('|||')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return sentences;
}

/**
 * Create chunks from text with overlap
 * @param {string} text - Full text content
 * @param {Object} metadata - Metadata to attach to chunks
 * @returns {Array<{content: string, metadata: Object, tokenCount: number}>}
 */
export function createChunks(text, metadata = {}) {
    if (!text || typeof text !== 'string') return [];

    const sentences = splitIntoSentences(text);
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const sentenceTokens = estimateTokens(sentence);

        // If adding this sentence would exceed max, finalize current chunk
        if (currentTokens + sentenceTokens > MAX_CHUNK_TOKENS && currentChunk.length > 0) {
            const chunkContent = currentChunk.join(' ');

            // Only add if above minimum threshold
            if (estimateTokens(chunkContent) >= MIN_CHUNK_TOKENS) {
                chunks.push({
                    content: chunkContent,
                    metadata: {
                        ...metadata,
                        chunkIndex,
                        startSentence: i - currentChunk.length,
                        endSentence: i - 1
                    },
                    tokenCount: estimateTokens(chunkContent)
                });
                chunkIndex++;
            }

            // Start new chunk with overlap
            const overlapSentences = [];
            let overlapTokens = 0;
            for (let j = currentChunk.length - 1; j >= 0 && overlapTokens < OVERLAP_TOKENS; j--) {
                overlapSentences.unshift(currentChunk[j]);
                overlapTokens += estimateTokens(currentChunk[j]);
            }

            currentChunk = overlapSentences;
            currentTokens = overlapTokens;
        }

        currentChunk.push(sentence);
        currentTokens += sentenceTokens;
    }

    // Add remaining content as final chunk
    if (currentChunk.length > 0) {
        const chunkContent = currentChunk.join(' ');
        chunks.push({
            content: chunkContent,
            metadata: {
                ...metadata,
                chunkIndex,
                startSentence: sentences.length - currentChunk.length,
                endSentence: sentences.length - 1
            },
            tokenCount: estimateTokens(chunkContent)
        });
    }

    return chunks;
}

/**
 * Process a document and create indexed chunks
 * @param {string} documentId - Unique document identifier
 * @param {string} content - Document content
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Array>} - Created chunks
 */
export async function processDocument(documentId, content, metadata = {}) {
    const db = await getDatabase();
    const chunksCollection = db.collection('chatbot_chunks');

    // Create chunks from content
    const chunks = createChunks(content, {
        documentId,
        ...metadata,
        processedAt: new Date()
    });

    if (chunks.length === 0) return [];

    // Generate embeddings for all chunks
    const embeddings = await generateBatchEmbeddings(
        chunks.map(c => c.content)
    );

    // Calculate BM25 term frequencies for each chunk
    const processedChunks = chunks.map((chunk, index) => {
        const tokens = tokenize(chunk.content);
        const termFrequency = {};

        for (const token of tokens) {
            termFrequency[token] = (termFrequency[token] || 0) + 1;
        }

        return {
            _id: `${documentId}_chunk_${chunk.metadata.chunkIndex}`,
            documentId,
            content: chunk.content,
            tokenCount: chunk.tokenCount,
            metadata: chunk.metadata,
            embedding: embeddings[index] || [],
            termFrequency,
            tokenLength: tokens.length,
            createdAt: new Date()
        };
    });

    // Store chunks in database (upsert to handle re-processing)
    const bulkOps = processedChunks.map(chunk => ({
        replaceOne: {
            filter: { _id: chunk._id },
            replacement: chunk,
            upsert: true
        }
    }));

    if (bulkOps.length > 0) {
        await chunksCollection.bulkWrite(bulkOps);
    }

    return processedChunks;
}

/**
 * Process site content from various sources
 * @param {Array<{id: string, content: string, type: string, metadata: Object}>} contents
 * @returns {Promise<{processed: number, chunks: number}>}
 */
export async function processSiteContent(contents) {
    let totalChunks = 0;

    for (const item of contents) {
        const chunks = await processDocument(item.id, item.content, {
            type: item.type,
            ...item.metadata
        });
        totalChunks += chunks.length;
    }

    // Update BM25 index statistics
    await updateGlobalIndexStats();

    return {
        processed: contents.length,
        chunks: totalChunks
    };
}

/**
 * Update global BM25 index statistics
 */
async function updateGlobalIndexStats() {
    const db = await getDatabase();
    const chunksCollection = db.collection('chatbot_chunks');
    const statsCollection = db.collection('chatbot_stats');

    // Calculate document frequency for all terms
    const chunks = await chunksCollection.find({}).toArray();

    const documentFrequency = {};
    let totalLength = 0;

    for (const chunk of chunks) {
        totalLength += chunk.tokenLength || 0;
        const seenTerms = new Set();

        for (const term of Object.keys(chunk.termFrequency || {})) {
            if (!seenTerms.has(term)) {
                documentFrequency[term] = (documentFrequency[term] || 0) + 1;
                seenTerms.add(term);
            }
        }
    }

    const averageDocLength = chunks.length > 0 ? totalLength / chunks.length : 0;

    await statsCollection.updateOne(
        { _id: 'bm25_stats' },
        {
            $set: {
                totalDocuments: chunks.length,
                averageDocLength,
                documentFrequency,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    );
}

/**
 * Extract and process content from platform database
 * This function pulls relevant content from gigs, jobs, categories, etc.
 */
export async function processExistingPlatformContent() {
    const db = await getDatabase();
    const contents = [];

    // Process gigs
    const gigs = await db.collection('gigs').find({}).toArray();
    for (const gig of gigs) {
        const content = [
            gig.gigTitle || '',
            gig.shortDescription || '',
            gig.fullDescription || '',
            `Category: ${gig.category || 'General'}`,
            `Skills: ${(gig.skills || []).join(', ')}`,
            `Price: $${gig.price || 'Varies'}`,
            `Delivery: ${gig.deliveryTime || 'Standard'} days`,
            `Revisions: ${gig.revisions || 'As agreed'}`
        ].filter(Boolean).join('. ');

        if (content.length > 50) {
            contents.push({
                id: `gig_${gig._id}`,
                content,
                type: 'gig',
                metadata: {
                    title: gig.gigTitle,
                    category: gig.category,
                    price: gig.price,
                    sellerId: gig.sellerId
                }
            });
        }
    }

    // Process job posts
    const jobs = await db.collection('jobPosts').find({}).toArray();
    for (const job of jobs) {
        const content = [
            job.title || '',
            job.description || '',
            `Category: ${job.category || 'General'}`,
            `Skills Required: ${(job.skills || []).join(', ')}`,
            `Budget: $${job.budget || 'Negotiable'}`,
            `Duration: ${job.duration || 'As needed'}`,
            `Experience Level: ${job.experienceLevel || 'Any'}`
        ].filter(Boolean).join('. ');

        if (content.length > 50) {
            contents.push({
                id: `job_${job._id}`,
                content,
                type: 'job',
                metadata: {
                    title: job.title,
                    category: job.category,
                    budget: job.budget,
                    clientId: job.clientId
                }
            });
        }
    }

    // Process categories
    const categories = await db.collection('categories').find({}).toArray();
    for (const cat of categories) {
        const content = [
            `Service Category: ${cat.name || ''}`,
            cat.description || '',
            `Subcategories: ${(cat.subcategories || []).map(s => s.name || s).join(', ')}`
        ].filter(Boolean).join('. ');

        if (content.length > 20) {
            contents.push({
                id: `category_${cat._id}`,
                content,
                type: 'category',
                metadata: {
                    name: cat.name,
                    slug: cat.slug
                }
            });
        }
    }

    // Add platform FAQ content
    contents.push(...getPlatformFAQContent());

    // Process all content
    return await processSiteContent(contents);
}

/**
 * Get platform-specific FAQ and help content
 * @returns {Array} - FAQ content items
 */
function getPlatformFAQContent() {
    return [
        {
            id: 'faq_getting_started',
            content: `Getting started on the freelancing platform is easy. First, create an account by signing up with your email or Google account. After registration, complete your profile by adding your skills, experience, and portfolio. As a freelancer, you can create gigs that showcase your services, set your prices, and wait for clients to find you. As a client, you can browse available gigs or post job listings to find the perfect freelancer for your project. The platform connects talented freelancers with clients who need their services.`,
            type: 'faq',
            metadata: { topic: 'getting_started', section: 'help' }
        },
        {
            id: 'faq_creating_gigs',
            content: `Creating a gig on the platform allows you to showcase your skills and services. Go to your dashboard and click "Create Gig". Add a compelling title that describes your service clearly. Write a detailed description explaining what you offer, your process, and what clients can expect. Set competitive pricing based on market rates and your experience level. Choose an appropriate category and add relevant skills tags. Include examples of your work in the gallery section. A well-crafted gig with clear descriptions and examples attracts more clients.`,
            type: 'faq',
            metadata: { topic: 'creating_gigs', section: 'help' }
        },
        {
            id: 'faq_finding_jobs',
            content: `Finding jobs on the platform is straightforward. Browse the job listings section to see available opportunities. Use filters to narrow down by category, budget, duration, and required skills. Read job descriptions carefully to understand requirements. Submit a proposal with a professional cover letter, your proposed bid, and delivery timeline. Highlight your relevant experience and why you're the best fit. Clients review proposals and select freelancers based on their profiles, proposals, and reviews.`,
            type: 'faq',
            metadata: { topic: 'finding_jobs', section: 'help' }
        },
        {
            id: 'faq_payments',
            content: `The platform handles payments securely. When a client accepts your proposal or orders your gig, the payment is held in escrow. Complete the work according to the agreed terms. Once the client approves the delivery, the funds are released to your account. Payment methods include bank transfers and popular payment services. The platform may charge a service fee on completed transactions. Always deliver quality work within the agreed timeframe to build positive reviews and attract more clients.`,
            type: 'faq',
            metadata: { topic: 'payments', section: 'help' }
        },
        {
            id: 'faq_profile_tips',
            content: `A strong profile increases your chances of getting hired. Add a professional profile photo that shows your face clearly. Write a compelling bio that highlights your expertise, experience, and what makes you unique. List all relevant skills with accurate proficiency levels. Include portfolio items showcasing your best work. Request reviews from past clients. Keep your profile updated with new skills and projects. Respond promptly to messages and maintain high completion rates for better visibility in search results.`,
            type: 'faq',
            metadata: { topic: 'profile_tips', section: 'help' }
        },
        {
            id: 'faq_categories',
            content: `The platform offers various service categories including Web Development for websites and web applications, Mobile Development for iOS and Android apps, Graphic Design for logos, branding, and visual content, Digital Marketing for SEO, social media, and advertising, Writing and Translation for content creation and language services, Video and Animation for video editing and motion graphics, Music and Audio for sound design and production, and Business services for consulting and administrative support. Each category has subcategories for more specific services.`,
            type: 'faq',
            metadata: { topic: 'categories', section: 'help' }
        },
        {
            id: 'faq_proposals',
            content: `Writing effective proposals is key to winning projects. Read the job description thoroughly before applying. Address the client's specific needs in your proposal. Explain your approach and how you'll solve their problem. Include relevant experience and portfolio links. Set a competitive but fair price. Be realistic about delivery time. Personalize each proposal instead of using templates. Proofread for spelling and grammar. A well-written proposal demonstrates professionalism and increases your chances of being selected.`,
            type: 'faq',
            metadata: { topic: 'proposals', section: 'help' }
        },
        {
            id: 'faq_client_guide',
            content: `Hiring freelancers on the platform is simple. Post a job with clear requirements, budget, and timeline. Review incoming proposals and freelancer profiles. Check ratings, reviews, and portfolio work. Communicate with potential candidates to discuss project details. Select the freelancer who best fits your needs. Define clear milestones and deliverables. Provide timely feedback during the project. Release payment when you're satisfied with the delivery. Leave an honest review to help other clients make informed decisions.`,
            type: 'faq',
            metadata: { topic: 'client_guide', section: 'help' }
        }
    ];
}

/**
 * Clear all processed content
 * @returns {Promise<{deletedCount: number}>}
 */
export async function clearProcessedContent() {
    const db = await getDatabase();
    const result = await db.collection('chatbot_chunks').deleteMany({});
    await db.collection('chatbot_stats').deleteMany({});
    return { deletedCount: result.deletedCount };
}

/**
 * Get content processing statistics
 * @returns {Promise<Object>}
 */
export async function getProcessingStats() {
    const db = await getDatabase();

    const totalChunks = await db.collection('chatbot_chunks').countDocuments();
    const stats = await db.collection('chatbot_stats').findOne({ _id: 'bm25_stats' });

    const typeCounts = await db.collection('chatbot_chunks').aggregate([
        { $group: { _id: '$metadata.type', count: { $sum: 1 } } }
    ]).toArray();

    return {
        totalChunks,
        averageDocLength: stats?.averageDocLength || 0,
        uniqueTerms: Object.keys(stats?.documentFrequency || {}).length,
        byType: Object.fromEntries(typeCounts.map(t => [t._id, t.count])),
        lastUpdated: stats?.updatedAt
    };
}

export default {
    createChunks,
    processDocument,
    processSiteContent,
    processExistingPlatformContent,
    clearProcessedContent,
    getProcessingStats
};
