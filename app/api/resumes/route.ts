import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Application } from "@/lib/models/Resume"

export async function GET() {
  try {
    await connectToDatabase()
    const applications = await Application.find({}).sort({ createdAt: -1 })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const application = new Application(body)
    await application.save()

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
