import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
//import gigsRoutes from "./routes/gigs.routes.js"; // sheraz add this
import gigsRoutes from './routes/gigs.route.js';
import jobPostRoutes from './routes/jobPosts.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import publicRoutes from './routes/public.routes.js';
import path from "path";

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use("/uploads", express.static(path.resolve("./uploads")));


app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.send("API running"));

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigsRoutes); // sheraz add this
app.use("/api", publicRoutes); // Public routes (no auth required)
app.use("/api", jobPostRoutes);
app.use("/api", categoriesRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
