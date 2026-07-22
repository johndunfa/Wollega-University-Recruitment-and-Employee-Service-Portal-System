import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Leave from "@/models/Leave"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const allRequests = await Leave.find({}).sort({ submittedAt: -1 })

    // Get employee names for each request
    const requestsWithNames = await Promise.all(
      allRequests.map(async (req) => {
        try {
          const employee = await User.findOne({ employeeId: req.employeeId })
          return {
            _id: req._id.toString(),
            employeeId: req.employeeId,
            employeeName: employee?.name || req.employeeId,
            leaveType: req.leaveType,
            startDate: req.startDate,
            endDate: req.endDate,
            reason: req.reason,
            status: req.status,
            submittedAt: req.submittedAt,
            approvedBy: req.approvedBy,
            managerComments: req.managerComments || null,
          }
        } catch (error) {
          console.error(`Error fetching employee ${req.employeeId}:`, error)
          return {
            _id: req._id.toString(),
            employeeId: req.employeeId,
            employeeName: req.employeeId,
            leaveType: req.leaveType,
            startDate: req.startDate,
            endDate: req.endDate,
            reason: req.reason,
            status: req.status,
            submittedAt: req.submittedAt,
            approvedBy: req.approvedBy,
            managerComments: req.managerComments || null,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      requests: requestsWithNames,
    })
  } catch (error) {
    console.error("Error fetching all leave requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
