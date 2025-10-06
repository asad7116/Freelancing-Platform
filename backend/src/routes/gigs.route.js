import express from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../prisma.js"; // Prisma client import
import { gigSchema } from "../lib/validators.js"; // Assuming you have a validation schema for gigs

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

export default router;
