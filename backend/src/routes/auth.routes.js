import { Router } from "express"
import bcrypt from "bcryptjs"
import { getDatabase } from "../db/mongodb.js"
import { signupSchema, signinSchema } from "../lib/validators.js"
import { signJwt, verifyJwt, authCookieName, authCookieOpts } from "../lib/jwt.js"
import { ObjectId } from "mongodb"

const router = Router()

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const body = signupSchema.parse(req.body)
    const db = await getDatabase()
    const users = db.collection("users")

    const existing = await users.findOne({ email: body.email })
    if (existing) return res.status(409).json({ message: "Email already in use" })

    const passwordHash = await bcrypt.hash(body.password, 10)

    const result = await users.insertOne({
      _id: new ObjectId(),
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
      avatar: null,
      city_id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const user = {
      id: result.insertedId.toString(),
      name: body.name,
      email: body.email,
      role: body.role,
      createdAt: new Date(),
    }

    const token = signJwt({ sub: user.id, role: user.role })
    res.cookie(authCookieName, token, authCookieOpts)
    return res.status(201).json({ user })
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: "Invalid input", issues: err.issues })
    console.error(err)
    return res.status(500).json({ message: "Internal error" })
  }
})

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body)
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ email })
    if (!user) return res.status(401).json({ message: "Invalid credentials" })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ message: "Invalid credentials" })

    const publicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }
    const token = signJwt({ sub: user._id.toString(), role: user.role })

    res.cookie(authCookieName, token, authCookieOpts)
    return res.json({ user: publicUser })
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: "Invalid input", issues: err.issues })
    console.error(err)
    return res.status(500).json({ message: "Internal error" })
  }
})

// POST /api/auth/signout
router.post("/signout", async (_req, res) => {
  res.clearCookie(authCookieName, { ...authCookieOpts, maxAge: 0 })
  return res.json({ ok: true })
})

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const raw = req.cookies?.[authCookieName]
  if (!raw) return res.status(401).json({ user: null })

  const payload = verifyJwt(raw)
  if (!payload?.sub) return res.status(401).json({ user: null })

  const db = await getDatabase()
  const users = db.collection("users")

  const user = await users.findOne(
    { _id: new ObjectId(payload.sub) },
    {
      projection: {
        id: 1,
        name: 1,
        email: 1,
        role: 1,
        createdAt: 1,
      },
    },
  )

  if (!user) return res.status(401).json({ user: null })

  return res.json({ user: { ...user, id: user._id.toString() } })
})

export default router
