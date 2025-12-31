/**
 * Chatbot Controller
 * Handles HTTP requests for the chatbot API
 */

import {
    chat,
    getSessionHistory,
    getUserSessions,
    deleteSession,
    getChatbotStats
} from "../services/chatbot.service.js";

import {
    processExistingPlatformContent,
    clearProcessedContent,
    getProcessingStats
} from "../services/content-processor.service.js";

/**
 * POST /api/chatbot/chat
 * Main chat endpoint
 */
export async function chatController(req, res) {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user?.id || null;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const result = await chat(sessionId, message, userId);

        res.json({
            success: true,
            response: result.response,
            sessionId: result.sessionId
        });
    } catch (error) {
        console.error("[Chatbot Controller] Chat error:", error.message);
        res.status(500).json({
            error: "Unable to process your request. Please try again."
        });
    }
}

/**
 * GET /api/chatbot/session/:sessionId
 * Get chat history for a session
 */
export async function getSessionController(req, res) {
    try {
        const { sessionId } = req.params;
        const { limit = 50 } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const history = await getSessionHistory(sessionId, parseInt(limit));

        res.json({
            success: true,
            sessionId,
            messages: history
        });
    } catch (error) {
        console.error("[Chatbot Controller] Get session error:", error.message);
        res.status(500).json({ error: "Failed to retrieve session history" });
    }
}

/**
 * GET /api/chatbot/sessions
 * Get all sessions for authenticated user
 */
export async function getUserSessionsController(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const sessions = await getUserSessions(userId);

        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("[Chatbot Controller] Get user sessions error:", error.message);
        res.status(500).json({ error: "Failed to retrieve sessions" });
    }
}

/**
 * DELETE /api/chatbot/session/:sessionId
 * Delete a chat session
 */
export async function deleteSessionController(req, res) {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const result = await deleteSession(sessionId);

        res.json({
            success: true,
            deleted: result.deleted
        });
    } catch (error) {
        console.error("[Chatbot Controller] Delete session error:", error.message);
        res.status(500).json({ error: "Failed to delete session" });
    }
}

/**
 * POST /api/chatbot/admin/process-content
 * Process existing platform content for the chatbot (admin only)
 */
export async function processContentController(req, res) {
    try {
        // This should be admin-protected in production
        const result = await processExistingPlatformContent();

        res.json({
            success: true,
            message: "Content processed successfully",
            ...result
        });
    } catch (error) {
        console.error("[Chatbot Controller] Process content error:", error.message);
        res.status(500).json({ error: "Failed to process content" });
    }
}

/**
 * POST /api/chatbot/admin/clear-content
 * Clear all processed content (admin only)
 */
export async function clearContentController(req, res) {
    try {
        const result = await clearProcessedContent();

        res.json({
            success: true,
            message: "Content cleared successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("[Chatbot Controller] Clear content error:", error.message);
        res.status(500).json({ error: "Failed to clear content" });
    }
}

/**
 * GET /api/chatbot/admin/stats
 * Get chatbot statistics (admin only)
 */
export async function getStatsController(req, res) {
    try {
        const [chatStats, processingStats] = await Promise.all([
            getChatbotStats(),
            getProcessingStats()
        ]);

        res.json({
            success: true,
            chat: chatStats,
            content: processingStats
        });
    } catch (error) {
        console.error("[Chatbot Controller] Get stats error:", error.message);
        res.status(500).json({ error: "Failed to retrieve statistics" });
    }
}

export default {
    chatController,
    getSessionController,
    getUserSessionsController,
    deleteSessionController,
    processContentController,
    clearContentController,
    getStatsController
};
