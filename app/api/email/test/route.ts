import { type NextRequest, NextResponse } from "next/server"
import { testEmailConnection } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const result = await testEmailConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email service is working correctly",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test email connection",
      },
      { status: 500 },
    )
  }
}
