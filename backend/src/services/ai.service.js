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
    const { gigTitle, shortDescription, category, price, deliveryTime, revisions } = gigData;

    const prompt = `You are an expert freelancing platform quality analyst. Carefully analyze this gig and provide an HONEST, OBJECTIVE quality score.

Gig Details:
- Title: "${gigTitle}"
- Description: "${shortDescription}"
- Category: ${category || "General"}
- Price: $${price || "Not set"}
- Delivery Time: ${deliveryTime || "Not set"} days
- Revisions: ${revisions || "Not set"}

SCORING CRITERIA (Be strict and realistic):

Title Analysis (0-25 points):
- Is it clear and specific? (0-10 pts)
- Does it include relevant keywords? (0-8 pts)
- Is it professional and engaging? (0-7 pts)

Description Analysis (0-35 points):
- Is it detailed and comprehensive? (0-15 pts)
- Does it explain deliverables clearly? (0-10 pts)
- Is it well-structured and easy to read? (0-10 pts)

Pricing & Value (0-20 points):
- Is the price competitive for the service? (0-10 pts)
- Does it communicate value clearly? (0-10 pts)

Delivery & Revisions (0-20 points):
- Is delivery time realistic? (0-10 pts)
- Are revision terms clear? (0-10 pts)

IMPORTANT: 
- Be CRITICAL and HONEST in your assessment
- A score of 85+ should only be given to truly excellent gigs
- 70-84: Good but has room for improvement
- 50-69: Needs significant improvement
- Below 50: Major issues that need fixing
- DO NOT default to 85 - calculate based on actual quality

Provide your honest assessment in JSON format:
{
  "score": [calculate actual score 0-100 based on criteria above],
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "feedback": ["detailed actionable feedback 1", "detailed actionable feedback 2", "detailed actionable feedback 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,  // Lower temperature for more consistent, analytical scoring
      max_tokens: 800,    // Increased for detailed feedback
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Validate and ensure score is a number between 0-100
    if (typeof response.score !== 'number') {
      response.score = parseInt(response.score) || 50;
    }
    response.score = Math.max(0, Math.min(100, response.score));
    
    // Ensure arrays exist and have content
    response.strengths = Array.isArray(response.strengths) ? response.strengths : [];
    response.improvements = Array.isArray(response.improvements) ? response.improvements : [];
    response.feedback = Array.isArray(response.feedback) ? response.feedback : [];
    
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

// ==================== PROPOSAL AI FEATURES ====================

/**
 * Generate a professional cover letter for a job proposal
 * @param {Object} jobData - { jobTitle, jobDescription, jobBudget, freelancerSkills }
 * @returns {Promise<Object>} - { coverLetter: string, tips: string[] }
 */
export const generateCoverLetter = async (jobData) => {
  try {
    const { jobTitle, jobDescription, jobBudget, freelancerSkills } = jobData;

    const prompt = `You are an expert freelance proposal writer. Generate a compelling, professional cover letter for this job application.

Job Details:
- Title: "${jobTitle}"
- Description: "${jobDescription}"
- Budget: $${jobBudget || "Not specified"}
- Freelancer Skills: ${freelancerSkills || "General skills"}

Requirements for the cover letter:
- Length: 200-400 words (professional, not too short or too long)
- Personalized to THIS specific job
- Show understanding of the job requirements
- Highlight relevant skills and experience (based on provided skills)
- Explain the approach/solution briefly
- Professional yet conversational tone
- Include why you're a great fit
- End with a clear call-to-action
- DO NOT include placeholder names like [Your Name] - write in first person ("I", "my")
- DO NOT make up specific years of experience if not provided
- Focus on value and problem-solving

Format your response as JSON:
{
  "coverLetter": "Your complete professional cover letter text here. Make it compelling and job-specific.",
  "tips": ["tip 1 for improving this proposal", "tip 2", "tip 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Ensure coverLetter is a string
    if (typeof response.coverLetter !== 'string') {
      response.coverLetter = String(response.coverLetter);
    }
    
    return response;
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    throw new Error("Failed to generate cover letter with AI");
  }
};

/**
 * Improve an existing cover letter draft
 * @param {Object} data - { draft, jobTitle, jobDescription }
 * @returns {Promise<Object>} - { improved: string, improvements: string[] }
 */
