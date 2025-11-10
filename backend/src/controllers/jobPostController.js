import multer from "multer"
import path from "path"
import fs from "fs/promises"
import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/job-thumbnails/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "job-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"))
    }
  },
})

// Create upload directory if it doesn't exist
const createUploadDir = async () => {
  try {
    await fs.mkdir("uploads/job-thumbnails/", { recursive: true })
  } catch (error) {
    console.error("Error creating upload directory:", error)
  }
}

createUploadDir()

class JobPostController {
  // Create new job post
  static async create(req, res) {
    try {
      const {
        title,
        summary,
        description,
        deliverables,
        category_id,
        specialty,
        budget_type,
        hourly_rate_from,
        hourly_rate_to,
        fixed_price,
        project_type,
        duration,
        hours_per_week,
        job_size,
        freelancers_needed,
        experience_level,
        mandatory_skills,
        nice_to_have_skills,
        tools,
        languages,
        regular_price,
        job_type,
        city_id,
      } = req.body

      const userId = req.user.id
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")
      const categories = db.collection("categories")

      // Generate slug from title if not provided
      const jobSlug =
        title
          ?.toLowerCase()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-") +
        "-" +
        Date.now()

      // Validation
      const errors = {}

      if (!title?.trim()) errors.title = "Job title is required"
      if (!category_id) errors.category_id = "Category is required"
      if (!description?.trim()) errors.description = "Description is required"

      // Budget validation
      if (budget_type === "hourly") {
        if (!hourly_rate_from) errors.hourly_rate_from = "Minimum hourly rate is required"
        if (!hourly_rate_to) errors.hourly_rate_to = "Maximum hourly rate is required"
        if (Number.parseFloat(hourly_rate_from) >= Number.parseFloat(hourly_rate_to)) {
          errors.hourly_rate_to = "Maximum rate must be higher than minimum rate"
        }
      } else if (budget_type === "fixed") {
        if (!fixed_price) errors.fixed_price = "Fixed price is required"
      }

      // Skills validation
      try {
        const parsedMandatorySkills = mandatory_skills ? JSON.parse(mandatory_skills) : []
        if (parsedMandatorySkills.length === 0) {
          errors.mandatory_skills = "At least one mandatory skill is required"
        }
      } catch (e) {
        errors.mandatory_skills = "Invalid skills format"
      }

      // Validate category exists
      const categoryExists = await categories.findOne({ _id: new ObjectId(category_id) })

      if (!categoryExists) {
        errors.category_id = "Selected category does not exist"
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        })
      }

