import * as aiService from "../services/ai.service.js";

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
    console.error("Error in enhanceDescriptionController:", error.message);
    res.status(500).json({ 
      error: "Failed to enhance description. Please try again." 
    });
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
    console.error("Error in analyzeGigController:", error.message);
    res.status(500).json({ 
      error: "Failed to analyze gig. Please try again." 
    });
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
    console.error("Error in smartSuggestionsController:", error.message);
    res.status(500).json({ 
      error: "Failed to generate suggestions. Please try again." 
    });
  }
};
