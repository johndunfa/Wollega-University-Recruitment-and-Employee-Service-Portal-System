// /services/LeaveHRFetcher.ts
import { connectToDatabase } from "@/lib/mongodb";
import Leave from "@/models/Leave";

export class LeaveHRFetcher {
  // Fetch all leave requests approved by manager but waiting for HR approval
  static async fetchPendingRequests() {
    await connectToDatabase();

    const pendingRequests = await Leave.find({
      managerApproval: "approved",
      status: "waiting_for_hr",
    }).sort({ submittedAt: -1 });

    return pendingRequests.map(req => ({
      id: req._id.toString(),
      employeeId: req.employeeId,
      leaveType: req.leaveType,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      status: req.status,
      managerApproval: req.managerApproval,
      hrApproval: req.hrApproval,
      submittedAt: req.submittedAt,
      managerComments: req.managerComments,
      hrComments: req.hrComments,
    }));
  }
}
