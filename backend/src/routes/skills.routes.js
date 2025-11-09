import express from "express"
import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"

const router = express.Router()

// Get all skills
router.get("/skills", async (req, res) => {
  try {
    const { type, category } = req.query
    const db = await getDatabase()
    const skills = db.collection("skills")

    const where = { status: "active" }
    if (type) where.type = type
    if (category) where.category = category

    const result = await skills
      .find(where)
      .sort([
        ["category", 1],
        ["name", 1],
      ])
      .toArray()

    res.json({
      success: true,
      data: result.map((s) => ({ ...s, id: s._id.toString() })),
    })
  } catch (error) {
    console.error("Error fetching skills:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching skills",
      error: error.message,
    })
  }
})

// Get specialties by category
router.get("/specialties", async (req, res) => {
  try {
    const { category_id } = req.query
    const db = await getDatabase()
    const specialties = db.collection("specialties")

    const where = { status: "active" }
    if (category_id) {
      where.category_id = new ObjectId(category_id)
    }

    const result = await specialties.find(where).sort({ name: 1 }).toArray()

    res.json({
      success: true,
      data: result.map((s) => ({ ...s, id: s._id.toString() })),
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching specialties",
      error: error.message,
    })
  }
})

export default router
