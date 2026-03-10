import express from "express"
import multer from "multer"
import path from "path"
import { getDatabase } from "../db/mongodb.js"
import { gigSchema } from "../lib/validators.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { ObjectId } from "mongodb"
import fs from "fs"
import { sendGigCreatedEmail } from "../services/email.service.js"
import NotificationModel from "../models/Notification.js"
import { recommendJobsForFreelancer } from "../services/recommendationService.js"

const router = express.Router()

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})
const upload = multer({ storage })

// Ensure the uploads folder exists
const uploadDirectory = "./uploads/"
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory)
}

// Route for creating a gig
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      console.log("Uploaded files:", req.files)

      const validatedData = gigSchema.parse(req.body)
      const { gigTitle, category, shortDescription, price, deliveryTime, revisions, additionalNotes } = validatedData

      const thumbnailImage = req.files["thumbnailImage"] ? req.files["thumbnailImage"][0].filename : null
      const galleryImages = req.files["galleryImages"] ? req.files["galleryImages"].map((file) => file.filename) : []

      const db = await getDatabase()
      const gigs = db.collection("gigs")

      const result = await gigs.insertOne({
        _id: new ObjectId(),
        gigTitle,
        category,
        shortDescription,
        price: Number.parseFloat(price),
        deliveryTime: Number.parseInt(deliveryTime),
        revisions: Number.parseInt(revisions),
        additionalNotes,
        thumbnailImage,
        galleryImages,
        createdBy: req.user.id,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // Send gig creation notification email (non-blocking)
      if (req.user.email) {
        sendGigCreatedEmail(req.user.email, req.user.name || "Freelancer", gigTitle).catch((err) => {
          console.error("[Gig Email] Failed to send gig created email:", err.message)
        })
      }

      // Create in-app notification
      NotificationModel.create(db, {
        userId: req.user.id,
        type: "gig_created",
        title: "Gig Created Successfully",
        message: `Your gig "${gigTitle}" is now live and visible to clients.`,
        link: `/freelancer/Gigs`,
      }).catch((err) => console.error("[Notification] Failed to create:", err.message))

      // 🤖 Auto-recommend: find matching job posts for this freelancer (non-blocking)
      ;(async () => {
        try {
          // Try to load full freelancer profile for better matching
          const profile = await db.collection("freelancerProfiles").findOne({ user_id: req.user.id })
          const freelancerInput = profile
            ? {
                user_id: req.user.id,
                title: profile.title || gigTitle,
                skills: profile.skills || [category],
                hourlyRate: profile.hourlyRate || price,
                experience: profile.experience || "",
                location: profile.location || "",
                bio: profile.bio || shortDescription,
              }
            : {
                user_id: req.user.id,
                title: gigTitle,
                skills: [category],
                hourlyRate: price,
                experience: "",
                location: "",
                bio: shortDescription,
              }

          const result = await recommendJobsForFreelancer(freelancerInput)
          const count = result.recommendations?.length || 0
          console.log(`[Auto-Recommend] Found ${count} job match(es) for freelancer gig "${gigTitle}"`)

          if (count > 0) {
            NotificationModel.create(db, {
              userId: req.user.id,
              type: "recommendation",
              title: "Job Recommendations Ready",
              message: `We found ${count} job(s) matching your gig "${gigTitle}". Check your email!`,
              link: `/freelancer/Gigs`,
            }).catch((err) => console.error("[Notification] Failed:", err.message))
          }
        } catch (err) {
          console.error("[Auto-Recommend] Failed for gig:", err.message)
        }
      })()

      res.status(201).json({
        message: "Gig created successfully!",
        gig: { id: result.insertedId, ...validatedData },
      })
    } catch (error) {
      console.error("Error creating gig:", error)
      if (error?.issues) {
        return res.status(400).json({ message: "Invalid input", issues: error.issues })
      }
      res.status(500).json({ message: "Error creating gig", error: error.message })
    }
  },
)

