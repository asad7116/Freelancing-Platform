import { Router } from "express"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"
import { getDatabase } from "../db/mongodb.js"
import { signupSchema, signinSchema } from "../lib/validators.js"
import { signJwt, verifyJwt, authCookieName, authCookieOpts, ensureAuth } from "../lib/jwt.js"
import { ObjectId } from "mongodb"

const router = Router()

const googleClient = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID)

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
    const token = signJwt({ id: user._id.toString(), role: user.role })

    res.cookie(authCookieName, token, authCookieOpts)
    return res.json({ user: publicUser })
  } catch (err) {
    if (err?.issues) return res.status(400).json({ message: "Invalid input", issues: err.issues })
    console.error("❌ Signin error:", err)
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

// POST /api/auth/google - Sign in / up with Google ID token
router.post("/google", async (req, res) => {
  try {
    console.log("[Google Auth] Request received")
    const { id_token } = req.body
    if (!id_token) {
      console.log("[Google Auth] No id_token provided")
      return res.status(400).json({ message: "id_token is required" })
    }

    console.log("[Google Auth] Verifying token with Google...")
    console.log("[Google Auth] Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID)
    
    // Verify the token with Google's library
    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: process.env.REACT_APP_GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    console.log("[Google Auth] Token verified. Payload:", { sub: payload.sub, email: payload.email })
    
    const googleId = payload.sub
    const email = payload.email
    const name = payload.name
    const picture = payload.picture

    const db = await getDatabase()
    const users = db.collection("users")

    // Try to find user by googleId first, then by email
    let user = await users.findOne({ googleId })
    if (!user && email) user = await users.findOne({ email })

    if (user) {
      console.log("[Google Auth] User found:", user._id)
      // Update record if missing googleId or avatar
      const updates = {}
      if (!user.googleId) updates.googleId = googleId
      if (!user.avatar && picture) updates.avatar = picture
      if (Object.keys(updates).length > 0) {
        await users.updateOne({ _id: user._id }, { $set: { ...updates, updatedAt: new Date() } })
        user = await users.findOne({ _id: user._id })
      }
      var isNewUser = false
    } else {
      console.log("[Google Auth] Creating new user...")
      // Create new user with no role yet (they'll choose in onboarding)
      const result = await users.insertOne({
        name: name || "",
        email: email || null,
        passwordHash: null,
        role: null, // No role selected yet
        avatar: picture || null,
        googleId,
        city_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      user = await users.findOne({ _id: result.insertedId })
      console.log("[Google Auth] New user created:", user._id)
      var isNewUser = true
    }

    const publicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
      isNewUser: isNewUser,
    }

    const token = signJwt({ id: user._id.toString(), role: user.role })
    res.cookie(authCookieName, token, authCookieOpts)
    console.log("[Google Auth] Success! User logged in:", publicUser.id)
    return res.json({ user: publicUser })
  } catch (err) {
    console.error("[Google Auth] Error:", err.message)
    console.error("[Google Auth] Full error:", err)
    return res.status(500).json({ message: "Google sign-in failed", error: err.message })
  }
})

// PUT /api/auth/set-role - Set user role after sign-up (used for Google users)
router.put("/set-role", ensureAuth, async (req, res) => {
  try {
    const { role } = req.body
    const userId = req.user?.sub || req.user?.id
    
    console.log("[Set Role] Request received");
    console.log("[Set Role] req.user:", req.user);
    console.log("[Set Role] userId extracted:", userId);
    console.log("[Set Role] role from body:", role);

    if (!userId) {
      console.log("[Set Role] No userId found - Unauthorized");
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!role || !["client", "freelancer"].includes(role)) {
      console.log("[Set Role] Invalid role:", role);
      return res.status(400).json({ message: "Invalid role. Must be 'client' or 'freelancer'" })
    }

    const db = await getDatabase()
    const users = db.collection("users")
    
    console.log("[Set Role] Attempting to update user with ObjectId:", userId);

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: "after" }
    )
    
    console.log("[Set Role] Update result:", result);

    // MongoDB's findOneAndUpdate returns the document directly, not in result.value
    const user = result
    
    if (!user || !user._id) {
      console.log("[Set Role] User not found in database with ID:", userId);
      return res.status(404).json({ message: "User not found" })
    }

    const publicUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
    }

    // Issue a new JWT token with the updated role
    const token = signJwt({ id: user._id.toString(), role: user.role })
    res.cookie(authCookieName, token, authCookieOpts)

    console.log("[Set Role] User role updated successfully:", userId, "=>", role)
    console.log("[Set Role] New JWT token issued with role:", role)
    return res.json({ user: publicUser })
  } catch (err) {
    console.error("[Set Role] Error:", err.message)
    console.error("[Set Role] Full error:", err)
    return res.status(500).json({ message: "Failed to set role", error: err.message })
  }
})

export default router
