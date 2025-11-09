// backend/src/routes/freelancerDashboard.routes.js
import express from "express";
import { ensureAuth } from "../lib/jwt.js";
import { getFreelancerDashboard } from "../controllers/freelancerDashboard.controller.js";

const router = express.Router();

// Freelancer dashboard route
router.get("/freelancer/dashboard", ensureAuth, getFreelancerDashboard);

export default router;
