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

  // ── 3b. Validate IDs — drop anything not from our DB candidates ───────
  const candidateMap = Object.fromEntries(candidates.map((c) => [c.id, c]))
  const validDraft = draft.filter((rec) => {
    if (candidateMap[rec.id]) return true
    console.warn(`[Recommend] Dropped hallucinated freelancer ID: ${rec.id}`)
    return false
  })
  console.log(`[Recommend] Valid draft entries: ${validDraft.length}/${draft.length}`)

  // ── 4. Reflection / critique ──────────────────────────────────────────
  console.log("[Recommend] Step 4 — LLM reflection…")
  const refined = await reflectOnRecommendations(normalizedInput, validDraft, "freelancer")

  // ── 4b. Validate IDs again after reflection ───────────────────────────
  const validRefined = refined.filter((rec) => {
    if (candidateMap[rec.id]) return true
    console.warn(`[Recommend] Dropped hallucinated freelancer ID after reflection: ${rec.id}`)
    return false
  })

  // ── 5. Finalise — re-enrich from original DB data ────────────────────
  const final = validRefined
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((rec) => {
      const dbCandidate = candidateMap[rec.id]
      return {
        id: rec.id,
        score: rec.score,
        reason: rec.reason,
        // Carry forward real DB data so downstream (emails etc.) has it
        name: dbCandidate.name,
        email: dbCandidate.email,
        user_id: dbCandidate.user_id,
        title: dbCandidate.title,
        skills: dbCandidate.skills,
        hourlyRate: dbCandidate.hourlyRate,
        experience: dbCandidate.experience,
        location: dbCandidate.location,
        bio: dbCandidate.bio,
        gigs: dbCandidate.gigs || [],
      }
    })

  console.log(`[Recommend] Final ${final.length} freelancer recommendations:`,
    final.map((f) => `${f.name} (${f.id}) — score: ${f.score}`))

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

  // ── 3b. Validate IDs — drop anything not from our DB candidates ───────
  const candidateMap = Object.fromEntries(candidates.map((c) => [c.id, c]))
  const validDraft = draft.filter((rec) => {
    if (candidateMap[rec.id]) return true
    console.warn(`[Recommend] Dropped hallucinated job ID: ${rec.id}`)
    return false
  })
  console.log(`[Recommend] Valid draft entries: ${validDraft.length}/${draft.length}`)

  // ── 4. Reflection / critique ──────────────────────────────────────────
  console.log("[Recommend] Step 4 — LLM reflection…")
  const refined = await reflectOnRecommendations(normalizedInput, validDraft, "job")

  // ── 4b. Validate IDs again after reflection ───────────────────────────
  const validRefined = refined.filter((rec) => {
    if (candidateMap[rec.id]) return true
    console.warn(`[Recommend] Dropped hallucinated job ID after reflection: ${rec.id}`)
    return false
  })

  // ── 5. Finalise — re-enrich from original DB data ────────────────────
  const final = validRefined
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((rec) => {
      const dbCandidate = candidateMap[rec.id]
      return {
        id: rec.id,
        score: rec.score,
        reason: rec.reason,
        // Carry forward real DB data
        title: dbCandidate.title,
        description: dbCandidate.description,
        mandatory_skills: dbCandidate.mandatory_skills,
        nice_to_have_skills: dbCandidate.nice_to_have_skills,
        budget_type: dbCandidate.budget_type,
        hourly_rate_from: dbCandidate.hourly_rate_from,
        hourly_rate_to: dbCandidate.hourly_rate_to,
        fixed_price: dbCandidate.fixed_price,
        experience_level: dbCandidate.experience_level,
        category: dbCandidate.category,
        buyer_id: dbCandidate.buyer_id,
        buyer_name: dbCandidate.buyer_name,
        buyer_email: dbCandidate.buyer_email,
        status: dbCandidate.status,
        created_at: dbCandidate.created_at,
      }
    })

  const result = {
    context: { inputType: "freelancer", normalizedInput },
    recommendations: final,
  }

  // ── 6. Send emails (fire-and-forget) ──────────────────────────────────
  sendRecommendationEmailsForFreelancer(db, freelancerInput, final).catch((err) => {
    console.error("[Recommend] Email dispatch error:", err.message)
  })

  // TODO: log recommendation event for analytics / click tracking

  return result
}

