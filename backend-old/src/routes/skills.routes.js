import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all skills
router.get('/skills', async (req, res) => {
  try {
    const { type, category } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    
    const skills = await prisma.skill.findMany({
      where: {
        ...where,
        status: 'active'
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
});

// Get specialties by category
router.get('/specialties', async (req, res) => {
  try {
    const { category_id } = req.query;
    
    const where = { status: 'active' };
    if (category_id) {
      where.category_id = parseInt(category_id);
    }
    
    const specialties = await prisma.specialty.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: specialties
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specialties',
      error: error.message
    });
  }
});

export default router;