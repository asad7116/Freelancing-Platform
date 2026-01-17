import express from "express"
import multer from "multer"
import path from "path"
import { getDatabase } from "../db/mongodb.js"
import { gigSchema } from "../lib/validators.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { ObjectId } from "mongodb"
import fs from "fs"

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

    res.status(200).json({
      success: true,
      gigs: allGigs.map((g) => ({ ...g, id: g._id.toString() })),
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

    const userGigs = await gigs.find({ createdBy: userId }).sort({ created_at: -1 }).toArray()

    res.status(200).json({
      success: true,
      gigs: userGigs.map((g) => ({ ...g, id: g._id.toString() })),
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

    res.status(200).json({
      success: true,
      gig: { ...gig, id: gig._id.toString() },
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
