// /app/api/leave/leave-hr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { LeaveHRFetcher } from "@/services/LeaveHRFetcher";
import { LeaveHRProcessor } from "@/services/LeaveHRProcessor";


// GET: Fetch pending HR requests
export async function GET() {
  try {
    const requests = await LeaveHRFetcher.fetchPendingRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

// POST: Approve or reject a leave request
export async function POST(request: NextRequest) {
  try {
    const { requestId, hrId, action, hrComments } = await request.json();
    if (!requestId || !hrId || !action) {
      return NextResponse.json({ success: false, message: "requestId, hrId, and action are required" }, { status: 400 });
    }

    let updatedRequest;
    if (action === "approved") {
      updatedRequest = await LeaveHRProcessor.approve(requestId, hrId, hrComments);
    } else if (action === "rejected") {
      updatedRequest = await LeaveHRProcessor.reject(requestId, hrId, hrComments);
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${action} by HR successfully!`,
      request: updatedRequest,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 });
  }
}
