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
      where: { 
        name_country: {
          name: city.name,
          country: city.country
        }
      },
      update: {},
      create: city
    });
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