// ═══════════════════════════════════════════════════════════════════════════
//  MONGODB RETRIEVAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query freelancer candidates that might match a normalised job description.
 * Builds a composite view from BOTH freelancerProfiles AND gigs collections,
 * since most real capability data lives in the gigs a freelancer has posted.
 *
 * Strategy:
 *   1. Find gigs matching the job's skills/category (by title, description, category).
 *   2. Get unique freelancer (seller) IDs from those gigs.
 *   3. Also query freelancerProfiles with skill overlap.
 *   4. Merge both sources into a single candidate list per freelancer.
 *   5. Enrich with user name + email.
 */
async function retrieveFreelancers(db, normalizedInput) {
  const profiles = db.collection("freelancerProfiles")
  const gigs     = db.collection("gigs")
  const users    = db.collection("users")

  const skills     = (normalizedInput.skills || []).map((s) => s.toLowerCase())
  const categories = (normalizedInput.categories || []).map((c) => c.toLowerCase())
  const budget     = normalizedInput.budgetRange || {}

  // ── A. Find matching gigs ──────────────────────────────────────────────
  const gigQuery = {}
  const gigOrConditions = []

  if (skills.length > 0) {
    const regex = skills.map((s) => `(${escapeRegex(s)})`).join("|")
    gigOrConditions.push(
      { gigTitle: { $regex: regex, $options: "i" } },
      { shortDescription: { $regex: regex, $options: "i" } },
      { category: { $regex: regex, $options: "i" } }
    )
  }

  if (categories.length > 0) {
    const catRegex = categories.map((c) => `(${escapeRegex(c)})`).join("|")
    gigOrConditions.push(
      { category: { $regex: catRegex, $options: "i" } }
    )
  }

  if (gigOrConditions.length > 0) {
    gigQuery.$or = gigOrConditions
  }

  let matchedGigs = await gigs
    .find(gigOrConditions.length > 0 ? gigQuery : {})
    .sort({ created_at: -1 })
    .limit(MAX_CANDIDATES * 2)
    .toArray()

  // Fallback: if no gig matches, get recent gigs
  if (matchedGigs.length < 3) {
    const fallback = await gigs.find({}).sort({ created_at: -1 }).limit(MAX_CANDIDATES).toArray()
    const ids = new Set(matchedGigs.map((g) => g._id.toString()))
    for (const g of fallback) {
      if (!ids.has(g._id.toString())) matchedGigs.push(g)
      if (matchedGigs.length >= MAX_CANDIDATES * 2) break
    }
  }

  // ── B. Group gigs by seller (freelancer) ───────────────────────────────
  const gigsBySeller = {}
  for (const g of matchedGigs) {
    const sellerId = (g.createdBy || g.sellerId || "").toString()
    if (!sellerId) continue
    if (!gigsBySeller[sellerId]) gigsBySeller[sellerId] = []
    gigsBySeller[sellerId].push(g)
  }

  // ── C. Also query freelancerProfiles with skill overlap ────────────────
  const profileQuery = {}
  if (skills.length > 0) {
    profileQuery.skills = {
      $elemMatch: {
        $regex: skills.map((s) => `(${escapeRegex(s)})`).join("|"),
        $options: "i",
      },
    }
  }

  let profileResults = await profiles.find(profileQuery).limit(MAX_CANDIDATES).toArray()

  // Fallback for profiles
  if (profileResults.length < 3 && skills.length > 0) {
    const fallback = await profiles.find({}).sort({ updated_at: -1 }).limit(MAX_CANDIDATES).toArray()
    const ids = new Set(profileResults.map((r) => r._id.toString()))
    for (const f of fallback) {
      if (!ids.has(f._id.toString())) profileResults.push(f)
      if (profileResults.length >= MAX_CANDIDATES) break
    }
  }

  // ── D. Build composite candidates per unique freelancer ────────────────
  // Key = user_id (the freelancer's user account ID)
  const candidateMap = {}

  // From profiles
  for (const p of profileResults) {
    const uid = (p.user_id || "").toString()
    if (!uid) continue
    candidateMap[uid] = {
      profileId: p._id.toString(),
      user_id: uid,
      title: p.title || "",
      bio: p.bio || "",
      skills: p.skills || [],
      hourlyRate: p.hourlyRate || null,
      experience: p.experience || null,
      location: p.location || null,
      gigs: [],
    }
  }

  // From gigs — merge or create
  for (const [sellerId, sellerGigs] of Object.entries(gigsBySeller)) {
    if (!candidateMap[sellerId]) {
      candidateMap[sellerId] = {
        profileId: null,
        user_id: sellerId,
        title: "",
        bio: "",
        skills: [],
        hourlyRate: null,
        experience: null,
        location: null,
        gigs: [],
      }
    }
    candidateMap[sellerId].gigs = sellerGigs.map((g) => ({
      gigId: g._id.toString(),
      gigTitle: g.gigTitle || "",
      category: g.category || "",
      shortDescription: (g.shortDescription || "").substring(0, 300),
      price: g.price || null,
    }))
  }

  // ── E. Enrich with user name + email ───────────────────────────────────
  const userIds = Object.keys(candidateMap)
  const userDocs = userIds.length
    ? await users
        .find(
          { _id: { $in: userIds.map((id) => new ObjectId(id)) } },
          { projection: { name: 1, email: 1 } }
        )
        .toArray()
    : []
  const userMap = Object.fromEntries(userDocs.map((u) => [u._id.toString(), u]))

  // ── F. Build final candidate array ─────────────────────────────────────
  const candidates = Object.values(candidateMap)
    .slice(0, MAX_CANDIDATES)
    .map((c) => {
      const u = userMap[c.user_id] || {}
      // Derive skills from gig titles/categories if profile skills are empty
      let derivedSkills = [...(c.skills || [])]
      for (const g of c.gigs) {
        if (g.category && !derivedSkills.includes(g.category)) {
          derivedSkills.push(g.category)
        }
      }
      return {
        id: c.profileId || c.user_id,  // use profileId if exists, else user_id
        user_id: c.user_id,
        name: u.name || "Freelancer",
        email: u.email || null,
        title: c.title || (c.gigs[0]?.gigTitle || ""),
        bio: c.bio || "",
        skills: derivedSkills,
        hourlyRate: c.hourlyRate || (c.gigs.length > 0 ? Math.min(...c.gigs.map((g) => g.price).filter(Boolean)) : null),
        experience: c.experience || null,
        location: c.location || null,
        gigs: c.gigs, // pass gig data so LLM can see what they actually offer
      }
    })

  console.log(`[Recommend] Built ${candidates.length} composite freelancer candidates from ${matchedGigs.length} gigs + ${profileResults.length} profiles`)
  return candidates
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

  // recommendations already carry enriched DB data (name, email, skills, etc.)
  const enriched = recommendations.filter((rec) => rec.name && rec.email)

  if (enriched.length === 0) {
    console.warn("[Recommend/Email] No enriched freelancers to email about")
    return
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
async function sendRecommendationEmailsForFreelancer(db, freelancerInput, recommendations) {
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

  // recommendations already carry enriched DB data (title, description, etc.)
  try {
    const emailBody = await generateFreelancerJobsEmailBody(
      { name: user.name, skills: freelancerInput.skills || [] },
      recommendations
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
