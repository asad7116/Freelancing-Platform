import prisma from '../prisma.js';

export const createFreelancerProfile = async (req, res) => {
  try {
    const {
      userId,
      title,
      bio,
      skills,
      hourlyRate,
      experience,
      location,
      portfolioUrl,
    } = req.body;

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const profile = await prisma.freelancerProfile.create({
      data: {
        userId: Number(userId),
        title,
        bio,
        skills,
        hourlyRate: parseFloat(hourlyRate),
        experience: parseInt(experience),
        location,
        portfolioUrl,
        profileImage,
      },
    });

    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create freelancer profile' });
  }
};

export const getFreelancerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: Number(userId) },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancer profile' });
  }
};
