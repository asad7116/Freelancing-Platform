import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories (public endpoint)
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all cities (public endpoint)
router.get('/cities', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        country: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;