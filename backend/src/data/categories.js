// Static categories data - same for all users
export const categories = [
  { 
    id: 'web-development', 
    name: 'Web Development', 
    slug: 'web-development', 
    description: 'Frontend and backend web development services',
    specialties: [
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'E-commerce Development',
      'API Development',
      'Database Design',
      'WordPress Development',
      'Shopify Development'
    ]
  },
  { 
    id: 'mobile-app-development', 
    name: 'Mobile App Development', 
    slug: 'mobile-app-development', 
    description: 'iOS and Android app development',
    specialties: [
      'iOS Development',
      'Android Development',
      'React Native',
      'Flutter Development',
      'Cross-platform Development',
      'Mobile UI/UX',
      'App Testing'
    ]
  },
  { 
    id: 'ui-ux-design', 
    name: 'UI/UX Design', 
    slug: 'ui-ux-design', 
    description: 'User interface and user experience design',
    specialties: [
      'User Interface Design',
      'User Experience Design',
      'Wireframing',
      'Prototyping',
      'Usability Testing',
      'Design Systems',
      'Mobile App Design',
      'Web Design'
    ]
  },
  { 
    id: 'graphic-design', 
    name: 'Graphic Design', 
    slug: 'graphic-design', 
    description: 'Logo design, branding, and visual content',
    specialties: [
      'Logo Design',
      'Brand Identity',
      'Print Design',
      'Packaging Design',
      'Illustration',
      'Typography',
      'Social Media Graphics',
      'Marketing Materials'
    ]
  },
  { 
    id: 'digital-marketing', 
    name: 'Digital Marketing', 
    slug: 'digital-marketing', 
    description: 'SEO, social media marketing, and content marketing',
    specialties: [
      'SEO',
      'Social Media Marketing',
      'Content Marketing',
      'Email Marketing',
      'PPC Advertising',
      'Influencer Marketing',
      'Marketing Analytics',
      'Conversion Optimization'
    ]
  },
  { 
    id: 'content-writing', 
    name: 'Content Writing', 
    slug: 'content-writing', 
    description: 'Blog posts, articles, and copywriting',
    specialties: [
      'Blog Writing',
      'Copywriting',
      'Technical Writing',
      'SEO Content',
      'Product Descriptions',
      'Social Media Content',
      'Creative Writing',
      'Editing & Proofreading'
    ]
  },
  { 
    id: 'data-analysis', 
    name: 'Data Analysis', 
    slug: 'data-analysis', 
    description: 'Data science and analytics services',
    specialties: [
      'Statistical Analysis',
      'Business Intelligence',
      'Data Visualization',
      'Predictive Modeling',
      'Machine Learning',
      'Data Mining',
      'Big Data Analytics',
      'SQL Analysis'
    ]
  },
  { 
    id: 'video-editing', 
    name: 'Video Editing', 
    slug: 'video-editing', 
    description: 'Video production and post-production services',
    specialties: [
      'Video Production',
      'Motion Graphics',
      'Color Grading',
      'Audio Editing',
      'YouTube Videos',
      'Corporate Videos',
      'Wedding Videos',
      'Promotional Videos'
    ]
  }
];

// Helper function to get category by ID/slug
export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id || cat.slug === id);
};

// Helper function to get all category names
export const getCategoryNames = () => {
  return categories.map(cat => cat.name);
};

// Helper function to get specialties for a category
export const getSpecialtiesByCategory = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.specialties : [];
};
