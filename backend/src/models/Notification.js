import { ObjectId } from "mongodb"

export class NotificationModel {
  /**
   * Create a new notification
   * @param {object} db - MongoDB database instance
   * @param {object} data - { userId, type, title, message, link }
   */
  static async create(db, data) {
    const notifications = db.collection("notifications")
    const doc = {
      _id: new ObjectId(),
      user_id: data.userId,
      type: data.type, // proposal_received, proposal_accepted, proposal_rejected, work_submitted, work_reviewed
      title: data.title,
      message: data.message,
      link: data.link || null,
      is_read: false,
      created_at: new Date(),
    }
    await notifications.insertOne(doc)
    return doc
  }

  /**
   * Get notifications for a user (newest first)
   */
  static async findByUser(db, userId, { skip = 0, limit = 20 } = {}) {
    const notifications = db.collection("notifications")
    return await notifications
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  /**
   * Count unread notifications for a user
   */
  static async countUnread(db, userId) {
    const notifications = db.collection("notifications")
    return await notifications.countDocuments({ user_id: userId, is_read: false })
  }

  /**
   * Mark a single notification as read
   */
  static async markRead(db, notificationId, userId) {
    const notifications = db.collection("notifications")
    const result = await notifications.updateOne(
      { _id: new ObjectId(notificationId), user_id: userId },
      { $set: { is_read: true } }
    )
    return result.modifiedCount > 0
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllRead(db, userId) {
    const notifications = db.collection("notifications")
    const result = await notifications.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } }
    )
    return result.modifiedCount
  }
}

export default NotificationModel
