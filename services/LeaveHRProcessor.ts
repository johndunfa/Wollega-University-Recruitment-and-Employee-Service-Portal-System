// /services/LeaveHRProcessor.ts
import { connectToDatabase } from "@/lib/mongodb";
import Leave from "@/models/Leave";

export class LeaveHRProcessor {
  // Approve a leave request as HR
  static async approve(requestId: string, hrId: string, hrComments?: string) {
    await connectToDatabase();

    const leaveRequest = await Leave.findById(requestId);
    if (!leaveRequest) throw new Error("Leave request not found");
    if (leaveRequest.managerApproval !== "approved")
      throw new Error("Manager approval is required before HR can process");
    if (leaveRequest.hrApproval && leaveRequest.hrApproval !== "pending")
      throw new Error("HR has already processed this request");

    leaveRequest.hrApproval = "approved";
    leaveRequest.status = "approved";
    leaveRequest.approvedBy = hrId;
    leaveRequest.hrComments = hrComments || null;

    return await leaveRequest.save();
  }

  // Reject a leave request as HR
  static async reject(requestId: string, hrId: string, hrComments?: string) {
    await connectToDatabase();

    const leaveRequest = await Leave.findById(requestId);
    if (!leaveRequest) throw new Error("Leave request not found");
    if (leaveRequest.managerApproval !== "approved")
      throw new Error("Manager approval is required before HR can process");
    if (leaveRequest.hrApproval && leaveRequest.hrApproval !== "pending")
      throw new Error("HR has already processed this request");

    leaveRequest.hrApproval = "rejected";
    leaveRequest.status = "rejected";
    leaveRequest.approvedBy = hrId;
    leaveRequest.hrComments = hrComments || null;

    return await leaveRequest.save();
  }
}
