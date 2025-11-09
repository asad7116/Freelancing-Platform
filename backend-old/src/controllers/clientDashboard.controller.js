import prisma from "../prisma.js";

export async function getClientDashboard(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    console.log("🔥 Logged-in user:", req.user);

    // 1️⃣ Total job posts by buyer
    const totalJob = await prisma.jobPost.count({
      where: { buyer_id: userId },
    });

    // 2️⃣ Jobs by approval/status
    const pendingOrders = await prisma.jobPost.count({
      where: { buyer_id: userId, approved_by_admin: "pending" },
    });

    const activeOrders = await prisma.jobPost.count({
      where: { buyer_id: userId, approved_by_admin: "approved", status: "active" },
    });

    const completedOrders = await prisma.jobPost.count({
      where: { buyer_id: userId, status: "completed" },
    });

    // 3️⃣ Total Orders
    const totalOrders = totalJob;

    // 4️⃣ Total Applications related to this buyer’s jobs
    const jobIds = (
      await prisma.jobPost.findMany({
        where: { buyer_id: userId },
        select: { id: true },
      })
    ).map((j) => j.id);

    const totalApplications = jobIds.length
      ? await prisma.jobApplication.count({
          where: { job_post_id: { in: jobIds } },
        })
      : 0;

    // 5️⃣ Placeholder values
    const amounts = { totalEarnings: 0, payoutAmount: 0, balance: 0 };
    const ratings = { averageRating: 0, ratingCount: 0 };
    const totalService = 0;

    console.log("✅ Dashboard counts for", userId, {
      totalJob,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      totalApplications,
    });

    res.set("Cache-Control", "no-store");
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
    });
  } catch (err) {
    console.error("getClientDashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
}
