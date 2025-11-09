import { ObjectId } from "mongodb"

export class CityModel {
  static async findMany(db) {
    const cities = db.collection("cities")
    return await cities.find({}).toArray()
  }

  static async findById(db, id) {
    const cities = db.collection("cities")
    try {
      return await cities.findOne({ _id: new ObjectId(id) })
    } catch {
      return null
    }
  }

  static async upsert(db, name, country, cityData) {
    const cities = db.collection("cities")
    return await cities.updateOne(
      { name, country },
      { $set: { ...cityData, updated_at: new Date() } },
      { upsert: true },
    )
  }
}

export default CityModel
