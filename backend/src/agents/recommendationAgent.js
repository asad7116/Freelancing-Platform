/**
 * recommendationAgent.js
 * ──────────────────────
 * Agentic AI layer for the TIXE recommendation system.
 * Uses the Groq LLM (Llama 3.3) for:
 *   1. Planning / reasoning  — normalise input + decide retrieval strategy
 *   2. Draft scoring         — rank retrieved candidates with explanations
 *   3. Reflection / critique — self-review the draft and improve it
 *   4. Email body generation — compose personalised recommendation emails
 *
 * All functions are pure async helpers that accept data and return
 * structured JSON.  No DB or email calls happen here.
 *
 * ── Configuration ──────────────────────────────────────────────
 *   GROQ_API_KEY  — set in your .env file
 *   The existing groq-sdk client from ai.service.js is reused.
 * ───────────────────────────────────────────────────────────────
 */

import Groq from "groq-sdk"

// ── Lazy Groq client (same pattern as ai.service.js) ──────────────────────
let _client = null
function groq() {
  if (!_client) {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error("GROQ_API_KEY env var is missing")
    _client = new Groq({ apiKey: key })
  }
  return _client
}

const MODEL = "llama-3.3-70b-versatile"

// ── Helper: call LLM and parse JSON from response ────────────────────────
async function llmJson(systemPrompt, userPrompt, temperature = 0.4) {
  const res = await groq().chat.completions.create({
    model: MODEL,
    temperature,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })
  return JSON.parse(res.choices[0].message.content)
}

