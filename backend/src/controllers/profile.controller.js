import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"

// Get user profile (freelancer or client based on role)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const db = await getDatabase()
    const users = db.collection("users")
    const freelancerProfiles = db.collection("freelancerProfiles")
    const clientProfiles = db.collection("clientProfiles")
    const cities = db.collection("cities")

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          avatar: 1,
          city_id: 1,
        },
      },
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    let profile = null

    if (userRole === "freelancer") {
      profile = await freelancerProfiles.findOne({ user_id: userId })

      if (!profile) {
        const result = await freelancerProfiles.insertOne({
          _id: new ObjectId(),
          user_id: userId,
          skills: [],
          languages: [],
          education: [],
          experience: [],
          certifications: [],
          portfolio_items: [],
          bank_accounts: [],
          payment_methods: [],
          created_at: new Date(),
          updated_at: new Date(),
        })
        profile = { _id: result.insertedId, user_id: userId }
      }
    } else if (userRole === "client") {
      profile = await clientProfiles.findOne({ user_id: userId })

      if (!profile) {
        const result = await clientProfiles.insertOne({
          _id: new ObjectId(),
          user_id: userId,
          education: [],
          certifications: [],
          bank_accounts: [],
          payment_methods: [],
          created_at: new Date(),
          updated_at: new Date(),
        })
        profile = { _id: result.insertedId, user_id: userId }
      }
    }

    res.json({
      user: { ...user, id: user._id.toString() },
      profile,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Failed to fetch profile", error: error.message })
  }
}

// Update freelancer profile
export const updateFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const db = await getDatabase()
    const freelancerProfiles = db.collection("freelancerProfiles")

    const profileData = {
      title: req.body.title,
      bio: req.body.bio,
      phone: req.body.phone,
      date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : null,
      gender: req.body.gender,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postal_code: req.body.postal_code,
      specialization: req.body.specialization,
      hourly_rate: req.body.hourly_rate ? Number.parseFloat(req.body.hourly_rate) : null,
      years_of_experience: req.body.years_of_experience ? Number.parseInt(req.body.years_of_experience) : 0,
      skills: req.body.skills || [],
      languages: req.body.languages || [],
      education: req.body.education || [],
      experience: req.body.experience || [],
      certifications: req.body.certifications || [],
      portfolio_items: req.body.portfolio_items || [],
      linkedin_url: req.body.linkedin_url,
      github_url: req.body.github_url,
      website_url: req.body.website_url,
      twitter_url: req.body.twitter_url,
      bank_accounts: req.body.bank_accounts || [],
      payment_methods: req.body.payment_methods || [],
      profile_image: req.body.profile_image,
      cover_image: req.body.cover_image,
      is_available: req.body.is_available !== undefined ? req.body.is_available : true,
    }

    const result = await freelancerProfiles.findOneAndUpdate(
      { user_id: userId },
      { $set: { ...profileData, updated_at: new Date() } },
      { upsert: true, returnDocument: "after" },
    )

    res.json({
      message: "Profile updated successfully",
      profile: result.value,
    })
  } catch (error) {
    console.error("Update freelancer profile error:", error)
    res.status(500).json({ message: "Failed to update profile", error: error.message })
  }
}

// Update client profile
export const updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const db = await getDatabase()
    const clientProfiles = db.collection("clientProfiles")

    const profileData = {
      phone: req.body.phone,
      date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : null,
      gender: req.body.gender,
      company_name: req.body.company_name,
      company_size: req.body.company_size,
      industry: req.body.industry,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      postal_code: req.body.postal_code,
      website_url: req.body.website_url,
      linkedin_url: req.body.linkedin_url,
      education: req.body.education || [],
      certifications: req.body.certifications || [],
      bank_accounts: req.body.bank_accounts || [],
      payment_methods: req.body.payment_methods || [],
      profile_image: req.body.profile_image,
      preferred_language: req.body.preferred_language || "en",
      timezone: req.body.timezone,
    }

    const result = await clientProfiles.findOneAndUpdate(
      { user_id: userId },
      { $set: { ...profileData, updated_at: new Date() } },
      { upsert: true, returnDocument: "after" },
    )

    res.json({
      message: "Profile updated successfully",
      profile: result.value,
    })
  } catch (error) {
    console.error("Update client profile error:", error)
    res.status(500).json({ message: "Failed to update profile", error: error.message })
  }
}

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const db = await getDatabase()

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imagePath = `/uploads/${req.file.filename}`

    if (userRole === "freelancer") {
      const freelancerProfiles = db.collection("freelancerProfiles")
      await freelancerProfiles.updateOne(
        { user_id: userId },
        {
          $set: {
            profile_image: imagePath,
            updated_at: new Date(),
          },
        },
        { upsert: true },
      )
    } else if (userRole === "client") {
      const clientProfiles = db.collection("clientProfiles")
      await clientProfiles.updateOne(
        { user_id: userId },
        {
          $set: {
            profile_image: imagePath,
            updated_at: new Date(),
          },
        },
        { upsert: true },
      )
    }

    res.json({
      message: "Profile image uploaded successfully",
      imagePath,
    })
  } catch (error) {
    console.error("Upload profile image error:", error)
    res.status(500).json({ message: "Failed to upload image", error: error.message })
  }
}
