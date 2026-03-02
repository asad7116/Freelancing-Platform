import express from "express"
import { verifyJwt, authCookieName } from "../lib/jwt.js"
import { User } from "../models/User.js"
import { getDatabase } from "../db/mongodb.js"
import NotificationModel from "../models/Notification.js"

const router = express.Router()

// ─── Auth middleware (same pattern as proposals) ─────────────────────────────
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.[authCookieName]
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. Please log in." })
    }

    const payload = verifyJwt(token)
    if (!payload?.sub) {
      return res.status(401).json({ success: false, message: "Invalid token. Please log in again." })
    }

    const db = await getDatabase()
    const user = await User.findById(db, payload.sub)
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." })
    }

    req.user = { ...user, id: user._id.toString() }
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({ success: false, message: "Authentication error." })
  }
}

router.use(authMiddleware)

// ─── GET /api/notifications — list notifications for current user ────────────
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase()
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit

    const notifications = await NotificationModel.findByUser(db, req.user.id, { skip, limit })

    res.json({ success: true, notifications })
  } catch (err) {
    console.error("[Notifications] list error:", err)
    res.status(500).json({ success: false, message: "Failed to fetch notifications." })
  }
})

// ─── GET /api/notifications/unread-count — badge count ───────────────────────
router.get("/unread-count", async (req, res) => {
  try {
    const db = await getDatabase()
    const count = await NotificationModel.countUnread(db, req.user.id)
    res.json({ success: true, count })
  } catch (err) {
    console.error("[Notifications] unread-count error:", err)
    res.status(500).json({ success: false, message: "Failed to fetch count." })
  }
})

// ─── PUT /api/notifications/read-all — mark everything read ─────────────────
router.put("/read-all", async (req, res) => {
  try {
    const db = await getDatabase()
    const updated = await NotificationModel.markAllRead(db, req.user.id)
    res.json({ success: true, updated })
  } catch (err) {
    console.error("[Notifications] read-all error:", err)
    res.status(500).json({ success: false, message: "Failed to mark all read." })
  }
})

// ─── PUT /api/notifications/:id/read — mark single notification read ────────
router.put("/:id/read", async (req, res) => {
  try {
    const db = await getDatabase()
    const ok = await NotificationModel.markRead(db, req.params.id, req.user.id)
    res.json({ success: true, marked: ok })
  } catch (err) {
    console.error("[Notifications] mark-read error:", err)
    res.status(500).json({ success: false, message: "Failed to mark as read." })
  }
})

export default router
