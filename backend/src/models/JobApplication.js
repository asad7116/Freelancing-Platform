import { ObjectId } from "mongodb"

export class JobApplicationModel {
  static async create(db, appData) {
    const jobApplications = db.collection("jobApplications")
    const result = await jobApplications.insertOne({
      _id: new ObjectId(),
      job_post_id: appData.job_post_id,
      client_id: appData.client_id,
      freelancer_id: appData.freelancer_id,
      freelancer_name: appData.freelancer_name,
      cover_letter: appData.cover_letter,
      proposed_price: Number.parseFloat(appData.proposed_price),
      delivery_time: appData.delivery_time,
      attachments: appData.attachments || [],
      milestones: appData.milestones || [],
      status: appData.status || "pending", // pending, approved, rejected, withdrawn
      created_at: new Date(),
      updated_at: new Date(),
    })

    return result.insertedId.toString()
  }

  static async findById(db, id) {
    const jobApplications = db.collection("jobApplications")
    try {
      return await jobApplications.findOne({ _id: new ObjectId(id) })
    } catch {
      return null
    }
  }

  static async findMany(db, query = {}, skip = 0, limit = 10) {
    const jobApplications = db.collection("jobApplications")
    return await jobApplications.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray()
  }

  static async count(db, query = {}) {
    const jobApplications = db.collection("jobApplications")
    return await jobApplications.countDocuments(query)
  }

  static async updateStatus(db, id, status) {
    const jobApplications = db.collection("jobApplications")
    const result = await jobApplications.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updated_at: new Date() } },
      { returnDocument: "after" }
    )
    return result.value
  }

  static async findByJobAndFreelancer(db, jobPostId, freelancerId) {
    const jobApplications = db.collection("jobApplications")
    return await jobApplications.findOne({
      job_post_id: jobPostId,
      freelancer_id: freelancerId,
    })
  }
}

export default JobApplicationModel
