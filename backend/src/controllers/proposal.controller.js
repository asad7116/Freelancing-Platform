import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"
import JobApplicationModel from "../models/JobApplication.js"
import JobPostModel from "../models/JobPost.js"
import { sendProposalNotificationEmail } from "../services/email.service.js"
// import Stripe from "stripe"
// 
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ... (rest of the file remains same, commenting specifically the Stripe parts)

// Create Stripe Checkout Session (Client)
/*
export const createCheckoutSession = async (req, res) => {
  try {
    const clientId = req.user.id
    const { proposalId } = req.params

    const db = await getDatabase()
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal || proposal.client_id !== clientId) {
      return res.status(404).json({ success: false, message: "Proposal not found" })
    }

    if (proposal.status !== "completed") {
      return res.status(400).json({ success: false, message: "Work must be approved before payment" })
    }

    const job = await JobPostModel.findById(db, proposal.job_post_id)
    const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment for ${job?.title || "Project"}`,
              description: `Freelancer: ${proposal.freelancer_name}`,
            },
            unit_amount: Math.round(proposal.proposed_price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/client/checkout?success=true&proposalId=${proposalId}`,
      cancel_url: `${frontendUrl}/client/checkout?canceled=true`,
      metadata: {
        proposalId: proposalId,
        clientId: clientId,
      },
    })

    res.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Create checkout session error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    })
  }
}
*/

// Stripe Webhook Handler
/*
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const proposalId = session.metadata.proposalId

    try {
      const db = await getDatabase()
      // Update payment status to 'paid'
      await JobApplicationModel.updatePaymentStatus(db, proposalId, "paid")
      console.log(`Payment confirmed for proposal: ${proposalId}`)
    } catch (dbError) {
      console.error("Database update error in webhook:", dbError)
      return res.status(500).json({ message: "Failed to update database" })
    }
  }

  res.json({ received: true })
}
*/

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

    // Send email notification to the client (non-blocking)
    try {
      const client = await users.findOne({ _id: new ObjectId(job.buyer_id) })
      if (client?.email) {
        sendProposalNotificationEmail(
          client.email,
          client.name || "Client",
          user?.name || "A freelancer",
          job.title || "your job",
          proposalId.toString()
        ).catch((err) => {
          console.error("[Proposal Email] Failed to send notification:", err.message)
        })
      }
    } catch (emailErr) {
      console.error("[Proposal Email] Error fetching client for notification:", emailErr.message)
    }

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
      currentUser: {
        id: userId,
        role: userRole
      }
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

// Submit work for approved proposal
export async function submitWorkForProposal(req, res) {
  try {
    const freelancerId = req.user.id
    const { proposalId } = req.params
    const { submission_note, deliverable_links } = req.body

    // Validation
    if (!submission_note || !submission_note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Submission note is required",
      })
    }

    if (!deliverable_links || deliverable_links.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one deliverable link is required",
      })
    }

    const db = await getDatabase()

    // Get proposal
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      })
    }

    // Verify freelancer owns the proposal
    if (proposal.freelancer_id !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to submit work for this proposal",
      })
    }

    // Check if proposal is approved
    if (proposal.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved proposals can submit work",
      })
    }

    // Check if already submitted
    if (proposal.submission_status === "submitted" || proposal.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Work has already been submitted for this proposal",
      })
    }

    // Submit work
    const updatedProposal = await JobApplicationModel.submitWork(db, proposalId, {
      submission_note,
      deliverable_links,
    })

    res.json({
      success: true,
      message: "Work submitted successfully",
      proposal: updatedProposal,
    })
  } catch (error) {
    console.error("Submit work error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit work",
      error: error.message,
    })
  }
}

