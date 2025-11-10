import { getDatabase } from "../db/mongodb.js"

export async function getClientDashboard(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    console.log("🔥 Logged-in user:", req.user)

    const db = await getDatabase()
    const jobPosts = db.collection("jobPosts")
    const jobApplications = db.collection("jobApplications")

    const totalJob = await jobPosts.countDocuments({ buyer_id: userId })

    // Get job IDs for the user
    const userJobIds = await jobPosts.find({ buyer_id: userId }).project({ _id: 1 }).toArray()
    const jobIdStrings = userJobIds.map(j => j._id.toString())

    // Count pending orders - jobs with no approved proposal
    const approvedJobIds = await jobApplications.find({
      job_post_id: { $in: jobIdStrings },
      status: "approved"
    }).project({ job_post_id: 1 }).toArray()
    
    const approvedJobIdSet = new Set(approvedJobIds.map(a => a.job_post_id))
    const pendingOrders = jobIdStrings.length - approvedJobIdSet.size

    // Active orders - jobs with approved proposals
    const activeOrders = approvedJobIdSet.size

    // Completed orders (jobs marked as completed)
    const completedOrders = await jobPosts.countDocuments({
      buyer_id: userId,
      status: "completed",
    })

    const totalOrders = totalJob

    const jobPostsData = await jobPosts.find({ buyer_id: userId }).project({ _id: 1 }).toArray()

    let totalApplications = 0
    if (jobPostsData.length > 0) {
      const jobIds = jobPostsData.map((j) => j._id.toString())
      totalApplications = await jobApplications.countDocuments({
        job_post_id: { $in: jobIds },
      })
    }

    const amounts = { totalEarnings: 0, payoutAmount: 0, balance: 0 }
    const ratings = { averageRating: 0, ratingCount: 0 }
    const totalService = 0

    console.log("✅ Dashboard counts for", userId, {
      totalJob,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      totalApplications,
    })

    res.set("Cache-Control", "no-store")
    res.json({
      totalEarnings: amounts.totalEarnings,
      payoutAmount: amounts.payoutAmount,
      balance: amounts.balance,
      totalService,
      totalJob,
      totalOrder: totalOrders,
      completedOrders,
      activeOrders,
      pendingOrders,
      averageRating: ratings.averageRating,
      ratingCount: ratings.ratingCount,
      totalApplications,
    })
  } catch (err) {
    console.error("getClientDashboard error:", err)
    res.status(500).json({ message: "Failed to load dashboard" })
  }
}
