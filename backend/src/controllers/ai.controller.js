import * as aiService from "../services/ai.service.js";

/**
 * Helper function to handle AI service errors consistently
 */
const handleAIError = (error, res, defaultMessage) => {
  console.error("AI Controller Error:", error.message);
  
  // Return 503 if Groq API key is missing
  if (error.message?.includes("GROQ_API_KEY")) {
    return res.status(503).json({ 
      ok: false,
      message: "AI service not configured",
      error: "GROQ_API_KEY is missing"
    });
  }
  
  // Generic error
  res.status(500).json({ 
    error: defaultMessage || "AI service encountered an error. Please try again." 
  });
};

/**
 * POST /api/ai/improve-title
 * Improve a gig title using AI
 */
export const improveTitleController = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: "Title is required" 
      });
    }

    const result = await aiService.improveTitle(title, category);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in improveTitleController:", error.message);
    
    // Return 503 if Groq API key is missing
    if (error.message?.includes("GROQ_API_KEY")) {
      return res.status(503).json({ 
        ok: false,
        message: "AI service not configured",
        error: error.message
      });
    }
    
    res.status(500).json({ 
      error: "Failed to improve title. Please try again." 
    });
  }
};

/**
 * POST /api/ai/enhance-description
 * Enhance a gig description using AI
 */
export const enhanceDescriptionController = async (req, res) => {
  try {
    const { description, title, category } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ 
        error: "Description is required" 
      });
    }

    const result = await aiService.enhanceDescription(description, title, category);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to enhance description. Please try again.");
  }
};

/**
 * POST /api/ai/analyze-gig
 * Analyze gig and provide best practices feedback
 */
export const analyzeGigController = async (req, res) => {
  try {
    const gigData = req.body;

    if (!gigData.gigTitle || !gigData.shortDescription) {
      return res.status(400).json({ 
        error: "Title and description are required for analysis" 
      });
    }

    const result = await aiService.analyzeBestPractices(gigData);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to analyze gig. Please try again.");
  }
};

/**
 * POST /api/ai/smart-suggestions
 * Generate smart suggestions based on category and keywords
 */
export const smartSuggestionsController = async (req, res) => {
  try {
    const { category, keywords } = req.body;

    if (!category || category.trim().length === 0) {
      return res.status(400).json({ 
        error: "Category is required" 
      });
    }

    const result = await aiService.generateSmartSuggestions(category, keywords);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to generate suggestions. Please try again.");
  }
};

/**
 * POST /api/ai/recommend-price
 * Recommend competitive pricing based on gig details
 */
export const recommendPriceController = async (req, res) => {
  try {
    const gigData = req.body;

    if (!gigData.gigTitle || !gigData.shortDescription || !gigData.category) {
      return res.status(400).json({ 
        error: "Title, description, and category are required for price recommendation" 
      });
    }

    const result = await aiService.recommendPrice(gigData);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to recommend price. Please try again.");
  }
};

// ==================== PROPOSAL AI CONTROLLERS ====================

/**
 * POST /api/ai/generate-cover-letter
 * Generate a professional cover letter for a job proposal
 */
export const generateCoverLetterController = async (req, res) => {
  try {
    const { jobTitle, jobDescription, jobBudget, freelancerSkills } = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ 
        error: "Job title and description are required" 
      });
    }

    const result = await aiService.generateCoverLetter({
      jobTitle,
      jobDescription,
      jobBudget,
      freelancerSkills
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to generate cover letter. Please try again.");
  }
};

/**
 * POST /api/ai/improve-cover-letter
 * Improve an existing cover letter draft
 */
export const improveCoverLetterController = async (req, res) => {
  try {
    const { draft, jobTitle, jobDescription } = req.body;

    if (!draft || draft.trim().length === 0) {
      return res.status(400).json({ 
        error: "Cover letter draft is required" 
      });
    }

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ 
        error: "Job title and description are required for context" 
      });
    }

    const result = await aiService.improveCoverLetter({
      draft,
      jobTitle,
      jobDescription
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to improve cover letter. Please try again.");
  }
};

/**
 * POST /api/ai/analyze-proposal
 * Analyze a complete proposal and provide quality score with feedback
 */
export const analyzeProposalController = async (req, res) => {
  try {
    const { coverLetter, proposedPrice, deliveryTime, jobBudget, jobDuration } = req.body;

    if (!coverLetter || coverLetter.trim().length === 0) {
      return res.status(400).json({ 
        error: "Cover letter is required for analysis" 
      });
    }

    if (!proposedPrice || !deliveryTime) {
      return res.status(400).json({ 
        error: "Proposed price and delivery time are required for analysis" 
      });
    }

    const result = await aiService.analyzeProposal({
      coverLetter,
      proposedPrice,
      deliveryTime,
      jobBudget,
      jobDuration
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to analyze proposal. Please try again.");
  }
};

/**
 * POST /api/ai/analyze-bid
 * Analyze bid amount and provide smart pricing recommendations
 */
export const analyzeBidController = async (req, res) => {
  try {
    const { jobDescription, jobBudget, currentBid, deliveryTime, milestones } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ 
        error: "Job description is required for bid analysis" 
      });
    }

    const result = await aiService.analyzeBidAmount({
      jobDescription,
      jobBudget,
      currentBid,
      deliveryTime,
      milestones
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    handleAIError(error, res, "Failed to suggest bid range. Please try again.");
  }
};

/**
 * POST /api/ai/generate-milestones
 * Generate project milestones automatically based on job description
 */
export const generateMilestonesController = async (req, res) => {
  try {
    const { jobDescription, deliveryTime, totalBid } = req.body;

    if (!jobDescription || !deliveryTime || !totalBid) {
      return res.status(400).json({ 
        error: "Job description, delivery time, and total bid are required" 
      });
    }

    const result = await aiService.generateMilestones({
      jobDescription,
      deliveryTime,
      totalBid
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in generateMilestonesController:", error.message);
    res.status(500).json({ 
      error: "Failed to generate milestones. Please try again." 
    });
  }
};
