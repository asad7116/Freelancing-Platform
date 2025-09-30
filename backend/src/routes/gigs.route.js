import express from "express";
import multer from "multer";
import path from "path";
import prisma from "../prisma.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: "./uploads/", // ✅ store in /uploads
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});
const upload = multer({ storage });

// Create gig
router.post(
  "/",
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const {
        gigTitle,
        category,
        shortDescription,
        price,
        deliveryTime,
        revisions,
        additionalNotes,
      } = req.body;

      const thumbnailImage = req.files["thumbnailImage"]
        ? req.files["thumbnailImage"][0].filename
        : null;

      const galleryImages = req.files["galleryImages"]
        ? req.files["galleryImages"].map((f) => f.filename)
        : [];

      const gig = await prisma.gig.create({
        data: {
          gigTitle,
          category,
          shortDescription,
          thumbnailImage,
          galleryImages,
          price: parseFloat(price),
          deliveryTime,
          revisions,
          additionalNotes,
        },
      });

      res.json({ success: true, gig });
    } catch (err) {
      console.error("❌ Error creating gig:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
);

// Get all gigs
router.get("/", async (_req, res) => {
  try {
    const gigs = await prisma.gig.findMany({
      orderBy: { id: "desc" },
    });
    res.json(gigs);
  } catch (err) {
    console.error("❌ Error fetching gigs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
