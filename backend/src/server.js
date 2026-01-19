import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectToDatabase, getDatabase } from "./db/mongodb.js"
import { initializeCollections } from "./db/initializeCollections.js"
import authRoutes from "./routes/auth.routes.js"
import gigsRoutes from "./routes/gigs.route.js"
import jobPostRoutes from "./routes/jobPosts.routes.js"
import categoriesRoutes from "./routes/categories.routes.js"
import publicRoutes from "./routes/public.routes.js"
import skillsRoutes from "./routes/skills.routes.js"
import path from "path"
import freelancerDashboardRoutes from "./routes/freelancerDashboard.routes.js"
import freelancerProfileRoutes from "./routes/freelancerProfile.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import clientDashboardRoutes from "./routes/clientDashboard.routes.js"
import proposalRoutes from "./routes/proposal.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import chatbotRoutes from "./routes/chatbot.routes.js"


const app = express()
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000"
const allowedOrigins = [
  FRONTEND_ORIGIN,
  "http://localhost:3000"
]
// Initialize MongoDB before starting server
async function initializeApp() {
  try {
    await connectToDatabase()
    await initializeCollections()
    console.log("[App] MongoDB initialized successfully")
  } catch (error) {
    console.error("[App] Failed to initialize MongoDB:", error)
    process.exit(1)
  }
}

initializeApp()

app.use("/uploads", express.static(path.resolve("./uploads")))

//app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools without origin (e.g. Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
  })
)
// Stripe webhook must come BEFORE express.json() to get raw body
// import { handleStripeWebhook } from "./controllers/proposal.controller.js"
// app.post("/api/webhook", express.raw({ type: "application/json" }), handleStripeWebhook)

app.use(express.json())
app.use(cookieParser())

// Routes
app.get("/", (req, res) => res.send("API running"))
app.use("/api/auth", authRoutes)
app.use("/api/gigs", gigsRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/chatbot", chatbotRoutes)
app.use("/api", publicRoutes)
app.use("/api", jobPostRoutes)
app.use("/api", categoriesRoutes)
app.use("/api", skillsRoutes)
app.use("/api/freelancer/profile", freelancerProfileRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/proposals", proposalRoutes)
app.use("/api", clientDashboardRoutes)
app.use("/api", freelancerDashboardRoutes)

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const db = await getDatabase()
    await db.admin().ping()
    res.json({ ok: true, database: "connected" })
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
