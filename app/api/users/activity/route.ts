// app/api/users/activity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json()
    
    if (!employeeId) {
      return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 })
    }
    
    await connectToDatabase()
    
    // Update user activity in the database
    await User.findOneAndUpdate(
      { employeeId },
      { 
        isLoggedIn: true,
        lastActive: new Date()
      }
    )
    
    return NextResponse.json({ message: 'Activity updated' })
  } catch (error) {
    console.error('Failed to update activity:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}