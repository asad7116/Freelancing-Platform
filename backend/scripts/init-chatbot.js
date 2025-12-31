/**
 * Chatbot Content Initialization Script
 * Run this script to process and index the platform content for the chatbot
 * 
 * Usage: node scripts/init-chatbot.js
 */

import "dotenv/config";
import { connectToDatabase, closeDatabase } from "../src/db/mongodb.js";
import { processExistingPlatformContent, getProcessingStats } from "../src/services/content-processor.service.js";

async function main() {
    console.log("🤖 Chatbot Content Initialization");
    console.log("=".repeat(50));

    try {
        // Connect to database
        console.log("\n📦 Connecting to MongoDB...");
        await connectToDatabase();
        console.log("✅ Connected successfully!");

        // Process platform content
        console.log("\n📄 Processing platform content...");
        console.log("   This includes gigs, jobs, categories, and FAQ content.");

        const result = await processExistingPlatformContent();

        console.log(`\n✅ Processing complete!`);
        console.log(`   Documents processed: ${result.processed}`);
        console.log(`   Chunks created: ${result.chunks}`);

        // Get statistics
        console.log("\n📊 Content Statistics:");
        const stats = await getProcessingStats();
        console.log(`   Total chunks indexed: ${stats.totalChunks}`);
        console.log(`   Average chunk length: ${Math.round(stats.averageDocLength)} tokens`);
        console.log(`   Unique terms: ${stats.uniqueTerms}`);
        console.log(`   Content by type:`, stats.byType);

        console.log("\n🎉 Chatbot is ready to answer questions!");
        console.log("   Start the backend server and test the chatbot.");

    } catch (error) {
        console.error("\n❌ Error during initialization:", error.message);
        process.exit(1);
    } finally {
        await closeDatabase();
        console.log("\n👋 Database connection closed.");
        process.exit(0);
    }
}

main();
