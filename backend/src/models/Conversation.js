import { ObjectId } from "mongodb"

export class ConversationModel {
  /**
   * Create a new conversation between two users
   */
  static async create(db, data) {
    const conversations = db.collection("conversations")

    const doc = {
      _id: new ObjectId(),
      participants: data.participants, // [userId1, userId2]
      job_id: data.jobId || null,
      job_title: data.jobTitle || null,
      proposal_id: data.proposalId || null,
      last_message: null,
      last_message_at: new Date(),
      created_at: new Date(),
    }

    await conversations.insertOne(doc)
    return doc
  }

  /**
   * Find an existing conversation between two users for a specific job
   */
  static async findByParticipantsAndJob(db, userId1, userId2, jobId) {
    const conversations = db.collection("conversations")
    return await conversations.findOne({
      participants: { $all: [userId1, userId2] },
      job_id: jobId,
    })
  }

  /**
   * Find an existing conversation between two users (any job)
   */
  static async findByParticipants(db, userId1, userId2) {
    const conversations = db.collection("conversations")
    return await conversations.findOne({
      participants: { $all: [userId1, userId2] },
    })
  }

  /**
   * Get all conversations for a user (newest activity first)
   */
  static async findByUser(db, userId) {
    const conversations = db.collection("conversations")
    return await conversations
      .find({ participants: userId })
      .sort({ last_message_at: -1 })
      .toArray()
  }

  /**
   * Find conversation by id
   */
  static async findById(db, id) {
    const conversations = db.collection("conversations")
    try {
      return await conversations.findOne({ _id: new ObjectId(id) })
    } catch {
      return null
    }
  }

  /**
   * Update the last message preview
   */
  static async updateLastMessage(db, conversationId, text) {
    const conversations = db.collection("conversations")
    await conversations.updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { last_message: text, last_message_at: new Date() } }
    )
  }
}

export class MessageModel {
  /**
   * Create a new message
   */
  static async create(db, data) {
    const messages = db.collection("messages")

    const doc = {
      _id: new ObjectId(),
      conversation_id: data.conversationId,
      sender_id: data.senderId,
      text: data.text,
      created_at: new Date(),
    }

    await messages.insertOne(doc)
    return doc
  }

  /**
   * Get messages for a conversation (oldest first for chat display)
   */
  static async findByConversation(db, conversationId, { skip = 0, limit = 50 } = {}) {
    const messages = db.collection("messages")
    return await messages
      .find({ conversation_id: conversationId })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  /**
   * Count unread messages for a user across all conversations
   */
  static async countUnread(db, userId, conversationIds) {
    if (!conversationIds || conversationIds.length === 0) return 0
    const messages = db.collection("messages")
    return await messages.countDocuments({
      conversation_id: { $in: conversationIds },
      sender_id: { $ne: userId },
      read: { $ne: true },
    })
  }
}

export default { ConversationModel, MessageModel }
