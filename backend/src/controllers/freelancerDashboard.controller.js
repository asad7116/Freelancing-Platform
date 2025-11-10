import { getDatabase } from "../db/mongodb.js"

export async function getFreelancerDashboard(req, res) {
  try {
    const userId = req.user?.id || req.user?.sub
    if (!userId) return res.status(401).json({ message: "Unauthorized - No user found" })

    console.log("📊 Dashboard User ID:", userId)
    console.log("📊 User object:", req.user)
    console.log("📊 User ID type:", typeof userId)

    const db = await getDatabase()
    const gigs = db.collection("gigs")
    const jobApplications = db.collection("jobApplications")

    const totalGigs = await gigs.countDocuments({ createdBy: userId })

    console.log("📦 Total Gigs count:", totalGigs)

    const allGigs = await gigs.find({}).project({ id: "$_id", gigTitle: 1, createdBy: 1 }).toArray()

    console.log("🔍 All gigs in DB:", JSON.stringify(allGigs, null, 2))

    const matchingGigs = allGigs.filter((g) => g.createdBy === userId)
    console.log("✅ Matching gigs:", matchingGigs.length)

    const totalOrders = await jobApplications.countDocuments({
      freelancer_id: userId,
    })

    const completedOrders = await jobApplications.countDocuments({
      freelancer_id: userId,
      status: "completed",
    })

    // Active orders - proposals that have been approved
    const activeOrders = await jobApplications.countDocuments({
      freelancer_id: userId,
      status: "approved",
    })

    // Pending orders - proposals still pending review
    const pendingOrders = await jobApplications.countDocuments({
      freelancer_id: userId,
      status: "pending",
    })

    const earningsResult = await jobApplications
      .aggregate([
        { $match: { freelancer_id: userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$proposed_price" } } },
      ])
      .toArray()

    const totalEarningsAmount = earningsResult[0]?.total || 0
    const payoutAmount = totalEarningsAmount * 0.8
    const balance = totalEarningsAmount

    const ratings = { averageRating: 0, ratingCount: 0 }

    res.set("Cache-Control", "no-store")
    res.json({
      totalGig: totalGigs,
      totalOrder: totalOrders,
      completedOrders,
      activeOrders,
      pendingOrders,
      totalEarnings: totalEarningsAmount,
      payoutAmount,
      balance,
      averageRating: ratings.averageRating,
      ratingCount: ratings.ratingCount,
    })
  } catch (err) {
    console.error("getFreelancerDashboard error:", err)
    res.status(500).json({ message: "Failed to load freelancer dashboard" })
  }
}
