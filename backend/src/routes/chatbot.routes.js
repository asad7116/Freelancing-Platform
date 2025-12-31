/**
 * Chatbot Routes
 * API endpoints for the chatbot functionality
 */

import { Router } from "express";
import {
    chatController,
    getSessionController,
    getUserSessionsController,
    deleteSessionController,
    processContentController,
    clearContentController,
    getStatsController
} from "../controllers/chatbot.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Chat endpoint - can be used without authentication
// Session ID is used to track conversations

/**
 * POST /api/chatbot/chat
 * Body: { message: string, sessionId?: string }
 * Returns: { success: true, response: string, sessionId: string }
 */
router.post("/chat", chatController);

/**
 * GET /api/chatbot/session/:sessionId
 * Returns: { success: true, sessionId: string, messages: Array }
 */
router.get("/session/:sessionId", getSessionController);

// ==================== AUTHENTICATED ROUTES ====================

/**
 * GET /api/chatbot/sessions
 * Requires auth - returns user's chat sessions
 * Returns: { success: true, sessions: Array }
 */
router.get("/sessions", authMiddleware, getUserSessionsController);

/**
 * DELETE /api/chatbot/session/:sessionId
 * Requires auth - deletes a chat session
 * Returns: { success: true, deleted: boolean }
 */
router.delete("/session/:sessionId", authMiddleware, deleteSessionController);

// ==================== ADMIN ROUTES ====================
// These should have additional admin verification in production

/**
 * POST /api/chatbot/admin/process-content
 * Process platform content for the chatbot index
 * Returns: { success: true, processed: number, chunks: number }
 */
router.post("/admin/process-content", authMiddleware, processContentController);

/**
 * POST /api/chatbot/admin/clear-content
 * Clear all processed content from the index
 * Returns: { success: true, deletedCount: number }
 */
router.post("/admin/clear-content", authMiddleware, clearContentController);

/**
 * GET /api/chatbot/admin/stats
 * Get chatbot statistics
 * Returns: { success: true, chat: Object, content: Object }
 */
router.get("/admin/stats", authMiddleware, getStatsController);

export default router;
