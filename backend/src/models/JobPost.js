import { ObjectId } from "mongodb"

export class JobPostModel {
  static async create(db, jobData) {
    const jobPosts = db.collection("jobPosts")
    const result = await jobPosts.insertOne({
      _id: new ObjectId(),
      title: jobData.title,
      slug: jobData.slug,
      summary: jobData.summary || null,
      description: jobData.description,
      deliverables: jobData.deliverables || null,
      category_id: jobData.category_id,
      specialty: jobData.specialty || null,
      city_id: jobData.city_id || null,

      budget_type: jobData.budget_type || "hourly",
      hourly_rate_from: jobData.hourly_rate_from ? Number.parseFloat(jobData.hourly_rate_from) : null,
      hourly_rate_to: jobData.hourly_rate_to ? Number.parseFloat(jobData.hourly_rate_to) : null,
      fixed_price: jobData.fixed_price ? Number.parseFloat(jobData.fixed_price) : null,

      project_type: jobData.project_type || "one-time",
      duration: jobData.duration || null,
      hours_per_week: jobData.hours_per_week || null,
      job_size: jobData.job_size || null,
      freelancers_needed: jobData.freelancers_needed || 1,

      experience_level: jobData.experience_level || "intermediate",
      mandatory_skills: jobData.mandatory_skills || [],
      nice_to_have_skills: jobData.nice_to_have_skills || [],
      tools: jobData.tools || [],
      languages: jobData.languages || [],

      regular_price: jobData.regular_price ? Number.parseFloat(jobData.regular_price) : null,
      job_type: jobData.job_type || "Hourly",
      thumb_image: jobData.thumb_image || null,

      buyer_id: jobData.buyer_id,
      status: jobData.status || "active",
      approved_by_admin: jobData.approved_by_admin || "pending",
      featured: jobData.featured || false,

      created_at: new Date(),
      updated_at: new Date(),
    })

    return result.insertedId.toString()
  }

  static async findById(db, id) {
    const jobPosts = db.collection("jobPosts")
    try {
      const job = await jobPosts.findOne({ _id: new ObjectId(id) })
      if (job) {
        job.id = job._id.toString()
      }
      return job
    } catch {
      return null
    }
  }

  static async findByIdWithRelations(db, id) {
    const jobPosts = db.collection("jobPosts")
    const categories = db.collection("categories")
    const cities = db.collection("cities")
    const users = db.collection("users")
    const jobApplications = db.collection("jobApplications")

    try {
      const job = await jobPosts.findOne({ _id: new ObjectId(id) })
      if (!job) return null

      const category = await categories.findOne({ _id: new ObjectId(job.category_id) })
      const city = job.city_id ? await cities.findOne({ _id: new ObjectId(job.city_id) }) : null
      const buyer = await users.findOne({ _id: new ObjectId(job.buyer_id) })

      const applications = await jobApplications.find({ job_post_id: id }).toArray()

      const appCount = await jobApplications.countDocuments({ job_post_id: id })

      return {
        ...job,
        id: job._id.toString(),
        category: category ? { id: category._id.toString(), name: category.name } : null,
        city: city ? { id: city._id.toString(), name: city.name } : null,
        buyer: buyer
          ? {
            id: buyer._id.toString(),
            name: buyer.name,
            email: buyer.email,
            avatar: buyer.avatar,
            createdAt: buyer.createdAt,
          }
          : null,
        applications: applications.map((app) => ({
          ...app,
          id: app._id.toString(),
          freelancer: { id: app.freelancer_id, name: app.freelancer_name },
        })),
        _count: { applications: appCount },
      }
    } catch {
      return null
    }
  }

  static async findMany(db, query = {}, skip = 0, limit = 10) {
    const jobPosts = db.collection("jobPosts")
    return await jobPosts.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray()
  }

  static async count(db, query = {}) {
    const jobPosts = db.collection("jobPosts")
    return await jobPosts.countDocuments(query)
  }

  static async update(db, id, updateData) {
    const jobPosts = db.collection("jobPosts")
    try {
      const result = await jobPosts.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updated_at: new Date() } },
        { returnDocument: "after" },
      )
      return result.value
    } catch {
      return null
    }
  }

  static async delete(db, id) {
    const jobPosts = db.collection("jobPosts")
    try {
      const result = await jobPosts.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch {
      return false
    }
  }

  static async updateJobStatus(db, id, status) {
    const jobPosts = db.collection("jobPosts")
    try {
      const result = await jobPosts.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, updated_at: new Date() } },
        { returnDocument: "after" }
      )
      return result.value
    } catch {
      return null
    }
  }
}

export default JobPostModel
