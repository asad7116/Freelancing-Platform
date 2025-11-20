import { Router } from "express";
import {
  improveTitleController,
  enhanceDescriptionController,
  analyzeGigController,
  smartSuggestionsController,
  recommendPriceController,
  generateCoverLetterController,
  improveCoverLetterController,
  analyzeProposalController,
  analyzeBidController,
  generateMilestonesController
} from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// All AI endpoints require authentication
router.use(authMiddleware);

// ==================== GIG AI ROUTES ====================

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

/**
 * POST /api/ai/recommend-price
 * Body: { gigTitle: string, shortDescription: string, category: string, deliveryTime?: number, revisions?: string }
 * Returns: { recommendedPrice: number, priceRange: { min: number, max: number }, reasoning: string, marketInsights: string[] }
 */
router.post("/recommend-price", recommendPriceController);

// ==================== PROPOSAL AI ROUTES ====================

/**
 * POST /api/ai/generate-cover-letter
 * Body: { jobTitle: string, jobDescription: string, jobBudget?: number, freelancerSkills?: string }
 * Returns: { coverLetter: string, tips: string[] }
 */
router.post("/generate-cover-letter", generateCoverLetterController);

/**
 * POST /api/ai/improve-cover-letter
 * Body: { draft: string, jobTitle: string, jobDescription: string }
 * Returns: { improved: string, improvements: string[] }
 */
router.post("/improve-cover-letter", improveCoverLetterController);

/**
 * POST /api/ai/analyze-proposal
 * Body: { coverLetter: string, proposedPrice: number, deliveryTime: number, jobBudget?: number, jobDuration?: string }
 * Returns: { score: number, strengths: string[], improvements: string[], feedback: string[] }
 */
router.post("/analyze-proposal", analyzeProposalController);

/**
 * POST /api/ai/analyze-bid
 * Body: { jobDescription: string, jobBudget?: number, currentBid?: number, deliveryTime?: number, milestones?: number }
 * Returns: { recommendedBid: number, bidRange: { min, max }, competitiveness: string, reasoning: string, insights: string[] }
 */
router.post("/analyze-bid", analyzeBidController);

/**
 * POST /api/ai/generate-milestones
 * Body: { jobDescription: string, deliveryTime: number, totalBid: number }
 * Returns: { milestones: Array<{ description, amount, duration }>, tips: string[] }
 */
router.post("/generate-milestones", generateMilestonesController);

export default router;
