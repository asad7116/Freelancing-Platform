import express from "express"
import { getDatabase } from "../db/mongodb.js"
import jwt from "jsonwebtoken"

const router = express.Router()

// Auth middleware for protected routes
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ _id: decoded.userId })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
      error: error.message,
    })
  }
}

// Public routes (no auth required)
// Get all categories (public endpoint)
router.get("/categories", async (req, res) => {
  try {
    const db = await getDatabase()
    const categories = db.collection("categories")

    const result = await categories.find({ status: "active" }).sort({ name: 1 }).toArray()

    res.json({
      success: true,
      data: result.map((cat) => ({
        id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      })),
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Get all cities (public endpoint)
router.get("/cities", async (req, res) => {
  try {
    const db = await getDatabase()
    const cities = db.collection("cities")

    const result = await cities.find({ status: "active" }).sort({ name: 1 }).toArray()

    res.json({
      success: true,
      data: result.map((city) => ({
        id: city._id.toString(),
        name: city.name,
        country: city.country,
      })),
    })
  } catch (error) {
    console.error("Error fetching cities:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Protected routes would go here if needed

export default router
