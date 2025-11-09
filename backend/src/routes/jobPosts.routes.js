import express from "express"
import { JobPostController, upload } from "../controllers/jobPostController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes (no auth required)
router.get("/job-posts/browse", JobPostController.getAll) // Public browsing

// Apply auth middleware to protected routes
router.use(authMiddleware)

// Protected Job Post Routes
router.post("/job-posts", upload.single("thumb_image"), JobPostController.create)
router.get("/job-posts", JobPostController.getAll)
router.get("/job-posts/my-jobs", JobPostController.getBuyerJobs)
router.get("/job-posts/:id", JobPostController.getById)
router.put("/job-posts/:id", upload.single("thumb_image"), JobPostController.update)
router.delete("/job-posts/:id", JobPostController.delete)
router.get("/job-posts/:id/applications", JobPostController.getJobApplications)

export default router
