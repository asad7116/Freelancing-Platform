import { connectToDatabase, getDatabase } from "../src/db/mongodb.js"

async function seed() {
  try {
    await connectToDatabase()
    const db = await getDatabase()

    const categories = db.collection("categories")
    const cities = db.collection("cities")
    const skills = db.collection("skills")

    console.log("[Seed] Starting database seeding...")

    // ─── Categories ──────────────────────────────────────────────────────
    // Specialties are NOT seeded — they are generated dynamically by AI
    // based on the job title at runtime.
    const categoryData = [
      { name: "Web Development", slug: "web-development", description: "Frontend and backend web development services" },
      { name: "Mobile App Development", slug: "mobile-app-development", description: "iOS and Android app development" },
      { name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and user experience design" },
      { name: "Graphic Design", slug: "graphic-design", description: "Logo design, branding, and visual content" },
      { name: "Digital Marketing", slug: "digital-marketing", description: "SEO, social media marketing, and content marketing" },
      { name: "Content Writing", slug: "content-writing", description: "Blog posts, articles, and copywriting" },
      { name: "Data Science & Analytics", slug: "data-science-analytics", description: "Data science, analytics, and machine learning services" },
      { name: "Video & Animation", slug: "video-animation", description: "Video production, editing, and animation services" },
      { name: "Audio & Music", slug: "audio-music", description: "Audio production, voice-over, and music services" },
      { name: "Translation & Languages", slug: "translation-languages", description: "Translation, localization, and interpretation services" },
      { name: "Virtual Assistant", slug: "virtual-assistant", description: "Administrative support and virtual assistant services" },
      { name: "Accounting & Finance", slug: "accounting-finance", description: "Accounting, bookkeeping, and financial services" },
      { name: "Legal Services", slug: "legal-services", description: "Legal consulting, contracts, and compliance services" },
      { name: "Engineering & Architecture", slug: "engineering-architecture", description: "CAD, structural, and architectural design services" },
      { name: "Sales & Business Development", slug: "sales-business-development", description: "Lead generation, CRM, and sales strategy services" },
      { name: "Photography", slug: "photography", description: "Photography, editing, and retouching services" },
      { name: "Game Development", slug: "game-development", description: "Game design, development, and testing services" },
      { name: "Cybersecurity", slug: "cybersecurity", description: "Security auditing, penetration testing, and compliance" },
      { name: "Cloud & DevOps", slug: "cloud-devops", description: "Cloud infrastructure, CI/CD, and DevOps services" },
      { name: "AI & Machine Learning", slug: "ai-machine-learning", description: "Artificial intelligence and machine learning solutions" },
      { name: "Blockchain & Web3", slug: "blockchain-web3", description: "Blockchain, smart contracts, and decentralized app development" },
      { name: "E-commerce", slug: "ecommerce", description: "Online store setup, optimization, and management" },
      { name: "Project Management", slug: "project-management", description: "Project planning, Agile coaching, and team coordination" },
      { name: "Human Resources", slug: "human-resources", description: "Recruitment, HR consulting, and training services" },
      { name: "Customer Service", slug: "customer-service", description: "Customer support, help desk, and community management" },
    ]

    // Insert categories (no specialties)
    for (const cat of categoryData) {
      await categories.updateOne(
        { slug: cat.slug },
        {
          $set: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        { upsert: true },
      )
    }

    console.log(`[Seed] ${categoryData.length} categories seeded.`)

    // ─── Cities ──────────────────────────────────────────────────────────
    const cityData = [
      { name: "New York", country: "USA" },
      { name: "Los Angeles", country: "USA" },
      { name: "Chicago", country: "USA" },
      { name: "San Francisco", country: "USA" },
      { name: "London", country: "UK" },
      { name: "Manchester", country: "UK" },
      { name: "Toronto", country: "Canada" },
      { name: "Vancouver", country: "Canada" },
      { name: "Berlin", country: "Germany" },
      { name: "Sydney", country: "Australia" },
      { name: "Dubai", country: "UAE" },
      { name: "Singapore", country: "Singapore" },
      { name: "Karachi", country: "Pakistan" },
      { name: "Lahore", country: "Pakistan" },
      { name: "Islamabad", country: "Pakistan" },
      { name: "Mumbai", country: "India" },
      { name: "Bangalore", country: "India" },
      { name: "Remote", country: "Worldwide" },
    ]

    for (const city of cityData) {
      await cities.updateOne(
        { name: city.name, country: city.country },
        { $set: { ...city, status: "active", created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      )
    }

    console.log(`[Seed] ${cityData.length} cities seeded.`)

    // ─── Skills ──────────────────────────────────────────────────────────
    const skillData = [
      // Programming
      { name: "JavaScript", category: "Programming", type: "skill" },
      { name: "TypeScript", category: "Programming", type: "skill" },
      { name: "Python", category: "Programming", type: "skill" },
      { name: "Java", category: "Programming", type: "skill" },
      { name: "C#", category: "Programming", type: "skill" },
      { name: "C++", category: "Programming", type: "skill" },
      { name: "PHP", category: "Programming", type: "skill" },
      { name: "Ruby", category: "Programming", type: "skill" },
      { name: "Go", category: "Programming", type: "skill" },
      { name: "Rust", category: "Programming", type: "skill" },
      { name: "Swift", category: "Programming", type: "skill" },
      { name: "Kotlin", category: "Programming", type: "skill" },
      // Frontend
      { name: "React", category: "Frontend", type: "skill" },
      { name: "Angular", category: "Frontend", type: "skill" },
      { name: "Vue.js", category: "Frontend", type: "skill" },
      { name: "Next.js", category: "Frontend", type: "skill" },
      { name: "Tailwind CSS", category: "Frontend", type: "skill" },
      { name: "HTML/CSS", category: "Frontend", type: "skill" },
      { name: "SASS/SCSS", category: "Frontend", type: "skill" },
      // Backend
      { name: "Node.js", category: "Backend", type: "skill" },
      { name: "Express.js", category: "Backend", type: "skill" },
      { name: "Django", category: "Backend", type: "skill" },
      { name: "Flask", category: "Backend", type: "skill" },
      { name: "Spring Boot", category: "Backend", type: "skill" },
      { name: "ASP.NET", category: "Backend", type: "skill" },
      { name: "Laravel", category: "Backend", type: "skill" },
      { name: "Ruby on Rails", category: "Backend", type: "skill" },
      { name: "FastAPI", category: "Backend", type: "skill" },
      { name: "GraphQL", category: "Backend", type: "skill" },
      { name: "REST APIs", category: "Backend", type: "skill" },
      // Database
      { name: "MongoDB", category: "Database", type: "skill" },
      { name: "PostgreSQL", category: "Database", type: "skill" },
      { name: "MySQL", category: "Database", type: "skill" },
      { name: "Redis", category: "Database", type: "skill" },
      { name: "Firebase", category: "Database", type: "skill" },
      { name: "Supabase", category: "Database", type: "skill" },
      // Cloud & DevOps
      { name: "AWS", category: "Cloud & DevOps", type: "skill" },
      { name: "Azure", category: "Cloud & DevOps", type: "skill" },
      { name: "Google Cloud", category: "Cloud & DevOps", type: "skill" },
      { name: "Docker", category: "Cloud & DevOps", type: "skill" },
      { name: "Kubernetes", category: "Cloud & DevOps", type: "skill" },
      { name: "CI/CD", category: "Cloud & DevOps", type: "skill" },
      { name: "Terraform", category: "Cloud & DevOps", type: "skill" },
      // Design
      { name: "Figma", category: "Design", type: "skill" },
      { name: "Adobe Photoshop", category: "Design", type: "skill" },
      { name: "Adobe Illustrator", category: "Design", type: "skill" },
      { name: "Adobe XD", category: "Design", type: "skill" },
      { name: "Sketch", category: "Design", type: "skill" },
      { name: "Canva", category: "Design", type: "skill" },
      { name: "After Effects", category: "Design", type: "skill" },
      { name: "Premiere Pro", category: "Design", type: "skill" },
      { name: "Blender", category: "Design", type: "skill" },
      // Marketing
      { name: "Google Ads", category: "Marketing", type: "skill" },
      { name: "Facebook Ads", category: "Marketing", type: "skill" },
      { name: "SEO", category: "Marketing", type: "skill" },
      { name: "Google Analytics", category: "Marketing", type: "skill" },
      { name: "HubSpot", category: "Marketing", type: "skill" },
      { name: "Mailchimp", category: "Marketing", type: "skill" },
      // AI & Data
      { name: "TensorFlow", category: "AI & Data", type: "skill" },
      { name: "PyTorch", category: "AI & Data", type: "skill" },
      { name: "OpenAI API", category: "AI & Data", type: "skill" },
      { name: "LangChain", category: "AI & Data", type: "skill" },
      { name: "Pandas", category: "AI & Data", type: "skill" },
      { name: "Power BI", category: "AI & Data", type: "skill" },
      { name: "Tableau", category: "AI & Data", type: "skill" },
      // Mobile
      { name: "React Native", category: "Mobile", type: "skill" },
      { name: "Flutter", category: "Mobile", type: "skill" },
      { name: "SwiftUI", category: "Mobile", type: "skill" },
      { name: "Jetpack Compose", category: "Mobile", type: "skill" },
      // Other Tools
      { name: "Git", category: "Tools", type: "skill" },
      { name: "JIRA", category: "Tools", type: "skill" },
      { name: "Slack", category: "Tools", type: "skill" },
      { name: "Notion", category: "Tools", type: "skill" },
      { name: "WordPress", category: "Tools", type: "skill" },
      { name: "Shopify", category: "Tools", type: "skill" },
      { name: "Webflow", category: "Tools", type: "skill" },
    ]

    for (const skill of skillData) {
      await skills.updateOne(
        { name: skill.name },
        { $set: { ...skill, status: "active", created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      )
    }

    console.log(`[Seed] ${skillData.length} skills seeded.`)

    console.log("[Seed] ✅ Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[Seed] Error seeding database:", error)
    process.exit(1)
  }
}

seed()
