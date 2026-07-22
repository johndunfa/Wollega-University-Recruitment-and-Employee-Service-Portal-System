import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Leave from "@/models/Leave";

export async function POST(request: NextRequest) {
  try {
    const { requestId, action, managerId, managerComments } = await request.json();

    if (!requestId || !action || !managerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Request ID, action, and manager ID are required",
        },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Action must be either 'approved' or 'rejected'",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const leaveRequest = await Leave.findById(requestId);

    if (!leaveRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Leave request not found",
        },
        { status: 404 }
      );
    }

    // CHANGE THIS: Check for "waiting_for_hr" instead of "pending"
    if (leaveRequest.status !== "waiting_for_hr") {
      return NextResponse.json(
        {
          success: false,
          message: "Leave request has already been processed",
        },
        { status: 400 }
      );
    }

    // Set manager approval and update status correctly
    if (action === "approved") {
      leaveRequest.managerApproval = "approved";
      leaveRequest.status = "approved"; // Change to final approval
    } else if (action === "rejected") {
      leaveRequest.managerApproval = "rejected";
      leaveRequest.status = "rejected"; // final rejection
    }

    leaveRequest.approvedBy = managerId;
    leaveRequest.managerComments = managerComments || null;

    const updatedRequest = await leaveRequest.save();

    return NextResponse.json({
      success: true,
      message: action === "approved"
        ? "Leave request approved successfully!"
        : "Leave request rejected successfully!",
      request: {
        id: updatedRequest._id.toString(),
        employeeId: updatedRequest.employeeId,
        leaveType: updatedRequest.leaveType,
        startDate: updatedRequest.startDate,
        endDate: updatedRequest.endDate,
        reason: updatedRequest.reason,
        status: updatedRequest.status,
        submittedAt: updatedRequest.submittedAt,
        approvedBy: updatedRequest.approvedBy,
        managerComments: updatedRequest.managerComments,
      },
    });
  } catch (error) {
    console.error("Error processing leave request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process leave request",
      },
      { status: 500 }
    );
  }
}