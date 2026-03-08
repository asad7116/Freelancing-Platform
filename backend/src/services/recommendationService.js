/**
 * recommendationService.js
 * ────────────────────────
 * Orchestrates the full agentic recommendation pipeline for TIXE:
 *
 *   parse → plan → retrieve → draft → reflect → finalise → email
 *
 * Two public entry-points:
 *   • recommendFreelancersForJob(jobInput)
 *   • recommendJobsForFreelancer(freelancerInput)
 *
 * Each returns:
 * {
 *   context: { inputType, normalizedInput },
 *   recommendations: [ { id, score, reason } ]
 * }
 *
 * Email sending is fire-and-forget (logged but won't block the response).
 */

import { ObjectId } from "mongodb"
import { getDatabase } from "../db/mongodb.js"
import {
  planRetrieval,
  draftRecommendations,
  reflectOnRecommendations,
  generateClientEmailBody,
  generateFreelancerEmailBody,
  generateFreelancerJobsEmailBody,
} from "../agents/recommendationAgent.js"
import {
  sendClientRecommendationEmail,
  sendFreelancerJobMatchEmail,
  sendFreelancerJobsListEmail,
} from "../services/email.service.js"

// ── Config ────────────────────────────────────────────────────────────────
const MAX_CANDIDATES = 30  // max docs to pull from DB before scoring
const TOP_N          = 5   // final number of recommendations to return

// ═══════════════════════════════════════════════════════════════════════════
//  RECOMMEND FREELANCERS FOR A JOB  (client-facing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {object} jobInput — a full job post document or a subset:
 *   { _id|id, title, description, mandatory_skills, nice_to_have_skills,
 *     budget_type, hourly_rate_from, hourly_rate_to, fixed_price,
 *     experience_level, category_id, buyer_id }
 */
export async function recommendFreelancersForJob(jobInput) {
  const db = await getDatabase()

  // ── 1. Parse & Plan ────────────────────────────────────────────────────
  console.log("[Recommend] Step 1 — planning retrieval for job…")
  const { normalizedInput, retrievalPlan } = await planRetrieval("job", jobInput)
  console.log("[Recommend] Plan:", retrievalPlan)

  // ── 2. Retrieve candidates from MongoDB ────────────────────────────────
  console.log("[Recommend] Step 2 — querying freelancers…")
  const candidates = await retrieveFreelancers(db, normalizedInput)
  console.log(`[Recommend] Found ${candidates.length} candidate freelancers`)

  if (candidates.length === 0) {
    return {
      context: { inputType: "job", normalizedInput },
      recommendations: [],
    }
  }

  // ── 3. Draft scoring via LLM ──────────────────────────────────────────
  console.log("[Recommend] Step 3 — LLM draft scoring…")
  const draft = await draftRecommendations(normalizedInput, candidates, "freelancer")

  // ── 4. Reflection / critique ──────────────────────────────────────────
  console.log("[Recommend] Step 4 — LLM reflection…")
  const refined = await reflectOnRecommendations(normalizedInput, draft, "freelancer")

  // ── 5. Finalise ───────────────────────────────────────────────────────
  const final = refined
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)

  const result = {
    context: { inputType: "job", normalizedInput },
    recommendations: final,
  }

  // ── 6. Send emails (fire-and-forget) ──────────────────────────────────
  sendRecommendationEmailsForJob(db, jobInput, final).catch((err) => {
    console.error("[Recommend] Email dispatch error:", err.message)
  })

  // TODO: log recommendation event for analytics / click tracking

  return result
}

// ═══════════════════════════════════════════════════════════════════════════
//  RECOMMEND JOBS FOR A FREELANCER  (freelancer-facing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {object} freelancerInput — a freelancer profile document or subset:
 *   { user_id, title, skills, hourlyRate, experience, location, bio }
 */
export async function recommendJobsForFreelancer(freelancerInput) {
  const db = await getDatabase()

  // ── 1. Parse & Plan ────────────────────────────────────────────────────
  console.log("[Recommend] Step 1 — planning retrieval for freelancer…")
  const { normalizedInput, retrievalPlan } = await planRetrieval("freelancer", freelancerInput)
  console.log("[Recommend] Plan:", retrievalPlan)

  // ── 2. Retrieve candidate jobs ────────────────────────────────────────
  console.log("[Recommend] Step 2 — querying jobs…")
  const candidates = await retrieveJobs(db, normalizedInput)
  console.log(`[Recommend] Found ${candidates.length} candidate jobs`)

  if (candidates.length === 0) {
    return {
      context: { inputType: "freelancer", normalizedInput },
      recommendations: [],
    }
  }

  // ── 3. Draft scoring via LLM ──────────────────────────────────────────
  console.log("[Recommend] Step 3 — LLM draft scoring…")
  const draft = await draftRecommendations(normalizedInput, candidates, "job")

  // ── 4. Reflection / critique ──────────────────────────────────────────
  console.log("[Recommend] Step 4 — LLM reflection…")
  const refined = await reflectOnRecommendations(normalizedInput, draft, "job")

  // ── 5. Finalise ───────────────────────────────────────────────────────
  const final = refined
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)

  const result = {
    context: { inputType: "freelancer", normalizedInput },
    recommendations: final,
  }

  // ── 6. Send emails (fire-and-forget) ──────────────────────────────────
  sendRecommendationEmailsForFreelancer(db, freelancerInput, final, candidates).catch((err) => {
    console.error("[Recommend] Email dispatch error:", err.message)
  })

  // TODO: log recommendation event for analytics / click tracking

  return result
}

