import express from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../prisma.js"; // Prisma client import
import { gigSchema } from "../lib/validators.js"; // Assuming you have a validation schema for gigs
import { authMiddleware } from "../middleware/authMiddleware.js"; // Import auth middleware

const router = express.Router();

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: "./uploads/", // Store uploaded files in /uploads folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  },
});
const upload = multer({ storage });

// Ensure the uploads folder exists
import fs from "fs";
const uploadDirectory = "./uploads/";

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory); // Create the directory if it doesn't exist
}

// Route for creating a gig
router.post(
  "/",
  authMiddleware, // Add authentication middleware
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      console.log("Uploaded files:", req.files);  // Log the uploaded files for debugging

      // Validate incoming data with the gig validation schema
      const validatedData = gigSchema.parse(req.body); // Assuming a validation schema for gigs

      const { gigTitle, category, shortDescription, price, deliveryTime, revisions, additionalNotes } = validatedData;

      // Handle file uploads (Multer)
      const thumbnailImage = req.files["thumbnailImage"]
        ? req.files["thumbnailImage"][0].filename
        : null;
      const galleryImages = req.files["galleryImages"]
        ? req.files["galleryImages"].map((file) => file.filename)
        : [];

      console.log("Gig Data:", {
        gigTitle,
        category,
        shortDescription,
        price,
        deliveryTime,
        revisions,
        additionalNotes,
        thumbnailImage,
        galleryImages,
      });

      // Create the gig in the database using Prisma ORM
      const gig = await prisma.gig.create({
        data: {
          gigTitle: gigTitle,
          category,
          shortDescription,
          price: parseFloat(price),
          deliveryTime: parseInt(deliveryTime),
          revisions: parseInt(revisions),
          additionalNotes,
          thumbnailImage,
          galleryImages,
          createdBy: req.user.id, // Set the creator's user ID
        },
      });

      // Return the created gig
      res.status(201).json({
        message: "Gig created successfully!",
        gig,
      });
    } catch (error) {
      // Log detailed error message
      console.error("Error creating gig:", error);

      // Return a detailed error response to the client
      if (error?.issues) {
        // If validation fails, send back validation issues
        return res.status(400).json({ message: "Invalid input", issues: error.issues });
      }

      res.status(500).json({ message: "Error creating gig", error: error.message });
    }
  }
);

// Route for fetching all gigs
router.get("/", async (req, res) => {
  try {
    const gigs = await prisma.gig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      gigs,
    });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching gigs", 
      error: error.message 
    });
  }
});

// Get single gig by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const gig = await prisma.gig.findUnique({
      where: { id: parseInt(id) }
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found"
      });
    }

    res.status(200).json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error("Error fetching gig:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching gig", 
      error: error.message 
    });
  }
});

// Update gig by ID
router.put("/:id", upload.fields([
  { name: "thumbnailImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 3 },
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { gigTitle, category, shortDescription, price, deliveryTime, revisions, additionalNotes } = req.body;

    // Check if gig exists
    const existingGig = await prisma.gig.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found"
      });
    }

    // Prepare update data
    const updateData = {
      gigTitle,
      category,
      shortDescription,
      price: parseFloat(price),
      deliveryTime: parseInt(deliveryTime),
      revisions: parseInt(revisions),
      additionalNotes,
    };

    // Handle file uploads
    if (req.files) {
      if (req.files["thumbnailImage"]) {
        updateData.thumbnailImage = req.files["thumbnailImage"][0].filename;
      }
      
      if (req.files["galleryImages"]) {
        updateData.galleryImages = req.files["galleryImages"].map((file) => file.filename);
      }
    }

    // Update the gig
    const updatedGig = await prisma.gig.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: "Gig updated successfully",
      gig: updatedGig,
    });
  } catch (error) {
    console.error("Error updating gig:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating gig", 
      error: error.message 
    });
  }
});

// Debug route to check all gigs
router.get("/debug/all", async (req, res) => {
  try {
    const allGigs = await prisma.gig.findMany({
      select: {
        id: true,
        gigTitle: true,
        createdBy: true,
        createdAt: true,
      },
    });
    res.json({ count: allGigs.length, gigs: allGigs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check current user
router.get("/debug/me", authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
