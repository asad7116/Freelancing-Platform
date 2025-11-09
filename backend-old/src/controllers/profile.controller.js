import { prisma } from '../prisma.js';

// Get user profile (freelancer or client based on role)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        city_id: true,
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;

    // Get role-specific profile
    if (userRole === 'freelancer') {
      profile = await prisma.freelancerProfile.findUnique({
        where: { user_id: userId }
      });

      // Create default profile if doesn't exist
      if (!profile) {
        profile = await prisma.freelancerProfile.create({
          data: {
            user_id: userId,
            skills: [],
            languages: [],
            education: [],
            experience: [],
            certifications: [],
            portfolio_items: [],
            bank_accounts: [],
            payment_methods: []
          }
        });
      }
    } else if (userRole === 'client') {
      profile = await prisma.clientProfile.findUnique({
        where: { user_id: userId }
      });

      // Create default profile if doesn't exist
      if (!profile) {
        profile = await prisma.clientProfile.create({
          data: {
            user_id: userId,
            education: [],
            certifications: [],
            bank_accounts: [],
            payment_methods: []
          }
        });
      }
    }

    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Update freelancer profile
export const updateFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      // Personal Information
      title,
      bio,
      phone,
      date_of_birth,
      gender,
      
      // Location
      address,
      city,
      state,
      country,
      postal_code,
      
      // Professional Details
      specialization,
      hourly_rate,
      years_of_experience,
      
      // Skills & Languages
      skills,
      languages,
      
      // Education
      education,
      
      // Experience
      experience,
      
      // Certifications
      certifications,
      
      // Portfolio
      portfolio_items,
      
      // Social Links
      linkedin_url,
      github_url,
      website_url,
      twitter_url,
      
      // Payment Information
      bank_accounts,
      payment_methods,
      
      // Profile Settings
      profile_image,
      cover_image,
      is_available
    } = req.body;

    // Check if profile exists
    let profile = await prisma.freelancerProfile.findUnique({
      where: { user_id: userId }
    });

    const profileData = {
      title,
      bio,
      phone,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      gender,
      address,
      city,
      state,
      country,
      postal_code,
      specialization,
      hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
      years_of_experience: years_of_experience ? parseInt(years_of_experience) : 0,
      skills: skills || [],
      languages: languages || [],
      education: education || [],
      experience: experience || [],
      certifications: certifications || [],
      portfolio_items: portfolio_items || [],
      linkedin_url,
      github_url,
      website_url,
      twitter_url,
      bank_accounts: bank_accounts || [],
      payment_methods: payment_methods || [],
      profile_image,
      cover_image,
      is_available: is_available !== undefined ? is_available : true
    };

    if (profile) {
      // Update existing profile
      profile = await prisma.freelancerProfile.update({
        where: { user_id: userId },
        data: profileData
      });
    } else {
      // Create new profile
      profile = await prisma.freelancerProfile.create({
        data: {
          user_id: userId,
          ...profileData
        }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update freelancer profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Update client profile
export const updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      // Personal Information
      phone,
      date_of_birth,
      gender,
      company_name,
      company_size,
      industry,
      
      // Location
      address,
      city,
      state,
      country,
      postal_code,
      
      // Contact Information
      website_url,
      linkedin_url,
      
      // Education
      education,
      
      // Certifications
      certifications,
      
      // Payment Information
      bank_accounts,
      payment_methods,
      
      // Profile Settings
      profile_image,
      
      // Preferences
      preferred_language,
      timezone
    } = req.body;

    // Check if profile exists
    let profile = await prisma.clientProfile.findUnique({
      where: { user_id: userId }
    });

    const profileData = {
      phone,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      gender,
      company_name,
      company_size,
      industry,
      address,
      city,
      state,
      country,
      postal_code,
      website_url,
      linkedin_url,
      education: education || [],
      certifications: certifications || [],
      bank_accounts: bank_accounts || [],
      payment_methods: payment_methods || [],
      profile_image,
      preferred_language: preferred_language || 'en',
      timezone
    };

    if (profile) {
      // Update existing profile
      profile = await prisma.clientProfile.update({
        where: { user_id: userId },
        data: profileData
      });
    } else {
      // Create new profile
      profile = await prisma.clientProfile.create({
        data: {
          user_id: userId,
          ...profileData
        }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update client profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Update profile image based on role
    if (userRole === 'freelancer') {
      await prisma.freelancerProfile.upsert({
        where: { user_id: userId },
        update: { profile_image: imagePath },
        create: {
          user_id: userId,
          profile_image: imagePath,
          skills: [],
          languages: [],
          education: [],
          experience: [],
          certifications: [],
          portfolio_items: [],
          bank_accounts: [],
          payment_methods: []
        }
      });
    } else if (userRole === 'client') {
      await prisma.clientProfile.upsert({
        where: { user_id: userId },
        update: { profile_image: imagePath },
        create: {
          user_id: userId,
          profile_image: imagePath,
          education: [],
          certifications: [],
          bank_accounts: [],
          payment_methods: []
        }
      });
    }

    res.json({
      message: 'Profile image uploaded successfully',
      imagePath
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};