// ═══════════════════════════════════════════════════════════════════════════
//  MONGODB RETRIEVAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query freelancer profiles that might match a normalised job description.
 * Uses a multi-strategy approach: skill overlap → budget → category.
 */
async function retrieveFreelancers(db, normalizedInput) {
  const profiles = db.collection("freelancerProfiles")
  const users    = db.collection("users")

  const skills = (normalizedInput.skills || []).map((s) => s.toLowerCase())
  const budget = normalizedInput.budgetRange || {}

  // Build query: find freelancers whose skills overlap
  const query = {}
  if (skills.length > 0) {
    // Case-insensitive regex match on skills array
    query.skills = {
      $elemMatch: {
        $regex: skills.map((s) => `(${escapeRegex(s)})`).join("|"),
        $options: "i",
      },
    }
  }

  // Optional: filter by hourly rate within budget
  if (budget.max) {
    query.hourlyRate = { $lte: budget.max * 1.2 } // 20% tolerance
  }

  let results = await profiles
    .find(query)
    .limit(MAX_CANDIDATES)
    .toArray()

  // Fallback: if skill filter too strict, relax to all profiles (limited)
  if (results.length < 3 && skills.length > 0) {
    const fallback = await profiles
      .find({})
      .sort({ updated_at: -1 })
      .limit(MAX_CANDIDATES)
      .toArray()
    // Merge without duplicates
    const ids = new Set(results.map((r) => r._id.toString()))
    for (const f of fallback) {
      if (!ids.has(f._id.toString())) results.push(f)
      if (results.length >= MAX_CANDIDATES) break
    }
  }

  // Enrich with user name + email
  const userIds = [...new Set(results.map((r) => r.user_id).filter(Boolean))]
  const userDocs = userIds.length
    ? await users.find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1, email: 1 } }).toArray()
    : []
  const userMap = Object.fromEntries(userDocs.map((u) => [u._id.toString(), u]))

  return results.map((r) => {
    const u = userMap[r.user_id] || {}
    return {
      id: r._id.toString(),
      user_id: r.user_id,
      name: u.name || "Freelancer",
      email: u.email || null,
      title: r.title || "",
      bio: r.bio || "",
      skills: r.skills || [],
      hourlyRate: r.hourlyRate || null,
      experience: r.experience || null,
      location: r.location || null,
    }
  })
}

/**
 * Query job posts that might match a normalised freelancer profile.
 */
