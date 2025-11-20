import { Router } from "express";
import {
  improveTitleController,
  enhanceDescriptionController,
  analyzeGigController,
  smartSuggestionsController
} from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// All AI endpoints require authentication
router.use(authMiddleware);

/**
 * POST /api/ai/improve-title
 * Body: { title: string, category?: string }
 * Returns: { improved: string, suggestions: string[] }
 */
router.post("/improve-title", improveTitleController);

/**
 * POST /api/ai/enhance-description
 * Body: { description: string, title?: string, category?: string }
 * Returns: { enhanced: string, tips: string[] }
 */
router.post("/enhance-description", enhanceDescriptionController);

/**
 * POST /api/ai/analyze-gig
 * Body: { gigTitle: string, shortDescription: string, category?: string, price?: number, deliveryTime?: number }
 * Returns: { score: number, strengths: string[], improvements: string[], feedback: string[] }
 */
router.post("/analyze-gig", analyzeGigController);

/**
 * POST /api/ai/smart-suggestions
 * Body: { category: string, keywords?: string }
 * Returns: { titles: string[], descriptionOutline: string }
 */
router.post("/smart-suggestions", smartSuggestionsController);

export default router;
