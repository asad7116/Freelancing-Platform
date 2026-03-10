/**
 * seed-gigs.js
 * ─────────────
 * Seed script to add sample gigs for existing freelancers in the database.
 * 
 * Usage:  node scripts/seed-gigs.js
 * 
 * What it does:
 *   1. Connects to MongoDB Atlas
 *   2. Finds all users with role "freelancer" (or "seller")
 *   3. Inserts 2-3 gigs per freelancer with realistic data
 *   4. Skips freelancers who already have gigs
 */

import { MongoClient, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bscs22145_db_user:r1CpBxTvpfrTLtX4@cluster0.k1livvu.mongodb.net/?appName=Cluster0"
const DB_NAME = "freelancer_plateform"

// ── Sample gigs pool ──────────────────────────────────────────────────────
const gigPool = [
  // Web Development
  {
    gigTitle: "Build a Responsive React Website",
    category: "web-development",
    shortDescription: "I will build a modern, responsive React.js website with clean code, fast performance, and mobile-first design.",
    price: 150,
    deliveryTime: 7,
    revisions: 3,
    additionalNotes: "Includes routing, responsive layout, and basic SEO setup.",
  },
  {
    gigTitle: "Full Stack MERN Application Development",
    category: "web-development",
    shortDescription: "I will develop a full-stack web application using MongoDB, Express, React, and Node.js with authentication and REST API.",
    price: 300,
    deliveryTime: 14,
    revisions: 3,
    additionalNotes: "Includes user auth, CRUD operations, and deployment support.",
  },
  {
    gigTitle: "Create a Professional Landing Page",
    category: "web-development",
    shortDescription: "I will create a stunning, conversion-optimized landing page using HTML, CSS, and JavaScript with animations.",
    price: 80,
    deliveryTime: 3,
    revisions: 5,
    additionalNotes: "Fully responsive with contact form integration.",
  },
  {
    gigTitle: "WordPress Website Development",
    category: "web-development",
    shortDescription: "I will build a professional WordPress website with custom theme, plugins, and SEO optimization.",
    price: 200,
    deliveryTime: 5,
    revisions: 3,
    additionalNotes: "Includes speed optimization and basic content setup.",
  },
  {
    gigTitle: "REST API Development with Node.js",
    category: "web-development",
    shortDescription: "I will build a secure and scalable REST API using Node.js, Express, and MongoDB with JWT authentication.",
    price: 120,
    deliveryTime: 5,
    revisions: 2,
    additionalNotes: "Includes API documentation and Postman collection.",
  },

  // Mobile App Development
  {
    gigTitle: "React Native Mobile App Development",
    category: "mobile-app-development",
    shortDescription: "I will build a cross-platform mobile app using React Native with a clean UI and smooth navigation.",
    price: 400,
    deliveryTime: 14,
    revisions: 3,
    additionalNotes: "Works on both iOS and Android. Includes API integration.",
  },
  {
    gigTitle: "Flutter App with Firebase Backend",
    category: "mobile-app-development",
    shortDescription: "I will develop a beautiful Flutter mobile application with Firebase authentication, Firestore, and push notifications.",
    price: 350,
    deliveryTime: 10,
    revisions: 3,
    additionalNotes: "Includes state management with Provider/Riverpod.",
  },

  // UI/UX Design
  {
    gigTitle: "Modern UI/UX Design for Web App",
    category: "ui-ux-design",
    shortDescription: "I will design a modern, user-friendly UI/UX for your web application using Figma with interactive prototypes.",
    price: 180,
    deliveryTime: 5,
    revisions: 4,
    additionalNotes: "Includes wireframes, high-fidelity mockups, and a design system.",
  },
  {
    gigTitle: "Mobile App UI Design in Figma",
    category: "ui-ux-design",
    shortDescription: "I will create a sleek mobile app UI design in Figma with user flows, wireframes, and pixel-perfect screens.",
    price: 200,
    deliveryTime: 7,
    revisions: 3,
    additionalNotes: "Includes dark mode and light mode variants.",
  },

  // Graphic Design
  {
    gigTitle: "Professional Logo and Brand Identity",
    category: "graphic-design",
    shortDescription: "I will design a unique, professional logo and brand identity package including color palette and typography guidelines.",
    price: 100,
    deliveryTime: 3,
    revisions: 5,
    additionalNotes: "Delivered in all formats: PNG, SVG, PDF, AI.",
  },
  {
    gigTitle: "Social Media Graphics Package",
    category: "graphic-design",
    shortDescription: "I will create eye-catching social media post designs for Instagram, Facebook, and LinkedIn to boost your brand.",
    price: 60,
    deliveryTime: 2,
    revisions: 3,
    additionalNotes: "Package of 10 custom-designed posts.",
  },

  // Digital Marketing
  {
    gigTitle: "SEO Optimization for Your Website",
    category: "digital-marketing",
    shortDescription: "I will perform complete on-page and technical SEO optimization to improve your website's Google rankings.",
    price: 150,
    deliveryTime: 5,
    revisions: 2,
    additionalNotes: "Includes keyword research, meta tags, and performance audit.",
  },
  {
    gigTitle: "Google Ads & Facebook Ads Campaign Setup",
    category: "digital-marketing",
    shortDescription: "I will set up and optimize Google Ads and Facebook Ads campaigns to drive targeted traffic and conversions.",
    price: 200,
    deliveryTime: 3,
    revisions: 2,
    additionalNotes: "Includes audience targeting, ad creatives, and A/B testing.",
  },

  // Data Science / AI
  {
    gigTitle: "Python Data Analysis and Visualization",
    category: "data-science",
    shortDescription: "I will analyze your data using Python, Pandas, and Matplotlib and deliver clear insights with professional visualizations.",
    price: 120,
    deliveryTime: 4,
    revisions: 2,
    additionalNotes: "Includes Jupyter notebook with documented analysis.",
  },
  {
    gigTitle: "Machine Learning Model Development",
    category: "data-science",
    shortDescription: "I will build and train a custom machine learning model for your business problem using Python and scikit-learn/TensorFlow.",
    price: 500,
    deliveryTime: 10,
    revisions: 2,
    additionalNotes: "Includes model evaluation, optimization, and deployment guide.",
  },

  // Content Writing
  {
    gigTitle: "SEO Blog Posts and Articles",
    category: "content-writing",
    shortDescription: "I will write high-quality, SEO-optimized blog posts and articles that drive organic traffic to your website.",
    price: 50,
    deliveryTime: 2,
    revisions: 3,
    additionalNotes: "Up to 1500 words per article. Includes keyword research.",
  },
  {
    gigTitle: "Professional Copywriting for Websites",
    category: "content-writing",
    shortDescription: "I will write compelling website copy that converts visitors into customers with clear messaging and strong CTAs.",
    price: 100,
    deliveryTime: 3,
    revisions: 3,
    additionalNotes: "Includes homepage, about page, and service pages.",
  },

  // Video & Animation
  {
    gigTitle: "Explainer Video Animation",
    category: "video-animation",
    shortDescription: "I will create a professional 2D animated explainer video to showcase your product or service in an engaging way.",
    price: 250,
    deliveryTime: 7,
    revisions: 2,
    additionalNotes: "60-90 second video with voiceover and background music.",
  },

  // Cybersecurity
  {
    gigTitle: "Website Security Audit and Penetration Testing",
    category: "cybersecurity",
    shortDescription: "I will perform a comprehensive security audit and penetration test on your web application to identify vulnerabilities.",
    price: 300,
    deliveryTime: 5,
    revisions: 1,
    additionalNotes: "Includes detailed report with remediation steps.",
  },

  // Cloud & DevOps
  {
    gigTitle: "AWS Cloud Infrastructure Setup",
    category: "cloud-devops",
    shortDescription: "I will set up and configure your AWS cloud infrastructure including EC2, S3, RDS, and CloudFront with CI/CD pipeline.",
    price: 250,
    deliveryTime: 5,
    revisions: 2,
    additionalNotes: "Includes documentation and monitoring setup.",
  },
  {
    gigTitle: "Docker & Kubernetes Deployment",
    category: "cloud-devops",
    shortDescription: "I will containerize your application with Docker and deploy it on Kubernetes with auto-scaling and load balancing.",
    price: 200,
    deliveryTime: 4,
    revisions: 2,
    additionalNotes: "Includes Dockerfile, docker-compose, and K8s manifests.",
  },
]

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGODB_URI, { tls: true })
  await client.connect()
  console.log("✅ Connected to MongoDB Atlas")

  const db = client.db(DB_NAME)
  const users = db.collection("users")
  const gigs = db.collection("gigs")

  // Find all freelancer users
  const freelancers = await users.find({
    role: { $in: ["freelancer", "seller"] },
  }).toArray()

  console.log(`Found ${freelancers.length} freelancer(s)`)

  if (freelancers.length === 0) {
    console.log("No freelancers found. Nothing to seed.")
    await client.close()
    return
  }

  let totalInserted = 0

  for (const freelancer of freelancers) {
    const userId = freelancer._id.toString()
    const name = freelancer.name || "Freelancer"

    // Check how many gigs this freelancer already has
    const existingCount = await gigs.countDocuments({ createdBy: userId })
    const needed = Math.floor(Math.random() * 3) + 5 // 5, 6, or 7
    const toAdd = needed - existingCount

    if (toAdd <= 0) {
      console.log(`⏭  ${name} already has ${existingCount} gig(s) — enough`)
      continue
    }

    // Pick random gigs for this freelancer (avoid duplicates with existing titles)
    const existingGigs = await gigs.find({ createdBy: userId }, { projection: { gigTitle: 1 } }).toArray()
    const existingTitles = new Set(existingGigs.map((g) => g.gigTitle))

    const available = gigPool.filter((g) => !existingTitles.has(g.gigTitle))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    const selectedGigs = shuffled.slice(0, toAdd)

    for (const gig of selectedGigs) {
      await gigs.insertOne({
        _id: new ObjectId(),
        gigTitle: gig.gigTitle,
        category: gig.category,
        shortDescription: gig.shortDescription,
        price: gig.price,
        deliveryTime: gig.deliveryTime,
        revisions: gig.revisions,
        additionalNotes: gig.additionalNotes || "",
        thumbnailImage: null,
        galleryImages: [],
        createdBy: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      totalInserted++
      console.log(`  ✅ Added "${gig.gigTitle}" for ${name}`)
    }
  }

  console.log(`\n🎉 Done! Inserted ${totalInserted} gigs for ${freelancers.length} freelancer(s).`)
  await client.close()
}

main().catch((err) => {
  console.error("❌ Seed error:", err)
  process.exit(1)
})
