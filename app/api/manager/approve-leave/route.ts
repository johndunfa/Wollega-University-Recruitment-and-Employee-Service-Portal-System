import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Leave from "@/models/Leave";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // ✅ Safely parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { requestId, action, managerId, managerComments } = body;

    if (!requestId || !action || !managerId) {
      return NextResponse.json(
        { success: false, message: "Request ID, action, and manager ID are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Action must be either 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { success: false, message: "Invalid request ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const leaveRequest = await Leave.findById(requestId);

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, message: "Leave request not found" },
        { status: 404 }
      );
    }

    if (leaveRequest.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Leave request has already been processed" },
        { status: 400 }
      );
    }

    // ✅ Update manager approval and leave status
    if (action === "approved") {
      leaveRequest.managerApproval = "approved";
      leaveRequest.status = "waiting_for_hr"; // Keep as pending until HR approves
    } else {
      leaveRequest.managerApproval = "rejected";
      leaveRequest.status = "rejected";
    }

    leaveRequest.approvedBy = managerId;
    leaveRequest.managerComments = managerComments || null;

    const updatedRequest = await leaveRequest.save();

    return NextResponse.json({
      success: true,
      message:
        action === "approved"
          ? "Leave request approved! Sent to HR for final approval."
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
  } catch (error: any) {
    console.error("Error processing leave request:", error.message || error);
    return NextResponse.json(
      { success: false, message: "Failed to process leave request", error: error.message },
      { status: 500 }
    );
  }
}