export class SkillModel {
  static async findMany(db) {
    const skills = db.collection("skills")
    return await skills.find({}).toArray()
  }

  static async upsert(db, name, skillData) {
    const skills = db.collection("skills")
    return await skills.updateOne({ name }, { $set: { ...skillData, updated_at: new Date() } }, { upsert: true })
  }
}

export default SkillModel
