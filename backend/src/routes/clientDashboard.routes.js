import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getClientDashboard } from "../controllers/clientDashboard.controller.js";

const router = express.Router();

// Protected dashboard route
router.get("/client/dashboard", authMiddleware, getClientDashboard);

export default router;
