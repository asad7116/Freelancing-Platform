import { getDatabase } from "./mongodb.js"
import "dotenv/config";

export async function initializeCollections() {
  const db = await getDatabase()

  try {
    // Create indexes for better performance
    const collections = {
      users: db.collection("users"),
      jobPosts: db.collection("jobPosts"),
      jobApplications: db.collection("jobApplications"),
      freelancerProfiles: db.collection("freelancerProfiles"),
      clientProfiles: db.collection("clientProfiles"),
      categories: db.collection("categories"),
      cities: db.collection("cities"),
      skills: db.collection("skills"),
      gigs: db.collection("gigs"),
      specialties: db.collection("specialties"),
    }

    // Users indexes
    await collections.users.createIndex({ email: 1 }, { unique: true })

    // JobPost indexes
    await collections.jobPosts.createIndex({ buyer_id: 1 })
    await collections.jobPosts.createIndex({ category_id: 1 })
    await collections.jobPosts.createIndex({ status: 1 })
    await collections.jobPosts.createIndex({ slug: 1 }, { unique: true })

    // JobApplication indexes
    await collections.jobApplications.createIndex({ job_post_id: 1 })
    await collections.jobApplications.createIndex({ freelancer_id: 1 })
    await collections.jobApplications.createIndex({ client_id: 1 })
    await collections.jobApplications.createIndex({ status: 1 })
    await collections.jobApplications.createIndex({ job_post_id: 1, freelancer_id: 1 }, { unique: true })

    // Profile indexes
    await collections.freelancerProfiles.createIndex({ user_id: 1 }, { unique: true })
    await collections.clientProfiles.createIndex({ user_id: 1 }, { unique: true })

    // Gig indexes
    await collections.gigs.createIndex({ createdBy: 1 })
    await collections.gigs.createIndex({ category: 1 })

    // Specialty indexes
    await collections.specialties.createIndex({ category_id: 1 })

    console.log("[MongoDB] Collections initialized with indexes")
  } catch (error) {
    console.error("[MongoDB] Error initializing collections:", error)
  }
}
