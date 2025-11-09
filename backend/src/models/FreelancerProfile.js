import { ObjectId } from "mongodb"

export class FreelancerProfileModel {
  static async create(db, userId, profileData) {
    const profiles = db.collection("freelancerProfiles")
    const result = await profiles.insertOne({
      _id: new ObjectId(),
      user_id: userId,
      ...profileData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    return result.insertedId.toString()
  }

  static async findByUserId(db, userId) {
    const profiles = db.collection("freelancerProfiles")
    return await profiles.findOne({ user_id: userId })
  }

  static async update(db, userId, updateData) {
    const profiles = db.collection("freelancerProfiles")
    return await profiles.findOneAndUpdate(
      { user_id: userId },
      { $set: { ...updateData, updated_at: new Date() } },
      { returnDocument: "after" },
    )
  }

  static async upsert(db, userId, profileData) {
    const profiles = db.collection("freelancerProfiles")
    return await profiles.updateOne(
      { user_id: userId },
      { $set: { ...profileData, updated_at: new Date() } },
      { upsert: true },
    )
  }
}

export const FreelancerProfile = FreelancerProfileModel

export default FreelancerProfileModel
