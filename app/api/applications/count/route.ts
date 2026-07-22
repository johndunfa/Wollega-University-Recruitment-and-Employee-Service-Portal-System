import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Application } from '@/lib/models/Resume'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobTitle = searchParams.get('jobTitle')

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const count = await Application.countDocuments({ jobTitle })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting applications:', error)
    return NextResponse.json(
      { error: 'Failed to count applications' },
      { status: 500 }
    )
  }
}