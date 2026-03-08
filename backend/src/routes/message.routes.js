import express from "express"
import { ObjectId } from "mongodb"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { getDatabase } from "../db/mongodb.js"
import { ConversationModel, MessageModel } from "../models/Conversation.js"

const router = express.Router()

// All message routes require authentication
router.use(authMiddleware)

// ─── GET /api/messages/conversations — list all conversations for current user ─
router.get("/conversations", async (req, res) => {
  try {
    const db = await getDatabase()
    const userId = req.user.id

    const conversations = await ConversationModel.findByUser(db, userId)

    // Enrich each conversation with the other participant's info
    const users = db.collection("users")
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.participants.find((p) => p !== userId)
        let otherUser = null

        if (otherId) {
          try {
            otherUser = await users.findOne(
              { _id: new ObjectId(otherId) },
              { projection: { name: 1, avatar: 1 } }
            )
          } catch {
            // ignore
          }
        }

        return {
          _id: conv._id.toString(),
          otherUser: otherUser
            ? {
                id: otherUser._id.toString(),
                name: otherUser.name,
                avatar: otherUser.avatar,
              }
            : { id: otherId, name: "Unknown User", avatar: null },
          job_title: conv.job_title,
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          created_at: conv.created_at,
        }
      })
    )

    res.json({ success: true, conversations: enriched })
  } catch (err) {
    console.error("[Messages] list conversations error:", err)
    res.status(500).json({ success: false, message: "Failed to fetch conversations." })
  }
})

// ─── POST /api/messages/conversations — create or find an existing conversation ───
router.post("/conversations", async (req, res) => {
  try {
    const db = await getDatabase()
    const userId = req.user.id
    const { recipientId, gigId, gigTitle } = req.body

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "recipientId is required." })
    }

    if (recipientId === userId) {
      return res.status(400).json({ success: false, message: "You cannot start a conversation with yourself." })
    }

    // Check if a conversation already exists between these two users for this gig
    let conversation = null
    if (gigId) {
      const conversations = db.collection("conversations")
      conversation = await conversations.findOne({
        participants: { $all: [userId, recipientId] },
        gig_id: gigId,
      })
    }

    // If no gig-specific conversation, check for any existing conversation between the two users
    if (!conversation) {
      conversation = await ConversationModel.findByParticipants(db, userId, recipientId)
    }

    // If still no conversation, create one
    if (!conversation) {
      conversation = await ConversationModel.create(db, {
        participants: [userId, recipientId],
        jobId: null,
        jobTitle: gigTitle || null,
      })

      // Store gig_id directly if provided
      if (gigId) {
        await db.collection("conversations").updateOne(
          { _id: conversation._id },
          { $set: { gig_id: gigId } }
        )
      }
    }

    res.status(200).json({
      success: true,
      conversationId: conversation._id.toString(),
    })
  } catch (err) {
    console.error("[Messages] create/find conversation error:", err)
    res.status(500).json({ success: false, message: "Failed to create conversation." })
  }
})

// ─── GET /api/messages/conversations/:id/messages — get messages in a conversation ─
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const db = await getDatabase()
    const userId = req.user.id
    const convId = req.params.id

    // Verify user is a participant
    const conversation = await ConversationModel.findById(db, convId)
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied." })
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 50)
    const skip = (page - 1) * limit

    const messages = await MessageModel.findByConversation(db, convId, { skip, limit })

    // Format for frontend
    const formatted = messages.map((m) => ({
      _id: m._id.toString(),
      sender_id: m.sender_id,
      text: m.text,
      encrypted: m.encrypted || null,
      from: m.sender_id === userId ? "me" : "them",
      created_at: m.created_at,
    }))

    res.json({ success: true, messages: formatted })
  } catch (err) {
    console.error("[Messages] get messages error:", err)
    res.status(500).json({ success: false, message: "Failed to fetch messages." })
  }
})

// ─── POST /api/messages/conversations/:id/messages — send a message ─────────
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const db = await getDatabase()
    const userId = req.user.id
    const convId = req.params.id
    const { text, encrypted } = req.body

    // Must have either plaintext or encrypted payload
    if ((!text || !text.trim()) && !encrypted) {
      return res.status(400).json({ success: false, message: "Message text or encrypted payload is required." })
    }

    // Verify user is a participant
    const conversation = await ConversationModel.findById(db, convId)
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied." })
    }

    // Create the message
    const messageData = {
      conversationId: convId,
      senderId: userId,
    }

    if (encrypted && encrypted.ciphertext && encrypted.iv && encrypted.encryptedKeys) {
      // E2E encrypted message — store only encrypted fields, no plaintext
      messageData.text = null
      messageData.encrypted = {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        encryptedKeys: encrypted.encryptedKeys,
      }
    } else {
      // Legacy plaintext message
      messageData.text = text.trim()
    }

    const message = await MessageModel.create(db, messageData)

    // Update conversation's last message (show "[Encrypted]" for E2E messages)
    const previewText = messageData.encrypted ? "🔒 Encrypted message" : messageData.text
    await ConversationModel.updateLastMessage(db, convId, previewText)

    res.status(201).json({
      success: true,
      message: {
        _id: message._id.toString(),
        sender_id: message.sender_id,
        text: message.text,
        encrypted: message.encrypted || null,
        from: "me",
        created_at: message.created_at,
      },
    })
  } catch (err) {
    console.error("[Messages] send message error:", err)
    res.status(500).json({ success: false, message: "Failed to send message." })
  }
})

export default router
