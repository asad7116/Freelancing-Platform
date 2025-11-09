import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyJwt, authCookieName } from '../lib/jwt.js';
import { prisma } from '../prisma.js';
import {
  getProfile,
  updateFreelancerProfile,
  updateClientProfile,
  uploadProfileImage
} from '../controllers/profile.controller.js';

const router = express.Router();

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
        message: 'User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// Get user profile (works for both freelancer and client)
router.get('/', getProfile);

// Update freelancer profile
router.put('/freelancer', updateFreelancerProfile);

// Update client profile
router.put('/client', updateClientProfile);

// Upload profile image
router.post('/upload-image', upload.single('profileImage'), uploadProfileImage);

export default router;
