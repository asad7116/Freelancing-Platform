import express from "express"
import { getDatabase } from "../db/mongodb.js"

const router = express.Router()

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

export default router
