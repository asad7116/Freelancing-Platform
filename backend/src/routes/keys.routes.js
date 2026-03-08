import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { getDatabase } from "../db/mongodb.js"
import UserModel from "../models/User.js"

const router = express.Router()

// All key routes require authentication
router.use(authMiddleware)

// ─── PUT /api/keys/public — upload/update the current user's public key ─────
router.put("/public", async (req, res) => {
  try {
    const db = await getDatabase()
    const userId = req.user.id
    const { publicKey } = req.body

    if (!publicKey || typeof publicKey !== "object" || publicKey.kty !== "RSA") {
      return res.status(400).json({ success: false, message: "Valid RSA public key (JWK) is required." })
    }

    await UserModel.setPublicKey(db, userId, publicKey)

    res.json({ success: true, message: "Public key saved." })
  } catch (err) {
    console.error("[Keys] save public key error:", err)
    res.status(500).json({ success: false, message: "Failed to save public key." })
  }
})

// ─── GET /api/keys/public/:userId — get a specific user's public key ────────
router.get("/public/:userId", async (req, res) => {
  try {
    const db = await getDatabase()
    const targetUserId = req.params.userId

    const publicKey = await UserModel.getPublicKey(db, targetUserId)

    if (!publicKey) {
      return res.status(404).json({ success: false, message: "Public key not found for this user." })
    }

    res.json({ success: true, publicKey })
  } catch (err) {
    console.error("[Keys] get public key error:", err)
    res.status(500).json({ success: false, message: "Failed to retrieve public key." })
  }
})

// ─── POST /api/keys/public/batch — get public keys for multiple users ───────
router.post("/public/batch", async (req, res) => {
  try {
    const db = await getDatabase()
    const { userIds } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "userIds array is required." })
    }

    // Limit batch size to prevent abuse
    if (userIds.length > 50) {
      return res.status(400).json({ success: false, message: "Maximum 50 user IDs per request." })
    }

    const publicKeys = await UserModel.getPublicKeys(db, userIds)

    res.json({ success: true, publicKeys })
  } catch (err) {
    console.error("[Keys] batch get public keys error:", err)
    res.status(500).json({ success: false, message: "Failed to retrieve public keys." })
  }
})

export default router