async function llmText(systemPrompt, userPrompt, temperature = 0.6) {
  const res = await groq().chat.completions.create({
    model: MODEL,
    temperature,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })
  return res.choices[0].message.content.trim()
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.  PARSE & PLAN  — normalise the raw input into a structured task
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ask the LLM to normalise a job or freelancer input and outline
 * a retrieval strategy.
 *
 * @param {'job'|'freelancer'} inputType
 * @param {object} rawInput — the raw job post or freelancer profile
 * @returns {Promise<{normalizedInput: object, retrievalPlan: string[]}>}
 */
export async function planRetrieval(inputType, rawInput) {
  const system = `You are a recommendation-planning agent for TIXE, an AI-powered freelancing platform.
Given a raw ${inputType === "job" ? "job post" : "freelancer profile"}, produce a JSON object with:
{
  "normalizedInput": {
    "type": "${inputType}",
    "skills": ["skill1", "skill2"],
    "budgetRange": { "min": <number|null>, "max": <number|null> },
    "categories": ["category name"],
    "level": "junior" | "mid" | "senior",
    "userId": "<original user/buyer id>"
  },
  "retrievalPlan": [
    "step 1 description",
    "step 2 description"
  ]
}
Rules:
- Extract skills from title, description, mandatory_skills, nice_to_have_skills (jobs) or skills array (freelancer).
- Map experience_level to junior/mid/senior. If missing, infer from context.
- For budget, use hourly_rate_from/to or fixed_price (jobs) or hourlyRate (freelancer).
- Categories can be inferred from category name or description.
- retrievalPlan should list 2-4 concrete MongoDB-query strategies to find matches.
Return ONLY valid JSON.`

  const user = `Raw ${inputType} input:\n${JSON.stringify(rawInput, null, 2)}`
  return llmJson(system, user, 0.3)
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.  DRAFT SCORING  — rank a list of candidates
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Given the normalised task and a list of raw DB candidates, ask
 * the LLM to score + explain each.
 *
 * @param {object}   normalizedInput — from planRetrieval
 * @param {object[]} candidates      — raw DB docs (freelancers or jobs)
 * @param {'freelancer'|'job'} candidateType
 * @returns {Promise<Array<{id:string, score:number, reason:string}>>}
 */
export async function draftRecommendations(normalizedInput, candidates, candidateType) {
  const system = `You are a scoring agent for TIXE, a freelancing platform.
You receive a normalised search context and a list of ${candidateType} candidates.
Score each candidate from 0.0 to 1.0 and write a short reason (1-2 sentences).

Return JSON:
{
  "recommendations": [
    { "id": "<candidate id>", "score": 0.92, "reason": "..." },
    ...
  ]
}
Scoring criteria:
- Skill overlap (most important — weight ~40%)
- Budget/rate alignment (weight ~25%)
- Experience level match (weight ~20%)
- Category relevance (weight ~15%)
Sort by score descending. Include ALL candidates; the caller will trim later.
Return ONLY valid JSON.`

  const user = `Search context:\n${JSON.stringify(normalizedInput, null, 2)}\n\nCandidates:\n${JSON.stringify(candidates, null, 2)}`
  const result = await llmJson(system, user, 0.3)
  return result.recommendations || []
}

// ═══════════════════════════════════════════════════════════════════════════
// 3.  REFLECTION / CRITIQUE  — self-review the draft list
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run a single critic pass over the draft recommendations.
 *
 * @param {object}   normalizedInput
 * @param {Array<{id:string, score:number, reason:string}>} draftList
 * @param {'freelancer'|'job'} candidateType
 * @returns {Promise<Array<{id:string, score:number, reason:string}>>}
 */
export async function reflectOnRecommendations(normalizedInput, draftList, candidateType) {
  const system = `You are a quality-review agent for the TIXE recommendation engine.
You receive:
  1. The normalised search context.
  2. A draft list of scored ${candidateType} recommendations.

Your tasks:
  - Check relevance: do the candidate skills actually match the requirements?
  - Check budget/rate alignment: is there a mismatch?
  - Flag obviously bad matches and explain why.
  - Suggest re-scores or removals where needed.

Return an IMPROVED JSON list (same format) keeping only good matches, re-scored and re-sorted:
{
  "recommendations": [
    { "id": "...", "score": 0.90, "reason": "Updated reason after review..." },
    ...
  ],
  "droppedIds": ["id1", "id2"],
  "reflectionNotes": "Brief summary of what was changed and why."
}
Return ONLY valid JSON.`

  const user = `Search context:\n${JSON.stringify(normalizedInput, null, 2)}\n\nDraft recommendations:\n${JSON.stringify(draftList, null, 2)}`
  const result = await llmJson(system, user, 0.3)
  console.log("[Agent] Reflection notes:", result.reflectionNotes || "none")
  return result.recommendations || draftList // fallback to draft if LLM fails
}

// ═══════════════════════════════════════════════════════════════════════════
// 4.  EMAIL BODY GENERATION  — compose human-readable email content
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate the HTML body for the client's recommendation email.
 *
 * @param {object}   job                   — original job post
 * @param {object[]} recommendedFreelancers — enriched with name, skills, score, reason
 * @returns {Promise<string>} HTML string (body only, not full page)
 */
export async function generateClientEmailBody(job, recommendedFreelancers) {
  const system = `You are an email copywriter for TIXE, an AI freelancing platform.
Write a professional, friendly HTML email body (just the inner content, no <html>/<head>/<body> wrappers) for a client.
The email tells them about the top freelancer matches for their job.
Use <h2>, <p>, <ul>/<li>, and inline styles sparingly.
Keep it concise and scannable.`

  const user = `Job title: ${job.title || job.gigTitle || "Untitled"}
Job description: ${job.description || job.shortDescription || "N/A"}
Required skills: ${(job.mandatory_skills || job.skills || []).join(", ")}

Top recommended freelancers:
${recommendedFreelancers.map((f, i) => `${i + 1}. ${f.name} — Skills: ${(f.skills || []).join(", ")} — Score: ${f.score} — Why: ${f.reason}`).join("\n")}`

  return llmText(system, user, 0.5)
}

/**
 * Generate the HTML body for a freelancer's job-match email.
 *
 * @param {object} freelancer — { name, skills }
 * @param {object} job        — the matched job
 * @param {string} reason     — why they matched
 * @returns {Promise<string>} HTML string (body only)
 */
export async function generateFreelancerEmailBody(freelancer, job, reason) {
  const system = `You are an email copywriter for TIXE, an AI freelancing platform.
Write a professional, friendly HTML email body (just the inner content, no <html>/<head>/<body> wrappers) for a freelancer.
The email tells them about a new job that matches their profile.
Include a call-to-action to view/apply for the job.
Use <h2>, <p>, and inline styles sparingly. Keep it concise.`

  const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000"
  const jobUrl = `${frontendUrl}/job/${job.id || job._id}`

  const user = `Freelancer name: ${freelancer.name}
Freelancer skills: ${(freelancer.skills || []).join(", ")}

Matched job:
- Title: ${job.title || "Untitled"}
- Description: ${job.description || "N/A"}
- Skills needed: ${(job.mandatory_skills || []).join(", ")}
- Budget: ${job.fixed_price ? `$${job.fixed_price} fixed` : `$${job.hourly_rate_from || "?"}-$${job.hourly_rate_to || "?"}/hr`}
- Why matched: ${reason}
- Link: ${jobUrl}`

  return llmText(system, user, 0.5)
}

/**
 * Generate the HTML body for a freelancer receiving a list of matched jobs.
 *
 * @param {object}   freelancer
 * @param {object[]} matchedJobs — enriched with score, reason
 * @returns {Promise<string>} HTML string (body only)
 */
export async function generateFreelancerJobsEmailBody(freelancer, matchedJobs) {
  const system = `You are an email copywriter for TIXE, an AI freelancing platform.
Write a professional, friendly HTML email body (just the inner content, no <html>/<head>/<body> wrappers) for a freelancer.
The email lists top job matches for their profile.
Include a short reason for each match and a link to view the job.
Use <h2>, <p>, <ul>/<li>, and inline styles sparingly. Keep it concise and scannable.`

  const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000"

  const user = `Freelancer name: ${freelancer.name}
Freelancer skills: ${(freelancer.skills || []).join(", ")}

Top matched jobs:
${matchedJobs.map((j, i) => `${i + 1}. ${j.title || "Untitled"} — Budget: ${j.fixed_price ? `$${j.fixed_price}` : `$${j.hourly_rate_from || "?"}-$${j.hourly_rate_to || "?"}/hr`} — Score: ${j.score} — Why: ${j.reason} — Link: ${frontendUrl}/job/${j.id || j._id}`).join("\n")}`

  return llmText(system, user, 0.5)
}

export default {
  planRetrieval,
  draftRecommendations,
  reflectOnRecommendations,
  generateClientEmailBody,
  generateFreelancerEmailBody,
  generateFreelancerJobsEmailBody,
}
