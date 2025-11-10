import express from "express"
import { verifyJwt, authCookieName } from "../lib/jwt.js"
import { User } from "../models/User.js"
import { getDatabase } from "../db/mongodb.js"
import {
  submitProposal,
  getFreelancerProposals,
  getJobProposals,
  getClientProposals,
  getProposalDetails,
  updateProposalStatus,
} from "../controllers/proposal.controller.js"

const router = express.Router()

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.[authCookieName]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please log in.",
      })
    }

    const payload = verifyJwt(token)
    if (!payload?.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      })
    }

    const db = await getDatabase()
    const user = await User.findById(db, payload.sub)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      })
    }

    req.user = {
      ...user,
      id: user._id.toString(),
    }
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    })
  }
}

// All routes require authentication
router.use(authMiddleware)

// Freelancer routes
router.post("/", submitProposal) // Submit a proposal
router.get("/freelancer", getFreelancerProposals) // Get freelancer's proposals

// Client routes
router.get("/client", getClientProposals) // Get all jobs with proposals
router.get("/job/:jobId", getJobProposals) // Get proposals for a specific job

// Shared routes
router.get("/:proposalId", getProposalDetails) // Get proposal details
router.put("/:proposalId/status", updateProposalStatus) // Update proposal status (accept/reject)

export default router
