// app/api/add-users/route.tsx
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { sendTemporaryPasswordEmail } from '@/lib/email'

interface UserCredentials {
  employeeId: string
  email: string
  password: string
  role: string
  createdAt: string
}

interface UserProfile {
  employeeId: string
  fullName: string
  email: string
  phoneNumber: string | null
  department: string
  startDate: string
  createdAt: string
  [key: string]: any
}

interface Notification {
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: string
}

export async function POST(request: Request) {
  let client: MongoClient | null = null
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI!)
    const db = client.db()
    const userData = await request.json()

    if (!userData.employeeId || !userData.email || !userData.role || !userData.fullName || !userData.department) {
      await client.close()
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const password = Math.floor(10000000 + Math.random() * 90000000).toString()
    const createdAt = new Date().toISOString()

    // --- Save to DB ---
    const usersCollection = db.collection('users')
    const credentials: UserCredentials = {
      employeeId: userData.employeeId,
      email: userData.email,
      password,
      role: userData.role,
      createdAt
    }
    await usersCollection.insertOne(credentials)

    const roleCollection = db.collection(`${userData.role}s`)
    const profile: UserProfile = {
      employeeId: userData.employeeId,
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber || null,
      department: userData.department,
      startDate: userData.startDate || new Date().toISOString().split('T')[0],
      createdAt
    }
    await roleCollection.insertOne(profile)

    const notificationsCollection = db.collection('notifications')
    const notification: Notification = {
      type: 'user-created',
      title: 'New User Created',
      message: `User ${userData.fullName} (${userData.employeeId}) with role ${userData.role} was created successfully`,
      priority: 'medium',
      isRead: false,
      createdAt
    }
    await notificationsCollection.insertOne(notification)

    // --- Send Email ---
    try {
      await sendTemporaryPasswordEmail(
        userData.email,
        userData.fullName,
        userData.employeeId,
        password,
        userData.role
      )
    } catch (err) {
      console.error("Failed to send email:", err)
      // Continue even if email fails
    }

    await client.close()
    return NextResponse.json(
      {
        message: 'User created successfully',
        employeeId: userData.employeeId,
        temporaryPassword: password,
        role: userData.role
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating user:', error)
    if (client) await client.close()
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
  }
}