// Route for fetching all gigs
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase()
    const gigs = db.collection("gigs")

    const allGigs = await gigs.find({}).sort({ created_at: -1 }).toArray()

    // Look up seller names from users collection
    const creatorIds = [...new Set(allGigs.map((g) => g.createdBy).filter(Boolean))]
    const users = creatorIds.length
      ? await db.collection("users").find(
          { _id: { $in: creatorIds.map((id) => new ObjectId(id)) } },
          { projection: { name: 1 } }
        ).toArray()
      : []
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]))

    res.status(200).json({
      success: true,
      gigs: allGigs.map((g) => ({
        ...g,
        id: g._id.toString(),
        seller: userMap[g.createdBy] || "Anonymous",
      })),
    })
  } catch (error) {
    console.error("Error fetching gigs:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching gigs",
      error: error.message,
    })
  }
})

// Route for fetching current user's gigs only
router.get("/my-gigs", authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const gigs = db.collection("gigs")
    const userId = req.user.id
    const userName = req.user.name || "Unknown Seller"

    const userGigs = await gigs.find({ createdBy: userId }).sort({ created_at: -1 }).toArray()

    res.status(200).json({
      success: true,
      gigs: userGigs.map((g) => ({ ...g, id: g._id.toString(), seller: userName })),
    })
  } catch (error) {
    console.error("Error fetching user gigs:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching your gigs",
      error: error.message,
    })
  }
})

// Get single gig by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    const gigs = db.collection("gigs")

    const gig = await gigs.findOne({ _id: new ObjectId(id) })

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      })
    }

    // Look up the seller name
    let sellerName = "Anonymous"
    if (gig.createdBy) {
      const seller = await db.collection("users").findOne(
        { _id: new ObjectId(gig.createdBy) },
        { projection: { name: 1 } }
      )
      if (seller?.name) sellerName = seller.name
    }

    res.status(200).json({
      success: true,
      gig: { ...gig, id: gig._id.toString(), seller: sellerName },
    })
  } catch (error) {
    console.error("Error fetching gig:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching gig",
      error: error.message,
    })
  }
})

// Update gig by ID
router.put(
  "/:id",
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params
      const { gigTitle, category, shortDescription, price, deliveryTime, revisions, additionalNotes } = req.body
      const db = await getDatabase()
      const gigs = db.collection("gigs")

      const existingGig = await gigs.findOne({ _id: new ObjectId(id) })

      if (!existingGig) {
        return res.status(404).json({
          success: false,
          message: "Gig not found",
        })
      }

      const updateData = {
        gigTitle,
        category,
        shortDescription,
        price: Number.parseFloat(price),
        deliveryTime: Number.parseInt(deliveryTime),
        revisions: Number.parseInt(revisions),
        additionalNotes,
        updated_at: new Date(),
      }

      if (req.files) {
        if (req.files["thumbnailImage"]) {
          updateData.thumbnailImage = req.files["thumbnailImage"][0].filename
        }
        if (req.files["galleryImages"]) {
          updateData.galleryImages = req.files["galleryImages"].map((file) => file.filename)
        }
      }

      const result = await gigs.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      )

      res.status(200).json({
        success: true,
        message: "Gig updated successfully",
        gig: result.value,
      })
    } catch (error) {
      console.error("Error updating gig:", error)
      res.status(500).json({
        success: false,
        message: "Error updating gig",
        error: error.message,
      })
    }
  },
)

// Debug route to check all gigs
router.get("/debug/all", async (req, res) => {
  try {
    const db = await getDatabase()
    const gigs = db.collection("gigs")

    const allGigs = await gigs.find({}).project({ id: "$_id", gigTitle: 1, createdBy: 1, created_at: 1 }).toArray()

    res.json({ count: allGigs.length, gigs: allGigs })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Debug route to check current user
router.get("/debug/me", authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
