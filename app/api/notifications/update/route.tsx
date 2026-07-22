// app/api/notifications/update/route.ts
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Updated import path

export async function POST(request: Request) {
  let client: MongoClient | null = null

  try {
    // Get the current user's session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Type assertion if you've extended the Session type
    const currentUserId = (session.user as { id?: string }).id

    const { employeeId } = await request.json()

    // Verify that the employeeId in the request matches the logged-in user
    if (!employeeId || employeeId !== currentUserId) {
      return NextResponse.json(
        { error: 'Invalid employee ID or unauthorized' },
        { status: 403 }
      )
    }

    client = await MongoClient.connect(process.env.MONGODB_URI!)
    const db = client.db()

    const result = await db.collection('notifications').updateMany(
      { 
        employeeId: currentUserId,
        isRead: false 
      },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'No unread notifications found for this user' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, updatedCount: result.modifiedCount },
      { status: 200 }
    )

  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  } finally {
    if (client) await client.close()
  }
}