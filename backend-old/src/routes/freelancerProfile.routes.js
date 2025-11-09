import express from 'express';
import multer from 'multer';
import { createFreelancerProfile, getFreelancerProfile } from '../controllers/freelancerProfile.controller.js';

const router = express.Router();

// Set up image upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post('/', upload.single('profileImage'), createFreelancerProfile);
router.get('/:userId', getFreelancerProfile);

export default router;