// Review submitted work (Client - Accept/Request Revision)
export async function reviewSubmission(req, res) {
  try {
    const clientId = req.user.id
    const { proposalId } = req.params
    const { action } = req.body

    // Validation
    if (!["accepted", "revision"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'accepted' or 'revision'",
      })
    }

    const db = await getDatabase()

    // Get proposal
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
        message: "Unauthorized to review this submission",
      })
    }

    // Check if work has been submitted
    if (proposal.submission_status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "No submitted work to review",
      })
    }

    // Handle action
    if (action === "accepted") {
      // Mark proposal as completed (work approved)
      const updatedProposal = await JobApplicationModel.updateStatus(db, proposalId, "completed")

      // Mark job as completed
      await JobPostModel.updateJobStatus(db, proposal.job_post_id, "completed")

      res.json({
        success: true,
        message: "Work accepted. Please proceed to payment.",
        proposal: updatedProposal,
      })
    } else if (action === "revision") {
      // Request revision
      const updatedProposal = await JobApplicationModel.requestRevision(db, proposalId)

      res.json({
        success: true,
        message: "Revision requested. Freelancer will be notified.",
        proposal: updatedProposal,
      })
    }
  } catch (error) {
    console.error("Review submission error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to review submission",
      error: error.message,
    })
  }
}

// Get pending payments (Client)
export const getPendingPayments = async (req, res) => {
  try {
    const clientId = req.user.id
    const db = await getDatabase()

    // Find all completed proposals (work approved) that are unpaid
    const pendingProposals = await JobApplicationModel.findMany(
      db,
      {
        client_id: clientId,
        status: "completed",
        payment_status: { $in: ["unpaid", null] }
      },
      0,
      100
    )

    const pendingWithDetails = await Promise.all(
      pendingProposals.map(async (proposal) => {
        const job = await JobPostModel.findById(db, proposal.job_post_id)
        return {
          id: proposal._id.toString(),
          job_title: job?.title || "Unknown Job",
          freelancer_name: proposal.freelancer_name,
          amount: proposal.proposed_price,
          date: proposal.updated_at
        }
      })
    )

    res.json({
      success: true,
      pendingPayments: pendingWithDetails
    })
  } catch (error) {
    console.error("Get pending payments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending payments",
    })
  }
}

// Create Stripe Checkout Session (Client)
export const createCheckoutSession = async (req, res) => {
  try {
    const clientId = req.user.id
    const { proposalId } = req.params

    const db = await getDatabase()
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal || proposal.client_id !== clientId) {
      return res.status(404).json({ success: false, message: "Proposal not found" })
    }

    if (proposal.status !== "completed") {
      return res.status(400).json({ success: false, message: "Work must be approved before payment" })
    }

    const job = await JobPostModel.findById(db, proposal.job_post_id)
    const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment for ${job?.title || "Project"}`,
              description: `Freelancer: ${proposal.freelancer_name}`,
            },
            unit_amount: Math.round(proposal.proposed_price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/client/checkout?success=true&proposalId=${proposalId}`,
      cancel_url: `${frontendUrl}/client/checkout?canceled=true`,
      metadata: {
        proposalId: proposalId,
        clientId: clientId,
      },
    })

    res.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error("Create checkout session error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    })
  }
}

// Stripe Webhook Handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const proposalId = session.metadata.proposalId

    try {
      const db = await getDatabase()
      // Update payment status to 'paid'
      await JobApplicationModel.updatePaymentStatus(db, proposalId, "paid")
      console.log(`Payment confirmed for proposal: ${proposalId}`)
    } catch (dbError) {
      console.error("Database update error in webhook:", dbError)
      return res.status(500).json({ message: "Failed to update database" })
    }
  }

  res.json({ received: true })
}

// Confirm receipt (Freelancer)
export const confirmPaymentReceived = async (req, res) => {
  try {
    const freelancerId = req.user.id
    const { proposalId } = req.params

    const db = await getDatabase()
    const proposal = await JobApplicationModel.findById(db, proposalId)

    if (!proposal || proposal.freelancer_id !== freelancerId) {
      return res.status(404).json({ success: false, message: "Proposal not found" })
    }

    if (proposal.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment has not been made yet" })
    }

    // Update payment status to 'confirmed'
    const updated = await JobApplicationModel.updatePaymentStatus(db, proposalId, "confirmed")

    // Final status update to both dashboards
    await JobApplicationModel.updateStatus(db, proposalId, "completed & paid")

    res.json({
      success: true,
      message: "Payment receipt confirmed",
      proposal: updated
    })
  } catch (error) {
    console.error("Confirm payment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
    })
  }
}
