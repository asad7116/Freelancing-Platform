import { ObjectId } from "mongodb"

export class JobApplicationModel {
  static async create(db, appData) {
    const jobApplications = db.collection("jobApplications")
    const result = await jobApplications.insertOne({
      _id: new ObjectId(),
      job_post_id: appData.job_post_id,
      freelancer_id: appData.freelancer_id,
      freelancer_name: appData.freelancer_name,
      cover_letter: appData.cover_letter,
      proposed_price: Number.parseFloat(appData.proposed_price),
      delivery_time: appData.delivery_time,
      status: appData.status || "pending",
      created_at: new Date(),
      updated_at: new Date(),
    })

    return result.insertedId.toString()
  }

  static async findMany(db, query = {}, skip = 0, limit = 10) {
    const jobApplications = db.collection("jobApplications")
    return await jobApplications.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray()
  }

  static async count(db, query = {}) {
    const jobApplications = db.collection("jobApplications")
    return await jobApplications.countDocuments(query)
  }
}

export default JobApplicationModel