      // Create job post
      const jobPostData = {
        title,
        slug: jobSlug,
        summary,
        description,
        deliverables,
        category_id: new ObjectId(category_id),
        specialty,
        city_id: city_id ? new ObjectId(city_id) : null,
        budget_type: budget_type || "hourly",
        hourly_rate_from: hourly_rate_from ? Number.parseFloat(hourly_rate_from) : null,
        hourly_rate_to: hourly_rate_to ? Number.parseFloat(hourly_rate_to) : null,
        fixed_price: fixed_price ? Number.parseFloat(fixed_price) : null,
        project_type: project_type || "one-time",
        duration,
        hours_per_week,
        job_size,
        freelancers_needed: freelancers_needed ? Number.parseInt(freelancers_needed) : 1,
        experience_level: experience_level || "intermediate",
        mandatory_skills: mandatory_skills ? JSON.parse(mandatory_skills) : [],
        nice_to_have_skills: nice_to_have_skills ? JSON.parse(nice_to_have_skills) : [],
        tools: tools ? JSON.parse(tools) : [],
        languages: languages ? JSON.parse(languages) : [],
        regular_price: fixed_price
          ? Number.parseFloat(fixed_price)
          : hourly_rate_to
            ? Number.parseFloat(hourly_rate_to)
            : null,
        job_type: budget_type === "hourly" ? "Hourly" : "Fixed",
        buyer_id: userId,
        status: "active",
        approved_by_admin: "pending",
        featured: false,
        thumb_image: req.file ? req.file.filename : null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      const result = await jobPosts.insertOne(jobPostData)

      const jobPost = {
        id: result.insertedId.toString(),
        ...jobPostData,
        category_id: category_id,
        city_id: city_id,
      }

      res.status(201).json({
        success: true,
        message: "Job post created successfully",
        data: jobPost,
      })
    } catch (error) {
      console.error("Error creating job post:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Get all job posts
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, category_id, city_id, job_type, min_price, max_price, search } = req.query
      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")
      const jobApplications = db.collection("jobApplications")

      // Get job IDs that have approved applications
      const approvedJobIds = await jobApplications
        .find({ status: "approved" })
        .project({ job_post_id: 1 })
        .toArray()
      
      const approvedJobIdStrings = approvedJobIds.map(app => app.job_post_id)

      const where = { 
        status: "active",
        _id: { $nin: approvedJobIdStrings.map(id => new ObjectId(id)) } // Exclude jobs with approved proposals
      }

      if (category_id) {
        where.category_id = new ObjectId(category_id)
      }

      if (city_id) {
        where.city_id = new ObjectId(city_id)
      }

      if (job_type) {
        where.job_type = job_type
      }

      if (min_price || max_price) {
        where.regular_price = {}
        if (min_price) where.regular_price.$gte = Number.parseFloat(min_price)
        if (max_price) where.regular_price.$lte = Number.parseFloat(max_price)
      }

      if (search) {
        where.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
      }

      const [jobs, total] = await Promise.all([
        jobPosts.find(where).sort({ created_at: -1 }).skip(skip).limit(Number.parseInt(limit)).toArray(),
        jobPosts.countDocuments(where),
      ])

      const totalPages = Math.ceil(total / Number.parseInt(limit))

      // Get application counts for each job
      const formattedJobs = await Promise.all(
        jobs.map(async (job) => {
          const applicationCount = await jobApplications.countDocuments({
            job_post_id: job._id.toString(),
          })
          
          return {
            ...job,
            id: job._id.toString(),
            category_id: job.category_id.toString(),
            city_id: job.city_id ? job.city_id.toString() : null,
            _count: {
              applications: applicationCount,
            },
          }
        })
      )

      res.json({
        success: true,
        data: formattedJobs,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: Number.parseInt(limit),
        },
      })
    } catch (error) {
      console.error("Error fetching job posts:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Get job post by ID
  static async getById(req, res) {
    try {
      const { id } = req.params
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")
      const jobApplications = db.collection("jobApplications")

      const jobPost = await jobPosts.findOne({ _id: new ObjectId(id) })

      if (!jobPost) {
        return res.status(404).json({
          success: false,
          message: "Job post not found",
        })
      }

      const applications = await jobApplications.find({ job_post_id: id }).toArray()

      res.json({
        success: true,
        data: {
          ...jobPost,
          id: jobPost._id.toString(),
          applications,
          _count: { applications: applications.length },
        },
      })
    } catch (error) {
      console.error("Error fetching job post:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Get buyer's job posts
  static async getBuyerJobs(req, res) {
    try {
      const userId = req.user.id
      const { status, page = 1, limit = 10 } = req.query
      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")
      const jobApplications = db.collection("jobApplications")

      const where = { buyer_id: userId }

      if (status) {
        where.approved_by_admin = status
      }

      const [jobs, total] = await Promise.all([
        jobPosts.find(where).sort({ created_at: -1 }).skip(skip).limit(Number.parseInt(limit)).toArray(),
        jobPosts.countDocuments(where),
      ])

      const totalPages = Math.ceil(total / Number.parseInt(limit))

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const applicationCount = await jobApplications.countDocuments({
            job_post_id: job._id.toString(),
          })
          
          return {
            ...job,
            id: job._id.toString(),
            _count: {
              applications: applicationCount,
            },
          }
        })
      )

      res.json({
        success: true,
        data: jobsWithCounts,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: Number.parseInt(limit),
        },
      })
    } catch (error) {
      console.error("Error fetching buyer job posts:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Update job post
  static async update(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")

      const existingJobPost = await jobPosts.findOne({ _id: new ObjectId(id) })

      if (!existingJobPost) {
        return res.status(404).json({
          success: false,
          message: "Job post not found",
        })
      }

      if (existingJobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own job posts",
        })
      }

      const updateData = {}
      if (req.body.title) updateData.title = req.body.title
      if (req.body.description) updateData.description = req.body.description
      if (req.body.category_id) updateData.category_id = new ObjectId(req.body.category_id)

      const result = await jobPosts.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updated_at: new Date() } },
        { returnDocument: "after" },
      )

      res.json({
        success: true,
        message: "Job post updated successfully",
        data: { ...result.value, id: result.value._id.toString() },
      })
    } catch (error) {
      console.error("Error updating job post:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Delete job post
  static async delete(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")

      const existingJobPost = await jobPosts.findOne({ _id: new ObjectId(id) })

      if (!existingJobPost) {
        return res.status(404).json({
          success: false,
          message: "Job post not found",
        })
      }

      if (existingJobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own job posts",
        })
      }

      if (existingJobPost.thumb_image) {
        try {
          await fs.unlink(`uploads/job-thumbnails/${existingJobPost.thumb_image}`)
        } catch (error) {
          console.error("Error deleting thumbnail:", error)
        }
      }

      await jobPosts.deleteOne({ _id: new ObjectId(id) })

      res.json({
        success: true,
        message: "Job post deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting job post:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  // Get job applications for a specific job post
  static async getJobApplications(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const { page = 1, limit = 10 } = req.query
      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const db = await getDatabase()
      const jobPosts = db.collection("jobPosts")
      const jobApplications = db.collection("jobApplications")

      const jobPost = await jobPosts.findOne({ _id: new ObjectId(id) })

      if (!jobPost) {
        return res.status(404).json({
          success: false,
          message: "Job post not found",
        })
      }

      if (jobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only view applications for your own job posts",
        })
      }

      const [applications, total] = await Promise.all([
        jobApplications
          .find({ job_post_id: id })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .toArray(),
        jobApplications.countDocuments({ job_post_id: id }),
      ])

      const totalPages = Math.ceil(total / Number.parseInt(limit))

      res.json({
        success: true,
        data: applications,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: Number.parseInt(limit),
        },
      })
    } catch (error) {
      console.error("Error fetching job applications:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
}

export { JobPostController, upload }
