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
    const prompt = `You are an expert freelancing platform consultant. The user has provided a gig description that may contain spelling or grammar errors. First, understand their intent, then enhance it to be more compelling and professional.

Title: "${title}"
Category: ${category || "General"}
Original Description: "${description}"

IMPORTANT: The user's text may have spelling mistakes or grammar errors - interpret the meaning and improve it.

Requirements:
- Fix any spelling or grammar errors
- Expand the description to 150-300 words
- Use clear structure with paragraphs (use \\n\\n for paragraph breaks)
- Highlight key benefits and deliverables
- Use professional but friendly tone
- Include what makes this service unique
- End with a call-to-action

Provide:
1. An enhanced description AS A SINGLE STRING (not an object)
2. 3 quick tips for improvement

CRITICAL: The "enhanced" field must be a plain text string, not an object or array.

Format your response as JSON:
{
  "enhanced": "Your enhanced description text here as a single string with proper formatting. Use double line breaks for paragraphs.",
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
    
    // Ensure enhanced is a string (defensive programming)
    if (typeof response.enhanced !== 'string') {
      if (typeof response.enhanced === 'object' && response.enhanced.description) {
        response.enhanced = response.enhanced.description;
      } else if (Array.isArray(response.enhanced)) {
        response.enhanced = response.enhanced.join('\n\n');
      } else {
        response.enhanced = String(response.enhanced);
      }
    }
    
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

/**
 * Recommend competitive pricing based on gig details and market trends
 * @param {Object} gigData - { title, description, category, deliveryTime, revisions }
 * @returns {Promise<Object>} - { recommendedPrice: number, priceRange: { min: number, max: number }, reasoning: string, marketInsights: string[] }
 */
export const recommendPrice = async (gigData) => {
  try {
    const { gigTitle, shortDescription, category, deliveryTime, revisions } = gigData;

    const prompt = `You are an expert freelancing platform pricing consultant. Based on the gig details provided, recommend a competitive price based on current 2025 market trends.

Gig Details:
- Title: "${gigTitle}"
- Description: "${shortDescription}"
- Category: ${category || "General"}
- Delivery Time: ${deliveryTime || "Not set"} days
- Revisions: ${revisions || "Not set"}

Consider:
1. Complexity and skill level required
2. Category market rates (2025 standards)
3. Delivery time commitment
4. Number of revisions included
5. Market competitiveness
6. Entry-level vs Expert pricing

Provide realistic pricing recommendations in USD. For context:
- Simple tasks (data entry, basic editing): $5-$50
- Standard services (logo design, basic websites): $50-$300
- Professional services (full websites, complex designs): $300-$1000
- Expert services (enterprise solutions, specialized work): $1000+

Format your response as JSON:
{
  "recommendedPrice": 150,
  "priceRange": {
    "min": 100,
    "max": 250
  },
  "reasoning": "Brief explanation of why this price range",
  "marketInsights": ["insight 1", "insight 2", "insight 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error recommending price:", error.message);
    throw new Error("Failed to recommend price with AI");
  }
};