export const improveCoverLetter = async (data) => {
  try {
    const { draft, jobTitle, jobDescription } = data;

    const prompt = `You are an expert freelance proposal editor. Improve the following cover letter draft.

Job Context:
- Job Title: "${jobTitle}"
- Job Description: "${jobDescription}"

Original Cover Letter Draft:
"${draft}"

IMPORTANT: The draft may contain spelling or grammar errors - fix them while preserving the author's intent.

Improvements to make:
- Fix any spelling, grammar, or punctuation errors
- Make it more professional and compelling
- Ensure it's personalized to the job
- Improve clarity and structure
- Strengthen the value proposition
- Optimize length (aim for 200-400 words)
- Remove any generic phrases
- Make the call-to-action stronger
- Keep the author's voice but make it more professional

Provide:
1. The improved cover letter
2. List of specific improvements made

Format your response as JSON:
{
  "improved": "The improved cover letter text here",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Ensure improved is a string
    if (typeof response.improved !== 'string') {
      response.improved = String(response.improved);
    }
    
    return response;
  } catch (error) {
    console.error("Error improving cover letter:", error.message);
    throw new Error("Failed to improve cover letter with AI");
  }
};

/**
 * Analyze a complete proposal and provide quality score with feedback
 * @param {Object} proposalData - { coverLetter, proposedPrice, deliveryTime, jobBudget, jobDuration }
 * @returns {Promise<Object>} - { score: number, strengths: string[], improvements: string[], feedback: string[] }
 */
export const analyzeProposal = async (proposalData) => {
  try {
    const { coverLetter, proposedPrice, deliveryTime, jobBudget, jobDuration } = proposalData;

    const prompt = `You are an expert freelancing platform quality analyst. Analyze this job proposal and provide an HONEST, OBJECTIVE quality score.

Proposal Details:
- Cover Letter: "${coverLetter}"
- Proposed Bid: $${proposedPrice}
- Delivery Time: ${deliveryTime} days
- Client's Budget: $${jobBudget || "Not specified"}
- Expected Duration: ${jobDuration || "Not specified"}

SCORING CRITERIA (Be strict and realistic):

Cover Letter Quality (0-50 points):
- Is it personalized and relevant? (0-15 pts)
- Does it demonstrate understanding of the job? (0-15 pts)
- Is it professional and well-written? (0-10 pts)
- Does it highlight relevant skills? (0-10 pts)

Bid Competitiveness (0-25 points):
- Is the bid reasonable compared to budget? (0-15 pts)
- Does it offer good value for money? (0-10 pts)

Delivery Time (0-15 points):
- Is it realistic for the scope? (0-10 pts)
- Does it match or beat expected duration? (0-5 pts)

Overall Professional Appeal (0-10 points):
- Overall impression and professionalism (0-10 pts)

IMPORTANT:
- Be CRITICAL and HONEST
- 85+ only for truly excellent proposals
- 70-84: Good but needs improvement
- 50-69: Needs significant work
- Below 50: Major issues
- Calculate based on actual quality

Provide your honest assessment in JSON format:
{
  "score": [calculate actual score 0-100],
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "feedback": ["detailed actionable feedback 1", "detailed actionable feedback 2", "detailed actionable feedback 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Validate score
    if (typeof response.score !== 'number') {
      response.score = parseInt(response.score) || 50;
    }
    response.score = Math.max(0, Math.min(100, response.score));
    
    // Ensure arrays exist
    response.strengths = Array.isArray(response.strengths) ? response.strengths : [];
    response.improvements = Array.isArray(response.improvements) ? response.improvements : [];
    response.feedback = Array.isArray(response.feedback) ? response.feedback : [];
    
    return response;
  } catch (error) {
    console.error("Error analyzing proposal:", error.message);
    throw new Error("Failed to analyze proposal with AI");
  }
};

/**
 * Analyze bid amount and provide smart pricing recommendations
 * @param {Object} bidData - { jobDescription, jobBudget, currentBid, deliveryTime, milestones }
 * @returns {Promise<Object>} - { recommendedBid: number, bidRange: { min, max }, competitiveness: string, reasoning: string, insights: string[] }
 */
export const analyzeBidAmount = async (bidData) => {
  try {
    const { jobDescription, jobBudget, currentBid, deliveryTime, milestones } = bidData;

    const prompt = `You are an expert freelancing platform pricing consultant. Analyze the bid amount and provide recommendations.

Job & Bid Context:
- Job Description: "${jobDescription}"
- Client's Budget: $${jobBudget || "Not specified"}
- Current Bid: $${currentBid || "Not entered yet"}
- Delivery Time: ${deliveryTime || "Not set"} days
- Number of Milestones: ${milestones || 0}

Consider:
1. Job complexity and required skills
2. Client's budget expectations
3. Market rates for similar work
4. Delivery timeframe
5. Whether bid is too high/low/just right
6. How to position the bid competitively

Assess competitiveness as:
- "Too Low" if significantly underpriced (may signal low quality)
- "Competitive" if well-positioned in sweet spot
- "High but Justified" if premium but offers clear value
- "Too High" if likely to lose to competitors

Format your response as JSON:
{
  "recommendedBid": 250,
  "bidRange": {
    "min": 200,
    "max": 350
  },
  "competitiveness": "Competitive|Too Low|High but Justified|Too High",
  "reasoning": "Brief explanation of the recommendation",
  "insights": ["insight 1", "insight 2", "insight 3"]
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
    console.error("Error analyzing bid amount:", error.message);
    throw new Error("Failed to analyze bid with AI");
  }
};

/**
 * Generate project milestones automatically based on job description
 * @param {Object} projectData - { jobDescription, deliveryTime, totalBid }
 * @returns {Promise<Object>} - { milestones: Array<{ description, amount, duration }>, tips: string[] }
 */
export const generateMilestones = async (projectData) => {
  try {
    const { jobDescription, deliveryTime, totalBid } = projectData;

    const prompt = `You are an expert freelancing platform project manager. Generate realistic project milestones based on the job details.

Project Details:
- Job Description: "${jobDescription}"
- Total Delivery Time: ${deliveryTime} days
- Total Bid Amount: $${totalBid}

Requirements:
- Generate 2-5 logical milestones (based on project complexity)
- Each milestone should have: description, amount ($), and duration (days)
- Milestones should cover the full project lifecycle
- Amounts should sum to the total bid
- Durations should sum to total delivery time
- Make milestone descriptions specific and measurable
- Follow industry best practices (e.g., 30% upfront, 40% mid-project, 30% completion)

Examples of good milestones:
- "Initial research and project setup" (20%, 2 days)
- "Core development and implementation" (50%, 5 days)
- "Testing, revisions, and final delivery" (30%, 3 days)

Format your response as JSON:
{
  "milestones": [
    {
      "description": "Milestone 1 description",
      "amount": "50",
      "duration": "3"
    },
    {
      "description": "Milestone 2 description", 
      "amount": "100",
      "duration": "5"
    }
  ],
  "tips": ["tip 1 about milestone planning", "tip 2", "tip 3"]
}

IMPORTANT: Return amounts and durations as string numbers (e.g., "50" not 50) for form compatibility.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Ensure milestones is an array
    if (!Array.isArray(response.milestones)) {
      response.milestones = [];
    }
    
    // Ensure each milestone has required fields as strings
    response.milestones = response.milestones.map(m => ({
      description: String(m.description || ''),
      amount: String(m.amount || '0'),
      duration: String(m.duration || '1')
    }));
    
    return response;
  } catch (error) {
    console.error("Error generating milestones:", error.message);
    throw new Error("Failed to generate milestones with AI");
  }
};

/**
 * Generate a professional job title from a description
 * @param {string} description - Job description or rough idea
 * @param {string} category - Job category
 * @returns {Promise<Object>} - { title: string, alternatives: string[] }
 */
export const generateJobTitle = async (description, category = "") => {
  try {
    const prompt = `You are an expert job posting consultant. Generate a professional, clear, and SEO-friendly job title based on this description.

Job Description: "${description}"
Category: ${category || "General"}

Requirements:
- Create a clear, professional job title (under 80 characters)
- Make it specific and action-oriented
- Include key role/skill in the title
- Avoid vague terms like "Expert needed" or "Looking for"
- Make it attractive to qualified freelancers

Provide:
1. Best job title
2. 2-3 alternative title options

Format your response as JSON:
{
  "title": "your best job title",
  "alternatives": ["alternative 1", "alternative 2", "alternative 3"]
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
    console.error("Error generating job title:", error.message);
    throw new Error("Failed to generate job title with AI");
  }
};

/**
 * Enhance a job description with AI
 * @param {string} description - Original job description
 * @param {string} title - Job title for context
 * @param {string} category - Job category
 * @returns {Promise<Object>} - { enhanced: string, improvements: string[] }
 */
export const enhanceJobDescription = async (description, title = "", category = "") => {
  try {
    const prompt = `You are an expert job posting consultant. Enhance the following job description to be more professional, detailed, and attractive to qualified freelancers.

Job Title: ${title || "Not specified"}
Category: ${category || "General"}
Current Description: "${description}"

Requirements:
- Fix spelling and grammar errors
- Add clear structure (Overview, Requirements, Deliverables)
- Expand vague points with specific details
- Keep it professional and welcoming
- Length: 300-500 words
- Make expectations and deliverables crystal clear

Provide:
1. Enhanced description
2. List of key improvements made

Format your response as JSON:
{
  "enhanced": "your enhanced description with proper structure",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Ensure enhanced is a string (AI sometimes returns nested objects)
    if (typeof response.enhanced === 'object' && response.enhanced !== null) {
      // If it's an object, convert it to a formatted string
      response.enhanced = Object.entries(response.enhanced)
        .map(([key, value]) => `**${key}**\n${value}`)
        .join('\n\n');
    }
    
    return response;
  } catch (error) {
    console.error("Error enhancing job description:", error.message);
    throw new Error("Failed to enhance job description with AI");
  }
};

/**
 * Recommend a budget range for a job
 * @param {Object} jobData - Job details
 * @returns {Promise<Object>} - Budget recommendation with reasoning
 */
export const recommendJobBudget = async (jobData) => {
  try {
    const { title, description, category, complexity, duration } = jobData;

    const prompt = `You are an expert freelancing platform budget consultant. Analyze this job and recommend a fair budget range.

Job Title: ${title || "Not specified"}
Category: ${category || "General"}
Description: "${description}"
Complexity: ${complexity || "Medium"}
Expected Duration: ${duration || "Not specified"}

Based on current market rates and job requirements:
- Analyze the scope and complexity
- Consider the skills and expertise required
- Recommend a min and max budget range
- Provide reasoning for your recommendation
- Give insights about market rates

Format your response as JSON:
{
  "recommendedMin": 500,
  "recommendedMax": 1500,
  "suggested": 1000,
  "reasoning": "explanation of budget recommendation",
  "insights": ["insight 1", "insight 2"],
  "marketRate": "Brief market context for this type of work"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error recommending budget:", error.message);
    throw new Error("Failed to recommend budget with AI");
  }
};

/**
 * Suggest required skills for a job
 * @param {Object} jobData - Job details
 * @returns {Promise<Object>} - Suggested skills with categories
 */
export const suggestRequiredSkills = async (jobData) => {
  try {
    const { title, description, category } = jobData;

    const prompt = `You are an expert job posting consultant. Analyze this job and suggest the required skills and qualifications.

Job Title: ${title || "Not specified"}
Category: ${category || "General"}
Description: "${description}"

Based on the job requirements:
- Identify 5-8 key technical skills needed
- Include relevant soft skills (2-3)
- Categorize as "required" or "preferred"
- Be specific (e.g., "React.js" not just "Frontend")

Format your response as JSON:
{
  "technicalSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "softSkills": ["skill1", "skill2", "skill3"],
  "required": ["must-have skill1", "must-have skill2"],
  "preferred": ["nice-to-have skill1", "nice-to-have skill2"],
  "reasoning": "Brief explanation of why these skills are important"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error suggesting skills:", error.message);
    throw new Error("Failed to suggest skills with AI");
  }
};

/**
 * Estimate project timeline/duration
 * @param {Object} jobData - Job details
 * @returns {Promise<Object>} - Timeline estimate with breakdown
 */
export const estimateProjectTimeline = async (jobData) => {
  try {
    const { title, description, category, budget } = jobData;

    const prompt = `You are an expert project timeline consultant. Analyze this job and estimate a realistic project timeline.

Job Title: ${title || "Not specified"}
Category: ${category || "General"}
Description: "${description}"
Budget: ${budget ? `$${budget}` : "Not specified"}

Based on the scope and complexity:
- Estimate total project duration in days
- Provide min and max range
- Break down into phases if complex
- Consider realistic work pace
- Account for revisions and feedback

Format your response as JSON:
{
  "estimatedDays": 14,
  "minDays": 10,
  "maxDays": 21,
  "phases": [
    {"name": "Phase 1", "days": 5, "description": "Brief description"},
    {"name": "Phase 2", "days": 7, "description": "Brief description"}
  ],
  "reasoning": "Explanation of timeline estimate",
  "considerations": ["consideration 1", "consideration 2"]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error("Error estimating timeline:", error.message);
    throw new Error("Failed to estimate timeline with AI");
  }
};
