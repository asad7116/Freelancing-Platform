import { ObjectId } from "mongodb"

export class UserModel {
  static async create(db, userData) {
    const users = db.collection("users")
    const result = await users.insertOne({
      _id: new ObjectId(),
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role || "client",
      avatar: userData.avatar || null,
      city_id: userData.city_id || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      id: result.insertedId.toString(),
      ...userData,
    }
  }

  static async findByEmail(db, email) {
    const users = db.collection("users")
    return await users.findOne({ email })
  }

  static async findById(db, id) {
    const users = db.collection("users")
    try {
      return await users.findOne({ _id: new ObjectId(id) })
    } catch {
      return null
    }
  }

  static async findByIdForSelect(db, id, fields) {
    const users = db.collection("users")
    try {
      return await users.findOne({ _id: new ObjectId(id) }, { projection: this.buildProjection(fields) })
    } catch {
      return null
    }
  }

  static buildProjection(fields) {
    const projection = {}
    fields.forEach((field) => {
      projection[field] = 1
    })
    return projection
  }
}

export const User = UserModel

export default UserModel
