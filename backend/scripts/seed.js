import { connectToDatabase, getDatabase } from "../src/db/mongodb.js"

async function seed() {
  try {
    await connectToDatabase()
    const db = await getDatabase()

    const categories = db.collection("categories")
    const cities = db.collection("cities")
    const skills = db.collection("skills")
    const specialties = db.collection("specialties")

    console.log("[Seed] Starting database seeding...")

    // Seed categories
    const categoryData = [
      { name: "Web Development", slug: "web-development", description: "Web design and development" },
      { name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development" },
      { name: "UI/UX Design", slug: "ui-ux-design", description: "User interface and experience design" },
      { name: "Graphic Design", slug: "graphic-design", description: "Graphic design services" },
    ]

    for (const cat of categoryData) {
      await categories.updateOne(
        { slug: cat.slug },
        { $set: { ...cat, status: "active", created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      )
    }

    // Seed cities
    const cityData = [
      { name: "New York", country: "USA" },
      { name: "Los Angeles", country: "USA" },
      { name: "London", country: "UK" },
      { name: "Toronto", country: "Canada" },
    ]

    for (const city of cityData) {
      await cities.updateOne(
        { name: city.name, country: city.country },
        { $set: { ...city, status: "active", created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      )
    }

    // Seed skills
    const skillData = [
      { name: "JavaScript", category: "Programming", type: "skill", status: "active" },
      { name: "React", category: "Frontend", type: "skill", status: "active" },
      { name: "Node.js", category: "Backend", type: "skill", status: "active" },
      { name: "MongoDB", category: "Database", type: "skill", status: "active" },
      { name: "UI Design", category: "Design", type: "skill", status: "active" },
    ]

    for (const skill of skillData) {
      await skills.updateOne(
        { name: skill.name },
        { $set: { ...skill, created_at: new Date(), updated_at: new Date() } },
        { upsert: true },
      )
    }

    console.log("[Seed] Database seeded successfully!")
  } catch (error) {
    console.error("[Seed] Error seeding database:", error)
    process.exit(1)
  }
}

seed()
