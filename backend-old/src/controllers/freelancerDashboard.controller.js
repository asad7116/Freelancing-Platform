// backend/src/controllers/freelancerDashboard.controller.js
import prisma from "../prisma.js";

export async function getFreelancerDashboard(req, res) {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized - No user found" });

    console.log("📊 Dashboard User ID:", userId);
    console.log("📊 User object:", req.user);
    console.log("📊 User ID type:", typeof userId);

    const totalGigs = await prisma.gig.count({
      where: { createdBy: userId },
    });

    console.log("📦 Total Gigs count:", totalGigs);

    const allGigs = await prisma.gig.findMany({
      select: { id: true, gigTitle: true, createdBy: true },
    });
    console.log("🔍 All gigs in DB:", JSON.stringify(allGigs, null, 2));
    
    // Check if any gigs match
    const matchingGigs = allGigs.filter(g => g.createdBy === userId);
    console.log("✅ Matching gigs:", matchingGigs.length);

    const totalOrders = await prisma.jobApplication.count({
      where: { freelancer_id: userId },
    });

    const completedOrders = await prisma.jobApplication.count({
      where: { freelancer_id: userId, status: "completed" },
    });

    const activeOrders = await prisma.jobApplication.count({
      where: { freelancer_id: userId, status: "active" },
    });

    const pendingOrders = await prisma.jobApplication.count({
      where: { freelancer_id: userId, status: "pending" },
    });

    const totalEarnings = await prisma.jobApplication.aggregate({
      _sum: { proposed_price: true },
      where: { freelancer_id: userId, status: "completed" },
    });

    const payoutAmount = (totalEarnings._sum.proposed_price || 0) * 0.8;
    const balance = totalEarnings._sum.proposed_price || 0;

    const ratings = { averageRating: 0, ratingCount: 0 };

    res.set("Cache-Control", "no-store");
    res.json({
      totalGig: totalGigs,
      totalOrder: totalOrders,
      completedOrders,
      activeOrders,
      pendingOrders,
      totalEarnings: totalEarnings._sum.proposed_price || 0,
      payoutAmount,
      balance,
      averageRating: ratings.averageRating,
      ratingCount: ratings.ratingCount,
    });
  } catch (err) {
    console.error("getFreelancerDashboard error:", err);
    res.status(500).json({ message: "Failed to load freelancer dashboard" });
  }
}
