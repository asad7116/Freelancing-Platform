// Static categories data - same for all users
export const categories = [
  { 
    id: 'web-development', 
    name: 'Web Development', 
    slug: 'web-development', 
    description: 'Frontend and backend web development services',
    specialties: [
      'Full Stack Development', 'Frontend Development', 'Backend Development',
      'E-commerce Development', 'API Development', 'Database Design',
      'WordPress Development', 'Shopify Development', 'CMS Development',
      'Progressive Web Apps', 'Landing Page Design', 'Web Performance Optimization'
    ]
  },
  { 
    id: 'mobile-app-development', 
    name: 'Mobile App Development', 
    slug: 'mobile-app-development', 
    description: 'iOS and Android app development',
    specialties: [
      'iOS Development', 'Android Development', 'React Native',
      'Flutter Development', 'Cross-platform Development', 'Mobile UI/UX',
      'App Testing & QA', 'App Maintenance', 'Wearable App Development'
    ]
  },
  { 
    id: 'ui-ux-design', 
    name: 'UI/UX Design', 
    slug: 'ui-ux-design', 
    description: 'User interface and user experience design',
    specialties: [
      'User Interface Design', 'User Experience Design', 'Wireframing & Prototyping',
      'Usability Testing', 'Design Systems', 'Mobile App Design',
      'Web App Design', 'Interaction Design', 'Information Architecture'
    ]
  },
  { 
    id: 'graphic-design', 
    name: 'Graphic Design', 
    slug: 'graphic-design', 
    description: 'Logo design, branding, and visual content',
    specialties: [
      'Logo Design', 'Brand Identity', 'Print Design',
      'Packaging Design', 'Illustration', 'Typography',
      'Social Media Graphics', 'Marketing Materials', 'Infographic Design'
    ]
  },
  { 
    id: 'digital-marketing', 
    name: 'Digital Marketing', 
    slug: 'digital-marketing', 
    description: 'SEO, social media marketing, and content marketing',
    specialties: [
      'SEO', 'Social Media Marketing', 'Content Marketing',
      'Email Marketing', 'PPC Advertising', 'Influencer Marketing',
      'Marketing Analytics', 'Conversion Optimization', 'Affiliate Marketing',
      'Growth Hacking'
    ]
  },
  { 
    id: 'content-writing', 
    name: 'Content Writing', 
    slug: 'content-writing', 
    description: 'Blog posts, articles, and copywriting',
    specialties: [
      'Blog Writing', 'Copywriting', 'Technical Writing',
      'SEO Content', 'Product Descriptions', 'Social Media Content',
      'Creative Writing', 'Editing & Proofreading', 'Grant Writing',
      'Ghostwriting', 'Resume & Cover Letter Writing'
    ]
  },
  { 
    id: 'data-science-analytics', 
    name: 'Data Science & Analytics', 
    slug: 'data-science-analytics', 
    description: 'Data science, analytics, and machine learning services',
    specialties: [
      'Statistical Analysis', 'Business Intelligence', 'Data Visualization',
      'Predictive Modeling', 'Machine Learning', 'Data Mining',
      'Big Data Analytics', 'SQL Analysis', 'Natural Language Processing',
      'Deep Learning'
    ]
  },
  { 
    id: 'video-animation', 
    name: 'Video & Animation', 
    slug: 'video-animation', 
    description: 'Video production, editing, and animation services',
    specialties: [
      'Video Editing', 'Motion Graphics', '2D Animation',
      '3D Animation', 'Explainer Videos', 'Whiteboard Animation',
      'Color Grading', 'YouTube Video Editing', 'Corporate Videos',
      'Product Videos', 'Music Videos'
    ]
  },
  {
    id: 'audio-music',
    name: 'Audio & Music',
    slug: 'audio-music',
    description: 'Audio production, voice-over, and music services',
    specialties: [
      'Voice Over', 'Audio Editing', 'Podcast Production',
      'Music Production', 'Sound Design', 'Jingles & Intros',
      'Audio Mixing & Mastering', 'Audiobook Production', 'Song Writing'
    ]
  },
  {
    id: 'translation-languages',
    name: 'Translation & Languages',
    slug: 'translation-languages',
    description: 'Translation, localization, and interpretation services',
    specialties: [
      'Document Translation', 'Website Localization', 'Technical Translation',
      'Legal Translation', 'Medical Translation', 'Subtitle & Captioning',
      'Transcription', 'Interpretation', 'Proofreading (Multilingual)'
    ]
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant',
    slug: 'virtual-assistant',
    description: 'Administrative support and virtual assistant services',
    specialties: [
      'General Admin', 'Data Entry', 'Email Management',
      'Calendar Management', 'Customer Support', 'Research',
      'Travel Planning', 'Bookkeeping', 'Social Media Management'
    ]
  },
  {
    id: 'accounting-finance',
    name: 'Accounting & Finance',
    slug: 'accounting-finance',
    description: 'Accounting, bookkeeping, and financial services',
    specialties: [
      'Bookkeeping', 'Tax Preparation', 'Financial Analysis',
      'Financial Modeling', 'Payroll Processing', 'Invoicing',
      'Budgeting & Forecasting', 'Audit Support', 'Crypto & Blockchain Accounting'
    ]
  },
  {
    id: 'legal-services',
    name: 'Legal Services',
    slug: 'legal-services',
    description: 'Legal consulting, contracts, and compliance services',
    specialties: [
      'Contract Drafting', 'Legal Research', 'Business Formation',
      'Intellectual Property', 'Privacy & GDPR Compliance', 'Terms & Policies',
      'Immigration Consulting', 'Trademark Registration'
    ]
  },
  {
    id: 'engineering-architecture',
    name: 'Engineering & Architecture',
    slug: 'engineering-architecture',
    description: 'CAD, structural, and architectural design services',
    specialties: [
      'CAD Design', '3D Modeling (Mechanical)', 'Structural Engineering',
      'Architectural Design', 'Interior Design', 'Electrical Engineering',
      'Civil Engineering', 'Product Design', 'PCB Design'
    ]
  },
  {
    id: 'sales-business-development',
    name: 'Sales & Business Development',
    slug: 'sales-business-development',
    description: 'Lead generation, CRM, and sales strategy services',
    specialties: [
      'Lead Generation', 'Cold Calling & Outreach', 'CRM Management',
      'Sales Funnels', 'Market Research', 'Business Plan Writing',
      'Pitch Deck Design', 'Partnership Development', 'Telemarketing'
    ]
  },
  {
    id: 'photography',
    name: 'Photography',
    slug: 'photography',
    description: 'Photography, editing, and retouching services',
    specialties: [
      'Product Photography', 'Portrait Photography', 'Photo Editing & Retouching',
      'Real Estate Photography', 'Food Photography', 'Event Photography',
      'Stock Photography', 'Photo Manipulation'
    ]
  },
  {
    id: 'game-development',
    name: 'Game Development',
    slug: 'game-development',
    description: 'Game design, development, and testing services',
    specialties: [
      'Unity Development', 'Unreal Engine Development', '2D Game Design',
      '3D Game Design', 'Game UI/UX', 'Game Testing & QA',
      'Concept Art', 'Level Design', 'Game Scripting'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security auditing, penetration testing, and compliance',
    specialties: [
      'Penetration Testing', 'Security Auditing', 'Vulnerability Assessment',
      'Network Security', 'Cloud Security', 'Malware Analysis',
      'Compliance & Risk Assessment', 'Incident Response', 'SIEM & Monitoring'
    ]
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'Cloud infrastructure, CI/CD, and DevOps services',
    specialties: [
      'AWS Solutions', 'Azure Solutions', 'Google Cloud Platform',
      'Docker & Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code',
      'Server Administration', 'Database Administration', 'Monitoring & Logging'
    ]
  },
  {
    id: 'ai-machine-learning',
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Artificial intelligence and machine learning solutions',
    specialties: [
      'ChatGPT / LLM Integration', 'Computer Vision', 'NLP Solutions',
      'Recommendation Systems', 'Predictive Analytics', 'AI Chatbot Development',
      'Model Training & Fine-tuning', 'Data Annotation & Labeling',
      'Reinforcement Learning'
    ]
  },
  {
    id: 'blockchain-web3',
    name: 'Blockchain & Web3',
    slug: 'blockchain-web3',
    description: 'Blockchain, smart contracts, and decentralized app development',
    specialties: [
      'Smart Contract Development', 'DApp Development', 'NFT Development',
      'DeFi Solutions', 'Token Development', 'Blockchain Consulting',
      'Wallet Integration', 'DAO Development', 'Web3 Frontend'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    slug: 'ecommerce',
    description: 'Online store setup, optimization, and management',
    specialties: [
      'Shopify Store Setup', 'WooCommerce Development', 'Amazon Seller Services',
      'Product Listing Optimization', 'Dropshipping Setup', 'Payment Gateway Integration',
      'Inventory Management', 'Marketplace Integration', 'Conversion Rate Optimization'
    ]
  },
  {
    id: 'project-management',
    name: 'Project Management',
    slug: 'project-management',
    description: 'Project planning, Agile coaching, and team coordination',
    specialties: [
      'Agile / Scrum Coaching', 'Project Planning', 'Resource Allocation',
      'Risk Management', 'Stakeholder Management', 'JIRA / Asana Setup',
      'Process Improvement', 'Technical Project Management'
    ]
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    slug: 'human-resources',
    description: 'Recruitment, HR consulting, and training services',
    specialties: [
      'Recruitment & Headhunting', 'HR Consulting', 'Employee Onboarding',
      'Performance Management', 'Training & Development', 'Compensation & Benefits',
      'HR Policy Writing', 'Employer Branding'
    ]
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    slug: 'customer-service',
    description: 'Customer support, help desk, and community management',
    specialties: [
      'Live Chat Support', 'Email Support', 'Phone Support',
      'Help Desk Management', 'Community Management', 'Technical Support',
      'Customer Success', 'Knowledge Base Creation'
    ]
  },
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
