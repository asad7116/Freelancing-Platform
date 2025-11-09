import express from 'express';
import { JobPostController, upload } from '../controllers/jobPostController.js';
import { verifyJwt, authCookieName } from '../lib/jwt.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Auth middleware using cookies (consistent with your auth system)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.[authCookieName];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.'
      });
    }

    const payload = verifyJwt(token);
    if (!payload?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Public routes (no auth required)
router.get('/job-posts/browse', JobPostController.getAll); // Public browsing

// Apply auth middleware to protected routes
router.use(authMiddleware);

// Protected Job Post Routes
router.post('/job-posts', upload.single('thumb_image'), JobPostController.create);
router.get('/job-posts', JobPostController.getAll);
router.get('/job-posts/my-jobs', JobPostController.getBuyerJobs);
router.get('/job-posts/:id', JobPostController.getById);
router.put('/job-posts/:id', upload.single('thumb_image'), JobPostController.update);
router.delete('/job-posts/:id', JobPostController.delete);
router.get('/job-posts/:id/applications', JobPostController.getJobApplications);

export default router;