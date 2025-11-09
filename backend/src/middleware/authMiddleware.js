import { verifyJwt, authCookieName } from "../lib/jwt.js"
import { getDatabase } from "../db/mongodb.js"
import { ObjectId } from "mongodb"

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.[authCookieName]
    if (!token) return res.status(401).json({ message: "No token. Please log in." })

    const payload = verifyJwt(token)
    if (!payload?.id && !payload?.sub) return res.status(401).json({ message: "Invalid token." })

    const userId = payload.id || payload.sub
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          avatar: 1,
        },
      },
    )

    if (!user) return res.status(401).json({ message: "User not found." })

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }

    next()
  } catch (error) {
    console.error("authMiddleware error:", error)
    res.status(401).json({ message: "Unauthorized", error: error.message })
  }
}
