/**
 * recommendationRoutes.js
 * ───────────────────────
 * Express routes for the TIXE agentic AI recommendation system.
 *
 * POST /api/recommend/freelancers-for-job
 *   → Recommends top freelancers for a given job post.
 *     Body: a job object (title, description, mandatory_skills, buyer_id, …)
 *       OR  { jobId: "<existing job id>" }  to load from DB.
 *
 * POST /api/recommend/jobs-for-freelancer
 *   → Recommends top jobs for a given freelancer profile.
 *     Body: a freelancer profile object (skills, hourlyRate, …)
 *       OR  { freelancerId: "<user id>" }  to load from DB.
 */

import express from "express"
import { ObjectId } from "mongodb"
import { getDatabase } from "../db/mongodb.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import {
  recommendFreelancersForJob,
  recommendJobsForFreelancer,
} from "../services/recommendationService.js"

const router = express.Router()

// ═══════════════════════════════════════════════════════════════════════════
//  POST /api/recommend/freelancers-for-job
// ═══════════════════════════════════════════════════════════════════════════
router.post("/freelancers-for-job", authMiddleware, async (req, res) => {
  try {
    let jobInput = req.body

    // If only a jobId was sent, load the full job from DB
    if (jobInput.jobId && !jobInput.title) {
      const db = await getDatabase()
      const job = await db.collection("jobPosts").findOne({
        _id: new ObjectId(jobInput.jobId),
      })
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found." })
      }
      jobInput = { ...job, id: job._id.toString() }
    }

    // Basic validation
    if (!jobInput.title && !jobInput.description && !jobInput.mandatory_skills?.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least a title, description, or skills for the job.",
      })
    }

    // Default buyer_id to current user if not specified
    if (!jobInput.buyer_id && !jobInput.buyerId) {
      jobInput.buyer_id = req.user.id
    }

    console.log(`[Recommend Route] freelancers-for-job requested by user ${req.user.id}`)
    const result = await recommendFreelancersForJob(jobInput)

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (err) {
    console.error("[Recommend Route] freelancers-for-job error:", err)
    res.status(500).json({
      success: false,
      message: "Recommendation failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════
//  POST /api/recommend/jobs-for-freelancer
// ═══════════════════════════════════════════════════════════════════════════
router.post("/jobs-for-freelancer", authMiddleware, async (req, res) => {
  try {
    let freelancerInput = req.body

    // If only a freelancerId (user_id) was sent, load the profile from DB
    if (freelancerInput.freelancerId && !freelancerInput.skills) {
      const db = await getDatabase()
      const profile = await db.collection("freelancerProfiles").findOne({
        user_id: freelancerInput.freelancerId,
      })
      if (!profile) {
        return res.status(404).json({ success: false, message: "Freelancer profile not found." })
      }
      freelancerInput = { ...profile, user_id: profile.user_id }
    }

    // If nothing was sent, try loading current user's profile
    if (!freelancerInput.skills?.length && !freelancerInput.freelancerId) {
      const db = await getDatabase()
      const profile = await db.collection("freelancerProfiles").findOne({
        user_id: req.user.id,
      })
      if (!profile) {
        return res.status(400).json({
          success: false,
          message: "No freelancer profile found. Please provide skills or a freelancerId.",
        })
      }
      freelancerInput = { ...profile, user_id: profile.user_id }
    }

    // Default user_id to current user
    if (!freelancerInput.user_id && !freelancerInput.userId) {
      freelancerInput.user_id = req.user.id
    }

    console.log(`[Recommend Route] jobs-for-freelancer requested by user ${req.user.id}`)
    const result = await recommendJobsForFreelancer(freelancerInput)

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (err) {
    console.error("[Recommend Route] jobs-for-freelancer error:", err)
    res.status(500).json({
      success: false,
      message: "Recommendation failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
})

export default router
