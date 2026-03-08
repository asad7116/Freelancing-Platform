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

  /**
   * Store (or update) a user's E2E encryption public key (JWK format)
   */
  static async setPublicKey(db, userId, publicKeyJwk) {
    const users = db.collection("users")
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { publicKey: publicKeyJwk, publicKeyUpdatedAt: new Date() } }
    )
  }

  /**
   * Retrieve a user's E2E encryption public key
   */
  static async getPublicKey(db, userId) {
    const users = db.collection("users")
    try {
      const user = await users.findOne(
        { _id: new ObjectId(userId) },
        { projection: { publicKey: 1 } }
      )
      return user?.publicKey || null
    } catch {
      return null
    }
  }

  /**
   * Retrieve public keys for multiple users at once
   */
  static async getPublicKeys(db, userIds) {
    const users = db.collection("users")
    const objectIds = userIds.map((id) => {
      try { return new ObjectId(id) } catch { return null }
    }).filter(Boolean)

    const docs = await users
      .find({ _id: { $in: objectIds }, publicKey: { $ne: null } })
      .project({ publicKey: 1 })
      .toArray()

    const map = {}
    docs.forEach((doc) => {
      map[doc._id.toString()] = doc.publicKey
    })
    return map
  }
}

export const User = UserModel

export default UserModel
