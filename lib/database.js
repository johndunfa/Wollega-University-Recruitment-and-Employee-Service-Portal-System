// Database connection and utility functions
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "mint_db"

let client
let db

export async function connectToDatabase() {
  if (db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DB_NAME)
    console.log("Connected to MongoDB")
    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

// Utility function to get department collection name
export function getDepartmentCollection(department) {
  const departmentMap = {
    "Software Engineer": "software_engineer",
    "Human Resources": "human_resources",
    Marketing: "marketing",
    Finance: "finance",
    Operations: "operations",
    Management: "management",
  }

  return departmentMap[department] || "general_employees"
}

// Generate random password
export function generateRandomPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Hash password (simple implementation - in production use bcrypt)
export async function hashPassword(password) {
  // In a real application, use bcrypt or similar
  const crypto = await import("crypto")
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}
