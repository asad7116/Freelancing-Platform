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

// Get all freelancers with their profiles and stats (public endpoint)
router.get("/freelancers", async (req, res) => {
  try {
    const db = await getDatabase()
    const users = db.collection("users")
    const freelancerProfiles = db.collection("freelancerProfiles")
    const gigs = db.collection("gigs")

    // Find all users with role 'freelancer'
    const freelancers = await users
      .find({ role: "freelancer" })
      .sort({ createdAt: -1 })
      .toArray()

    // Get profiles and stats for each freelancer
    const freelancersWithDetails = await Promise.all(
      freelancers.map(async (freelancer) => {
        const userId = freelancer._id.toString()

        // Get freelancer profile
        const profile = await freelancerProfiles.findOne({ user_id: userId })

        // Count gigs
        const gigsCount = await gigs.countDocuments({ createdBy: userId })

        // Get rating info (we can calculate from reviews if available)
        // For now, using profile data or defaults
        const rating = profile?.average_rating || 0
        const reviews = profile?.total_reviews || 0

        return {
          id: userId,
          username: freelancer.name?.toLowerCase().replace(/\s+/g, "_") || freelancer.email.split("@")[0],
          name: freelancer.name,
          email: freelancer.email,
          role: profile?.title || profile?.specialization || "Freelancer",
          rating: rating,
          reviews: reviews,
          image: profile?.profile_image || freelancer.avatar || "/assets/Freelancers/default-avatar.png",
          hourlyRate: profile?.hourly_rate || 0,
          bio: profile?.bio || "",
          skills: profile?.skills || [],
          location: profile?.city || profile?.country || "",
          isTopSeller: gigsCount >= 3 && rating >= 4.5, // Define your own criteria
          gigsCount: gigsCount,
          yearsOfExperience: profile?.years_of_experience || 0,
          isAvailable: profile?.is_available !== false,
        }
      })
    )

    res.json({
      success: true,
      data: freelancersWithDetails,
    })
  } catch (error) {
    console.error("Error fetching freelancers:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Get single freelancer details by username (public endpoint)
router.get("/freelancers/:username", async (req, res) => {
  try {
    const { username } = req.params
    const db = await getDatabase()
    const users = db.collection("users")
    const freelancerProfiles = db.collection("freelancerProfiles")
    const gigs = db.collection("gigs")
    const jobApplications = db.collection("jobApplications")

    // Find user by username (derived from name or email)
    // We'll search by name or email pattern
    const user = await users.findOne({
      $or: [
        { name: new RegExp(username.replace(/_/g, " "), "i") },
        { email: new RegExp(`^${username}@`, "i") },
      ],
      role: "freelancer",
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      })
    }

    const userId = user._id.toString()

    // Get freelancer profile
    const profile = await freelancerProfiles.findOne({ user_id: userId })

    // Get all gigs
    const freelancerGigs = await gigs.find({ createdBy: userId }).sort({ created_at: -1 }).toArray()

    // Count active proposals
    const proposalsCount = await jobApplications.countDocuments({ freelancer_id: userId })

    // Calculate stats
    const rating = profile?.average_rating || 0
    const reviews = profile?.total_reviews || 0

    const freelancerData = {
      id: userId,
      username: user.name?.toLowerCase().replace(/\s+/g, "_") || user.email.split("@")[0],
      name: user.name,
      email: user.email,
      role: profile?.title || profile?.specialization || "Freelancer",
      rating: rating,
      totalReviews: reviews,
      location: profile?.country || profile?.city || "Not specified",
      memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently",
      avatar: profile?.profile_image || user.avatar || "/assets/Freelancers/default-avatar.png",
      coverImage: profile?.cover_image || null,
      isTopSeller: freelancerGigs.length >= 3 && rating >= 4.5,
      description: profile?.bio || "No description available",
      skills: profile?.skills || [],
      hourlyRate: profile?.hourly_rate || 0,
      yearsOfExperience: profile?.years_of_experience || 0,
      languages: profile?.languages || [],
      education: profile?.education || [],
      experience: profile?.experience || [],
      certifications: profile?.certifications || [],
      portfolio: profile?.portfolio_items || [],
      gigs: freelancerGigs.map((gig) => ({
        id: gig._id.toString(),
        title: gig.gigTitle,
        price: gig.price,
        deliveryTime: gig.deliveryTime,
        rating: 0, // Can be calculated from reviews
        reviews: 0,
        image: gig.thumbnailImage ? `/uploads/${gig.thumbnailImage}` : "/assets/default-gig.png",
        category: gig.category,
      })),
      proposalsCount: proposalsCount,
      totalGigs: freelancerGigs.length,
    }

    res.json({
      success: true,
      data: freelancerData,
    })
  } catch (error) {
    console.error("Error fetching freelancer details:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

export default router
