import "dotenv/config"
import { connectToDatabase, getDatabase } from "../src/db/mongodb.js"

async function deleteUser() {
  try {
    await connectToDatabase()
    const db = await getDatabase()
    const users = db.collection("users")

    const email = "mahiraamjad53@gmail.com"
    console.log(`🔍 Searching for user with email: ${email}`)

    const user = await users.findOne({ email })
    if (!user) {
      console.log(`❌ User not found with email: ${email}`)
      return
    }

    console.log(`✅ Found user:`, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const result = await users.deleteOne({ email })
    
    if (result.deletedCount === 1) {
      console.log(`✅ User deleted successfully!`)
    } else {
      console.log(`❌ Failed to delete user`)
    }

    process.exit(0)
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

deleteUser()