async function retrieveJobs(db, normalizedInput) {
  const jobPosts   = db.collection("jobPosts")
  const users      = db.collection("users")
  const categories = db.collection("categories")

  const skills = (normalizedInput.skills || []).map((s) => s.toLowerCase())
  const budget = normalizedInput.budgetRange || {}

  // Build query: skill overlap on mandatory_skills or nice_to_have_skills
  const query = { status: "active" }

  if (skills.length > 0) {
    const regex = skills.map((s) => `(${escapeRegex(s)})`).join("|")
    query.$or = [
      { mandatory_skills: { $elemMatch: { $regex: regex, $options: "i" } } },
      { nice_to_have_skills: { $elemMatch: { $regex: regex, $options: "i" } } },
    ]
  }

  let results = await jobPosts
    .find(query)
    .sort({ created_at: -1 })
    .limit(MAX_CANDIDATES)
    .toArray()

  // Fallback
  if (results.length < 3 && skills.length > 0) {
    const fallback = await jobPosts
      .find({ status: "active" })
      .sort({ created_at: -1 })
      .limit(MAX_CANDIDATES)
      .toArray()
    const ids = new Set(results.map((r) => r._id.toString()))
    for (const j of fallback) {
      if (!ids.has(j._id.toString())) results.push(j)
      if (results.length >= MAX_CANDIDATES) break
    }
  }

  // Enrich with buyer info and category name
  const buyerIds = [...new Set(results.map((r) => r.buyer_id).filter(Boolean))]
  const buyerDocs = buyerIds.length
    ? await users.find({ _id: { $in: buyerIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1, email: 1 } }).toArray()
    : []
  const buyerMap = Object.fromEntries(buyerDocs.map((u) => [u._id.toString(), u]))

  const catIds = [...new Set(results.map((r) => r.category_id).filter(Boolean))]
  const catDocs = catIds.length
    ? await categories.find({ _id: { $in: catIds.map((id) => { try { return new ObjectId(id) } catch { return id } }) } }).toArray()
    : []
  const catMap = Object.fromEntries(catDocs.map((c) => [c._id.toString(), c.name]))

  return results.map((r) => {
    const buyer = buyerMap[r.buyer_id] || {}
    return {
      id: r._id.toString(),
      title: r.title || "Untitled",
      description: r.description || r.summary || "",
      mandatory_skills: r.mandatory_skills || [],
      nice_to_have_skills: r.nice_to_have_skills || [],
      budget_type: r.budget_type,
      hourly_rate_from: r.hourly_rate_from,
      hourly_rate_to: r.hourly_rate_to,
      fixed_price: r.fixed_price,
      experience_level: r.experience_level,
      category: catMap[r.category_id] || "General",
      buyer_id: r.buyer_id,
      buyer_name: buyer.name || "Client",
      buyer_email: buyer.email || null,
      status: r.status,
      created_at: r.created_at,
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════
//  EMAIL DISPATCH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * After recommending freelancers for a job:
 *   1. Email the client with top freelancers.
 *   2. Email each recommended freelancer about the job.
 */
async function sendRecommendationEmailsForJob(db, jobInput, recommendations) {
  const users = db.collection("users")
  const profilesColl = db.collection("freelancerProfiles")

  // Get client info
  const buyerId = jobInput.buyer_id || jobInput.buyerId
  if (!buyerId) {
    console.warn("[Recommend/Email] No buyer_id — skipping client email")
    return
  }

  const client = await users.findOne({ _id: new ObjectId(buyerId) }, { projection: { name: 1, email: 1 } })
  if (!client?.email) {
    console.warn("[Recommend/Email] Client has no email — skipping")
    return
  }

  // Enrich recommendations with freelancer details
  const enriched = []
  for (const rec of recommendations) {
    const profile = await profilesColl.findOne({ _id: new ObjectId(rec.id) })
    if (!profile) continue
    const user = await users.findOne({ _id: new ObjectId(profile.user_id) }, { projection: { name: 1, email: 1 } })
    enriched.push({
      ...rec,
      name: user?.name || "Freelancer",
      email: user?.email || null,
      skills: profile.skills || [],
      hourlyRate: profile.hourlyRate,
    })
  }

  // 1. Send summary email to client
  try {
    const emailBody = await generateClientEmailBody(jobInput, enriched)
    await sendClientRecommendationEmail(client.email, client.name, jobInput, emailBody)
    console.log("[Recommend/Email] Client email sent to", client.email)
  } catch (err) {
    console.error("[Recommend/Email] Client email failed:", err.message)
  }

  // 2. Send personalised email to each recommended freelancer
  for (const fl of enriched) {
    if (!fl.email) continue
    try {
      const emailBody = await generateFreelancerEmailBody(
        { name: fl.name, skills: fl.skills },
        jobInput,
        fl.reason
      )
      await sendFreelancerJobMatchEmail(fl.email, fl.name, jobInput, emailBody)
      console.log("[Recommend/Email] Freelancer email sent to", fl.email)
    } catch (err) {
      console.error("[Recommend/Email] Freelancer email failed:", err.message)
    }
  }
}

/**
 * After recommending jobs for a freelancer:
 *   Send one email to the freelancer with the list of matched jobs.
 */
async function sendRecommendationEmailsForFreelancer(db, freelancerInput, recommendations, candidateJobs) {
  const users = db.collection("users")

  const userId = freelancerInput.user_id || freelancerInput.userId
  if (!userId) {
    console.warn("[Recommend/Email] No user_id — skipping freelancer email")
    return
  }

  const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { name: 1, email: 1 } })
  if (!user?.email) {
    console.warn("[Recommend/Email] Freelancer has no email — skipping")
    return
  }

  // Enrich recommendations with full job details
  const jobMap = Object.fromEntries(candidateJobs.map((j) => [j.id, j]))
  const enrichedJobs = recommendations.map((rec) => ({
    ...rec,
    ...(jobMap[rec.id] || {}),
  }))

  try {
    const emailBody = await generateFreelancerJobsEmailBody(
      { name: user.name, skills: freelancerInput.skills || [] },
      enrichedJobs
    )
    await sendFreelancerJobsListEmail(user.email, user.name, emailBody)
    console.log("[Recommend/Email] Freelancer jobs-list email sent to", user.email)
  } catch (err) {
    console.error("[Recommend/Email] Freelancer jobs-list email failed:", err.message)
  }
}

// ── Utility ──────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default {
  recommendFreelancersForJob,
  recommendJobsForFreelancer,
}
