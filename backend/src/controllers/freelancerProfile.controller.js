import { FreelancerProfile } from "../models/FreelancerProfile.js"
import { ObjectId } from "mongodb"

export const createFreelancerProfile = async (req, res) => {
  try {
    const { userId, title, bio, skills, hourlyRate, experience, location, portfolioUrl } = req.body

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null

    const profile = await FreelancerProfile.create({
      userId: new ObjectId(userId),
      title,
      bio,
      skills,
      hourlyRate: Number.parseFloat(hourlyRate),
      experience: Number.parseInt(experience),
      location,
      portfolioUrl,
      profileImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    res.status(201).json({ message: "Profile created successfully", profile })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create freelancer profile" })
  }
}

export const getFreelancerProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const profile = await FreelancerProfile.findByUserId(new ObjectId(userId))
    if (!profile) return res.status(404).json({ error: "Profile not found" })
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch freelancer profile" })
  }
}
