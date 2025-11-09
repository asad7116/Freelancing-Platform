import { verifyJwt, authCookieName } from "../lib/jwt.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.[authCookieName];
    if (!token) return res.status(401).json({ message: "No token. Please log in." });

    const payload = verifyJwt(token);
    if (!payload?.id && !payload?.sub)
      return res.status(401).json({ message: "Invalid token." });

    const userId = payload.id || payload.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
}
