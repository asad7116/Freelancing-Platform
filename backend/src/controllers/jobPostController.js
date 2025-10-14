import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/job-thumbnails/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'job-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Create upload directory if it doesn't exist
const createUploadDir = async () => {
  try {
    await fs.mkdir('uploads/job-thumbnails/', { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

createUploadDir();

class JobPostController {
  // Create new job post
  static async create(req, res) {
    try {
      const {
        // Basic info
        title,
        summary,
        description,
        deliverables,
        category_id,
        specialty,
        
        // Budget
        budget_type,
        hourly_rate_from,
        hourly_rate_to,
        fixed_price,
        
        // Project details
        project_type,
        duration,
        hours_per_week,
        job_size,
        freelancers_needed,
        
        // Experience and skills
        experience_level,
        mandatory_skills,
        nice_to_have_skills,
        tools,
        languages,
        
        // Legacy fields (for backward compatibility)
        regular_price,
        job_type,
        city_id
      } = req.body;

      const userId = req.user.id; // From auth middleware

      // Generate slug from title if not provided
      const jobSlug = title?.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') + '-' + Date.now();

      // Validation
      const errors = {};
      
      if (!title?.trim()) errors.title = 'Job title is required';
      if (!category_id) errors.category_id = 'Category is required';
      if (!description?.trim()) errors.description = 'Description is required';
      
      // Budget validation
      if (budget_type === 'hourly') {
        if (!hourly_rate_from) errors.hourly_rate_from = 'Minimum hourly rate is required';
        if (!hourly_rate_to) errors.hourly_rate_to = 'Maximum hourly rate is required';
        if (parseFloat(hourly_rate_from) >= parseFloat(hourly_rate_to)) {
          errors.hourly_rate_to = 'Maximum rate must be higher than minimum rate';
        }
      } else if (budget_type === 'fixed') {
        if (!fixed_price) errors.fixed_price = 'Fixed price is required';
      }

      // Skills validation
      try {
        const parsedMandatorySkills = mandatory_skills ? JSON.parse(mandatory_skills) : [];
        if (parsedMandatorySkills.length === 0) {
          errors.mandatory_skills = 'At least one mandatory skill is required';
        }
      } catch (e) {
        errors.mandatory_skills = 'Invalid skills format';
      }

      // Validate category exists
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(category_id) }
      });

      if (!categoryExists) {
        errors.category_id = 'Selected category does not exist';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Create job post
      const jobPostData = {
        title,
        slug: jobSlug,
        summary,
        description,
        deliverables,
        category_id: parseInt(category_id),
        specialty,
        city_id: city_id ? parseInt(city_id) : null,
        
        // Budget fields
        budget_type: budget_type || 'hourly',
        hourly_rate_from: hourly_rate_from ? parseFloat(hourly_rate_from) : null,
        hourly_rate_to: hourly_rate_to ? parseFloat(hourly_rate_to) : null,
        fixed_price: fixed_price ? parseFloat(fixed_price) : null,
        
        // Project details
        project_type: project_type || 'one-time',
        duration,
        hours_per_week,
        job_size,
        freelancers_needed: freelancers_needed ? parseInt(freelancers_needed) : 1,
        
        // Experience and skills (stored as JSON)
        experience_level: experience_level || 'intermediate',
        mandatory_skills: mandatory_skills ? JSON.parse(mandatory_skills) : [],
        nice_to_have_skills: nice_to_have_skills ? JSON.parse(nice_to_have_skills) : [],
        tools: tools ? JSON.parse(tools) : [],
        languages: languages ? JSON.parse(languages) : [],
        
        // Legacy fields (for backward compatibility)
        regular_price: fixed_price ? parseFloat(fixed_price) : (hourly_rate_to ? parseFloat(hourly_rate_to) : null),
        job_type: budget_type === 'hourly' ? 'Hourly' : 'Fixed',
        
        buyer_id: userId,
        status: 'active',
        approved_by_admin: 'pending'
      };

      // Add thumbnail if uploaded
      if (req.file) {
        jobPostData.thumb_image = req.file.filename;
      }

      // Create the include object dynamically
      const includeOptions = {
        category: {
          select: { id: true, name: true }
        },
        buyer: {
          select: { id: true, name: true, email: true }
        }
      };

      // Only include city if city_id is provided
      if (city_id) {
        includeOptions.city = {
          select: { id: true, name: true }
        };
      }

      const jobPost = await prisma.jobPost.create({
        data: jobPostData,
        include: includeOptions
      });

      res.status(201).json({
        success: true,
        message: 'Job post created successfully',
        data: jobPost
      });

    } catch (error) {
      console.error('Error creating job post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all job posts
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category_id, 
        city_id, 
        job_type, 
        min_price, 
        max_price,
        search 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build where conditions
      const where = {
        status: 'active'
        // Temporarily removed approval requirement for testing
        // approved_by_admin: 'approved'
      };

      if (category_id) {
        where.category_id = parseInt(category_id);
      }

      if (city_id) {
        where.city_id = parseInt(city_id);
      }

      if (job_type) {
        where.job_type = job_type;
      }

      if (min_price || max_price) {
        where.regular_price = {};
        if (min_price) where.regular_price.gte = parseFloat(min_price);
        if (max_price) where.regular_price.lte = parseFloat(max_price);
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [jobPosts, total] = await Promise.all([
        prisma.jobPost.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true }
            },
            city: {
              select: { id: true, name: true }
            },
            buyer: {
              select: { id: true, name: true, avatar: true }
            },
            _count: {
              select: { applications: true }
            }
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.jobPost.count({ where })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: jobPosts,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching job posts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get job post by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const jobPost = await prisma.jobPost.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: {
            select: { id: true, name: true }
          },
          city: {
            select: { id: true, name: true }
          },
          buyer: {
            select: { id: true, name: true, avatar: true, createdAt: true }
          },
          applications: {
            include: {
              freelancer: {
                select: { id: true, name: true, avatar: true }
              }
            },
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: { applications: true }
          }
        }
      });

      if (!jobPost) {
        return res.status(404).json({
          success: false,
          message: 'Job post not found'
        });
      }

      res.json({
        success: true,
        data: jobPost
      });

    } catch (error) {
      console.error('Error fetching job post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get buyer's job posts
  static async getBuyerJobs(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = { buyer_id: userId };
      
      if (status) {
        where.approved_by_admin = status;
      }

      const [jobPosts, total] = await Promise.all([
        prisma.jobPost.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true }
            },
            city: {
              select: { id: true, name: true }
            },
            _count: {
              select: { applications: true }
            }
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.jobPost.count({ where })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: jobPosts,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching buyer job posts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update job post
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const {
        // Basic info
        title,
        summary,
        description,
        deliverables,
        category_id,
        specialty,
        
        // Budget
        budget_type,
        hourly_rate_from,
        hourly_rate_to,
        fixed_price,
        
        // Project details
        project_type,
        duration,
        hours_per_week,
        job_size,
        freelancers_needed,
        
        // Experience and skills
        experience_level,
        mandatory_skills,
        nice_to_have_skills,
        tools,
        languages,
        
        // Legacy fields (for backward compatibility)
        slug,
        city_id,
        regular_price,
        job_type
      } = req.body;

      // Check if job post exists and belongs to user
      const existingJobPost = await prisma.jobPost.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingJobPost) {
        return res.status(404).json({
          success: false,
          message: 'Job post not found'
        });
      }

      if (existingJobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own job posts'
        });
      }

      // Validation
      const errors = {};
      
      if (title && !title.trim()) errors.title = 'Job title cannot be empty';
      if (description && !description.trim()) errors.description = 'Description cannot be empty';
      
      // Budget validation
      if (budget_type === 'hourly') {
        if (hourly_rate_from && hourly_rate_to) {
          if (parseFloat(hourly_rate_from) >= parseFloat(hourly_rate_to)) {
            errors.hourly_rate_to = 'Maximum rate must be higher than minimum rate';
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Prepare update data
      const updateData = {};
      if (title) updateData.title = title;
      if (summary !== undefined) updateData.summary = summary;
      if (description) updateData.description = description;
      if (deliverables !== undefined) updateData.deliverables = deliverables;
      if (category_id) updateData.category_id = parseInt(category_id);
      if (specialty !== undefined) updateData.specialty = specialty;
      if (city_id) updateData.city_id = parseInt(city_id);
      
      // Budget fields
      if (budget_type) updateData.budget_type = budget_type;
      if (hourly_rate_from !== undefined) updateData.hourly_rate_from = hourly_rate_from ? parseFloat(hourly_rate_from) : null;
      if (hourly_rate_to !== undefined) updateData.hourly_rate_to = hourly_rate_to ? parseFloat(hourly_rate_to) : null;
      if (fixed_price !== undefined) updateData.fixed_price = fixed_price ? parseFloat(fixed_price) : null;
      
      // Project details
      if (project_type) updateData.project_type = project_type;
      if (duration !== undefined) updateData.duration = duration;
      if (hours_per_week !== undefined) updateData.hours_per_week = hours_per_week;
      if (job_size !== undefined) updateData.job_size = job_size;
      if (freelancers_needed) updateData.freelancers_needed = parseInt(freelancers_needed);
      
      // Experience and skills (stored as JSON)
      if (experience_level) updateData.experience_level = experience_level;
      if (mandatory_skills) updateData.mandatory_skills = typeof mandatory_skills === 'string' ? JSON.parse(mandatory_skills) : mandatory_skills;
      if (nice_to_have_skills) updateData.nice_to_have_skills = typeof nice_to_have_skills === 'string' ? JSON.parse(nice_to_have_skills) : nice_to_have_skills;
      if (tools) updateData.tools = typeof tools === 'string' ? JSON.parse(tools) : tools;
      if (languages) updateData.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      
      // Legacy fields (for backward compatibility)
      if (regular_price !== undefined) updateData.regular_price = regular_price ? parseFloat(regular_price) : null;
      if (job_type) updateData.job_type = job_type;
      
      // Update regular_price and job_type based on budget fields if not explicitly provided
      if (!regular_price) {
        if (fixed_price) {
          updateData.regular_price = parseFloat(fixed_price);
        } else if (hourly_rate_to) {
          updateData.regular_price = parseFloat(hourly_rate_to);
        }
      }
      
      if (!job_type && budget_type) {
        updateData.job_type = budget_type === 'hourly' ? 'Hourly' : 'Fixed';
      }

      // Add thumbnail if uploaded
      if (req.file) {
        updateData.thumb_image = req.file.filename;
        
        // Delete old thumbnail if exists
        if (existingJobPost.thumb_image) {
          try {
            await fs.unlink(`uploads/job-thumbnails/${existingJobPost.thumb_image}`);
          } catch (error) {
            console.error('Error deleting old thumbnail:', error);
          }
        }
      }

      const updatedJobPost = await prisma.jobPost.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          category: {
            select: { id: true, name: true }
          },
          city: {
            select: { id: true, name: true }
          },
          buyer: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.json({
        success: true,
        message: 'Job post updated successfully',
        data: updatedJobPost
      });

    } catch (error) {
      console.error('Error updating job post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete job post
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if job post exists and belongs to user
      const existingJobPost = await prisma.jobPost.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingJobPost) {
        return res.status(404).json({
          success: false,
          message: 'Job post not found'
        });
      }

      if (existingJobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own job posts'
        });
      }

      // Delete thumbnail file if exists
      if (existingJobPost.thumb_image) {
        try {
          await fs.unlink(`uploads/job-thumbnails/${existingJobPost.thumb_image}`);
        } catch (error) {
          console.error('Error deleting thumbnail:', error);
        }
      }

      // Delete job post (this will cascade delete applications)
      await prisma.jobPost.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Job post deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting job post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get job applications for a specific job post
  static async getJobApplications(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Check if job post exists and belongs to user
      const jobPost = await prisma.jobPost.findUnique({
        where: { id: parseInt(id) }
      });

      if (!jobPost) {
        return res.status(404).json({
          success: false,
          message: 'Job post not found'
        });
      }

      if (jobPost.buyer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view applications for your own job posts'
        });
      }

      const [applications, total] = await Promise.all([
        prisma.jobApplication.findMany({
          where: { job_post_id: parseInt(id) },
          include: {
            freelancer: {
              select: { 
                id: true, 
                name: true, 
                email: true, 
                avatar: true,
                createdAt: true 
              }
            }
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.jobApplication.count({
          where: { job_post_id: parseInt(id) }
        })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: applications,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error fetching job applications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export { JobPostController, upload };