import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend web development services' },
    { name: 'Mobile App Development', slug: 'mobile-app-development', description: 'iOS and Android app development' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and user experience design' },
    { name: 'Graphic Design', slug: 'graphic-design', description: 'Logo design, branding, and visual content' },
    { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, social media marketing, and content marketing' },
    { name: 'Content Writing', slug: 'content-writing', description: 'Blog posts, articles, and copywriting' },
    { name: 'Data Analysis', slug: 'data-analysis', description: 'Data science and analytics services' },
    { name: 'Video Editing', slug: 'video-editing', description: 'Video production and post-production services' }
  ];

  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // Create cities
  const cities = [
    // Pakistani cities
    { name: 'Karachi', country: 'Pakistan' },
    { name: 'Lahore', country: 'Pakistan' },
    { name: 'Islamabad', country: 'Pakistan' },
    { name: 'Rawalpindi', country: 'Pakistan' },
    { name: 'Faisalabad', country: 'Pakistan' },
    { name: 'Multan', country: 'Pakistan' },
    { name: 'Peshawar', country: 'Pakistan' },
    { name: 'Quetta', country: 'Pakistan' },
    // International cities
    { name: 'New York', country: 'USA' },
    { name: 'Los Angeles', country: 'USA' },
    { name: 'London', country: 'UK' },
    { name: 'Paris', country: 'France' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Toronto', country: 'Canada' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Dubai', country: 'UAE' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'São Paulo', country: 'Brazil' }
  ];

  console.log('Creating cities...');
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: {},
      create: city
    });
  }

  // Create skills
  const skills = [
    // Programming Languages
    { name: 'JavaScript', category: 'Programming Languages', type: 'skill' },
    { name: 'Python', category: 'Programming Languages', type: 'skill' },
    { name: 'Java', category: 'Programming Languages', type: 'skill' },
    { name: 'PHP', category: 'Programming Languages', type: 'skill' },
    { name: 'C#', category: 'Programming Languages', type: 'skill' },
    { name: 'Ruby', category: 'Programming Languages', type: 'skill' },
    { name: 'Go', category: 'Programming Languages', type: 'skill' },
    { name: 'TypeScript', category: 'Programming Languages', type: 'skill' },
    
    // Web Technologies
    { name: 'HTML', category: 'Web Technologies', type: 'skill' },
    { name: 'CSS', category: 'Web Technologies', type: 'skill' },
    { name: 'React', category: 'Web Technologies', type: 'skill' },
    { name: 'Vue.js', category: 'Web Technologies', type: 'skill' },
    { name: 'Angular', category: 'Web Technologies', type: 'skill' },
    { name: 'Node.js', category: 'Web Technologies', type: 'skill' },
    { name: 'Express.js', category: 'Web Technologies', type: 'skill' },
    { name: 'Next.js', category: 'Web Technologies', type: 'skill' },
    
    // Databases
    { name: 'MySQL', category: 'Databases', type: 'skill' },
    { name: 'PostgreSQL', category: 'Databases', type: 'skill' },
    { name: 'MongoDB', category: 'Databases', type: 'skill' },
    { name: 'Redis', category: 'Databases', type: 'skill' },
    
    // Tools
    { name: 'Git', category: 'Development Tools', type: 'tool' },
    { name: 'Docker', category: 'Development Tools', type: 'tool' },
    { name: 'AWS', category: 'Cloud Platforms', type: 'tool' },
    { name: 'Google Cloud', category: 'Cloud Platforms', type: 'tool' },
    { name: 'Figma', category: 'Design Tools', type: 'tool' },
    { name: 'Adobe Photoshop', category: 'Design Tools', type: 'tool' },
    { name: 'Adobe Illustrator', category: 'Design Tools', type: 'tool' },
    
    // Languages
    { name: 'English', category: 'Languages', type: 'language' },
    { name: 'Spanish', category: 'Languages', type: 'language' },
    { name: 'French', category: 'Languages', type: 'language' },
    { name: 'German', category: 'Languages', type: 'language' },
    { name: 'Urdu', category: 'Languages', type: 'language' },
    { name: 'Hindi', category: 'Languages', type: 'language' }
  ];

  console.log('Creating skills...');
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill
    });
  }

  // Create specialties for Web Development category
  const webDevCategory = await prisma.category.findUnique({
    where: { slug: 'web-development' }
  });

  if (webDevCategory) {
    const specialties = [
      { name: 'Full Stack Development', category_id: webDevCategory.id },
      { name: 'Frontend Development', category_id: webDevCategory.id },
      { name: 'Backend Development', category_id: webDevCategory.id },
      { name: 'E-commerce Development', category_id: webDevCategory.id },
      { name: 'API Development', category_id: webDevCategory.id },
      { name: 'Database Design', category_id: webDevCategory.id }
    ];

    console.log('Creating specialties...');
    for (const specialty of specialties) {
      await prisma.specialty.upsert({
        where: { 
          name_category_id: { 
            name: specialty.name, 
            category_id: specialty.category_id 
          } 
        },
        update: {},
        create: specialty
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });