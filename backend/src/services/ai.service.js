import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

const MODEL = "llama-3.1-8b-instant"; // Fast and efficient model

/**
 * Improve a gig title using AI
 * @param {string} title - Original gig title
 * @param {string} category - Gig category for context
 * @returns {Promise<Object>} - { improved: string, suggestions: string[] }
 */
export const improveTitle = async (title, category = "") => {
  try {
    const prompt = `You are an expert freelancing platform consultant. Improve the following gig title to be more professional, engaging, and SEO-friendly.

Original Title: "${title}"
Category: ${category || "General"}

Requirements:
- Keep it concise (under 80 characters)
- Make it action-oriented and clear
- Include relevant keywords naturally
- Avoid clickbait or exaggeration
- Make it professional and trustworthy

Provide:
1. An improved title
2. 2-3 alternative variations

Format your response as JSON:
{
  "improved": "your best improved title",
  "suggestions": ["alternative 1", "alternative 2", "alternative 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error improving title:", error.message);
    throw new Error("Failed to improve title with AI");
  }
};

/**
 * Enhance a gig description using AI
 * @param {string} description - Original short description
 * @param {string} title - Gig title for context
 * @param {string} category - Gig category
 * @returns {Promise<Object>} - { enhanced: string, tips: string[] }
 */
export const enhanceDescription = async (description, title = "", category = "") => {
  try {
    const prompt = `You are an expert freelancing platform consultant. Enhance the following gig description to be more compelling and professional.

Title: "${title}"
Category: ${category || "General"}
Original Description: "${description}"

Requirements:
- Expand the description to 150-300 words
- Use clear structure with paragraphs
- Highlight key benefits and deliverables
- Use professional but friendly tone
- Include what makes this service unique
- End with a call-to-action

Provide:
1. An enhanced description
2. 3 quick tips for improvement

Format your response as JSON:
{
  "enhanced": "your enhanced description with proper formatting",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error enhancing description:", error.message);
    throw new Error("Failed to enhance description with AI");
  }
};

/**
 * Analyze gig and provide best practices feedback
 * @param {Object} gigData - { title, description, category, price, deliveryTime }
 * @returns {Promise<Object>} - { score: number, feedback: string[], strengths: string[], improvements: string[] }
 */
export const analyzeBestPractices = async (gigData) => {
  try {
    const { gigTitle, shortDescription, category, price, deliveryTime } = gigData;

    const prompt = `You are an expert freelancing platform consultant. Analyze this gig and provide best practices feedback.

Gig Details:
- Title: "${gigTitle}"
- Description: "${shortDescription}"
- Category: ${category || "General"}
- Price: $${price || "Not set"}
- Delivery Time: ${deliveryTime || "Not set"} days

Analyze based on:
1. Title effectiveness (SEO, clarity, professionalism)
2. Description quality (completeness, structure, persuasiveness)
3. Pricing strategy (competitive, value communication)
4. Delivery time (realistic, competitive)
5. Overall presentation

Provide:
1. Overall score (0-100)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Specific actionable feedback

Format your response as JSON:
{
  "score": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "feedback": ["specific feedback 1", "specific feedback 2", "specific feedback 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error analyzing best practices:", error.message);
    throw new Error("Failed to analyze gig with AI");
  }
};

/**
 * Generate smart suggestions based on category and keywords
 * @param {string} category - Gig category
 * @param {string} keywords - User input keywords
 * @returns {Promise<Object>} - { titles: string[], descriptionOutline: string }
 */
export const generateSmartSuggestions = async (category, keywords = "") => {
  try {
    const prompt = `You are an expert freelancing platform consultant. Generate smart suggestions for a gig based on the category and keywords.

Category: ${category}
Keywords: ${keywords || "None provided"}

Provide:
1. 5 professional gig title suggestions
2. A brief description outline/template that the freelancer can customize

Format your response as JSON:
{
  "titles": ["title 1", "title 2", "title 3", "title 4", "title 5"],
  "descriptionOutline": "A template description outline with [placeholders] for customization"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.9,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error generating smart suggestions:", error.message);
    throw new Error("Failed to generate suggestions with AI");
  }
};
