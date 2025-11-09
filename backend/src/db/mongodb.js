import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;


const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bscs22145_db_user:r1CpBxTvpfrTLtX4@cluster0.k1livvu.mongodb.net/?appName=Cluster0";
const DB_NAME = "freelancer_plateform";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    const db = client.db(DB_NAME);
    cachedClient = client;
    cachedDb = db;

    console.log("[MongoDB] ✅ Connected to Atlas database");
    return { client, db };
  } catch (err) {
    console.error("[MongoDB] ❌ Connection error:", err);
    throw err;
  }
}

export async function getDatabase() {
  if (!cachedDb) {
    const { db } = await connectToDatabase();
    return db;
  }
  return cachedDb;
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export function getCollections(db) {
  return {
    users: db.collection("users"),
    gigs: db.collection("gigs"),
    categories: db.collection("categories"),
    cities: db.collection("cities"),
    skills: db.collection("skills"),
    specialties: db.collection("specialties"),
    jobPosts: db.collection("jobPosts"),
    jobApplications: db.collection("jobApplications"),
    freelancerProfiles: db.collection("freelancerProfiles"),
    clientProfiles: db.collection("clientProfiles"),
  };
}
