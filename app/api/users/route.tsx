import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'

// Create user (already working)
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const body = await request.json()

    if (!body.employeeId || !body.role || !body.name || !body.department || !body.email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await User.findOne({ employeeId: body.employeeId })
    if (existingUser) {
      return NextResponse.json({ message: 'Employee ID already exists' }, { status: 409 })
    }

    const newUser = new User({
      employeeId: body.employeeId,
      role: body.role,
      name: body.name,
      department: body.department,
      email: body.email,
    })

    await newUser.save()

    return NextResponse.json({
      _id: newUser._id,
      employeeId: newUser.employeeId,
      role: newUser.role,
      name: newUser.name,
      department: newUser.department,
      email: newUser.email,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// Fetch users
export async function GET() {
  try {
    await connectToDatabase()
    const users = await User.find().lean()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 })
  }
}

// Delete user by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    await connectToDatabase()
    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ message: 'Server error while deleting user' }, { status: 500 })
  }
}
