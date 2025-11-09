import { ObjectId } from "mongodb"

export class CategoryModel {
  static async findMany(db) {
    const categories = db.collection("categories")
    return await categories.find({}).toArray()
  }

  static async findById(db, id) {
    const categories = db.collection("categories")
    try {
      return await categories.findOne({ _id: new ObjectId(id) })
    } catch {
      return null
    }
  }

  static async upsert(db, name, categoryData) {
    const categories = db.collection("categories")
    return await categories.updateOne(
      { slug: name },
      { $set: { ...categoryData, updated_at: new Date() } },
      { upsert: true },
    )
  }
}

export default CategoryModel
