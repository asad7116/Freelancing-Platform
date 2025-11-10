import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"
import JobApplicationModel from "../models/JobApplication.js"
import JobPostModel from "../models/JobPost.js"

// Submit a proposal (Freelancer)
export const submitProposal = async (req, res) => {
  try {
    const freelancerId = req.user.id
    const {
      job_post_id,
      cover_letter,
      proposed_price,
      delivery_time,
      attachments,
      milestones,
    } = req.body

    // Validation
    if (!job_post_id || !cover_letter || !proposed_price || !delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Job ID, cover letter, proposed price, and delivery time are required",
      })
    }

    const db = await getDatabase()

    // Check if job exists
    const job = await JobPostModel.findById(db, job_post_id)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    // Check if already applied
    const existingApp = await JobApplicationModel.findByJobAndFreelancer(db, job_post_id, freelancerId)
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal for this job",
      })
    }

    // Get freelancer name
    const users = db.collection("users")
    const user = await users.findOne({ _id: new ObjectId(freelancerId) })

    // Create proposal
    const proposalId = await JobApplicationModel.create(db, {
      job_post_id,
      client_id: job.buyer_id,
      freelancer_id: freelancerId,
      freelancer_name: user?.name || "Unknown",
      cover_letter,
      proposed_price,
      delivery_time,
      attachments: attachments || [],
      milestones: milestones || [],
      status: "pending",
    })

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposalId,
    })
  } catch (error) {
    console.error("Submit proposal error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit proposal",
      error: error.message,
    })
  }
}

// Get freelancer's proposals
export const getFreelancerProposals = async (req, res) => {
  try {
    const freelancerId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const db = await getDatabase()

    // Get proposals
    const proposals = await JobApplicationModel.findMany(
      db,
      { freelancer_id: freelancerId },
      skip,
      limit
    )

    // Get job details for each proposal
    const proposalsWithJobs = await Promise.all(
      proposals.map(async (proposal) => {
        const job = await JobPostModel.findById(db, proposal.job_post_id)
        return {
          ...proposal,
          id: proposal._id.toString(),
          job: job ? {
            id: job._id.toString(),
            title: job.title,
            budget: job.budget,
            duration: job.duration,
          } : null,
        }
      })
    )

    const total = await JobApplicationModel.count(db, { freelancer_id: freelancerId })

    res.json({
      success: true,
      proposals: proposalsWithJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get freelancer proposals error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposals",
      error: error.message,
    })
  }
}

// Get proposals for a specific job (Client)
export const getJobProposals = async (req, res) => {
  try {
    const clientId = req.user.id
    const { jobId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const db = await getDatabase()

    // Verify job belongs to client
    const job = await JobPostModel.findById(db, jobId)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    if (job.buyer_id !== clientId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view proposals for this job",
      })
    }

    // Get proposals
    const proposals = await JobApplicationModel.findMany(
      db,
      { job_post_id: jobId },
      skip,
      limit
    )

    // Get freelancer details for each proposal
    const users = db.collection("users")
    const freelancerProfiles = db.collection("freelancerProfiles")

    const proposalsWithFreelancers = await Promise.all(
      proposals.map(async (proposal) => {
        const freelancer = await users.findOne({ _id: new ObjectId(proposal.freelancer_id) })
        const profile = await freelancerProfiles.findOne({ user_id: proposal.freelancer_id })
        
        return {
          ...proposal,
          id: proposal._id.toString(),
          freelancer: freelancer ? {
            id: freelancer._id.toString(),
            name: freelancer.name,
            email: freelancer.email,
            avatar: freelancer.avatar,
            profile: profile ? {
              title: profile.title,
              bio: profile.bio,
              hourly_rate: profile.hourly_rate,
              years_of_experience: profile.years_of_experience,
              skills: profile.skills,
              profile_image: profile.profile_image,
            } : null,
          } : null,
        }
      })
    )

    const total = await JobApplicationModel.count(db, { job_post_id: jobId })

    res.json({
      success: true,
      proposals: proposalsWithFreelancers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get job proposals error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposals",
      error: error.message,
    })
  }
}

// Get all proposals for client's jobs
export const getClientProposals = async (req, res) => {
  try {
    const clientId = req.user.id
    const db = await getDatabase()

    // Get all client's jobs
    const jobs = await JobPostModel.findMany(db, { buyer_id: clientId }, 0, 1000)
    
    // Get proposals count for each job
    const jobsWithProposals = await Promise.all(
      jobs.map(async (job) => {
        const totalProposals = await JobApplicationModel.count(db, { job_post_id: job._id.toString() })
        const pendingProposals = await JobApplicationModel.count(db, { 
          job_post_id: job._id.toString(),
          status: "pending" 
        })
        
        return {
          id: job._id.toString(),
          title: job.title,
          budget: job.budget,
          created_at: job.created_at,
          totalProposals,
          pendingProposals,
        }
      })
    )

    // Filter jobs that have proposals
    const jobsWithActiveProposals = jobsWithProposals.filter(job => job.totalProposals > 0)

    res.json({
      success: true,
      jobs: jobsWithActiveProposals,
    })
  } catch (error) {
    console.error("Get client proposals error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposals",
      error: error.message,
    })
  }
}

// Get proposal details
export const getProposalDetails = async (req, res) => {
  try {
    const { proposalId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    const db = await getDatabase()
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      })
    }

    // Check authorization
    if (userRole === "freelancer" && proposal.freelancer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this proposal",
      })
    }

    if (userRole === "client" && proposal.client_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this proposal",
      })
    }

    // Get job details
    const job = await JobPostModel.findById(db, proposal.job_post_id)

    // Get freelancer details
    const users = db.collection("users")
    const freelancerProfiles = db.collection("freelancerProfiles")
    
    const freelancer = await users.findOne({ _id: new ObjectId(proposal.freelancer_id) })
    const profile = await freelancerProfiles.findOne({ user_id: proposal.freelancer_id })

    res.json({
      success: true,
      proposal: {
        ...proposal,
        id: proposal._id.toString(),
        job: job ? {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          budget: job.budget,
          duration: job.duration,
        } : null,
        freelancer: freelancer ? {
          id: freelancer._id.toString(),
          name: freelancer.name,
          email: freelancer.email,
          avatar: freelancer.avatar,
          profile: profile ? {
            title: profile.title,
            bio: profile.bio,
            hourly_rate: profile.hourly_rate,
            years_of_experience: profile.years_of_experience,
            skills: profile.skills,
            languages: profile.languages,
            education: profile.education,
            experience: profile.experience,
            portfolio_items: profile.portfolio_items,
            profile_image: profile.profile_image,
          } : null,
        } : null,
      },
    })
  } catch (error) {
    console.error("Get proposal details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposal details",
      error: error.message,
    })
  }
}

// Update proposal status (Client - Accept/Reject)
export const updateProposalStatus = async (req, res) => {
  try {
    const clientId = req.user.id
    const { proposalId } = req.params
    const { status } = req.body

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      })
    }

    const db = await getDatabase()
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      })
    }

    // Verify client owns the job
    if (proposal.client_id !== clientId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this proposal",
      })
    }

    // Update status
    const updatedProposal = await JobApplicationModel.updateStatus(db, proposalId, status)

    res.json({
      success: true,
      message: `Proposal ${status} successfully`,
      proposal: updatedProposal,
    })
  } catch (error) {
    console.error("Update proposal status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update proposal status",
      error: error.message,
    })
  }
}
