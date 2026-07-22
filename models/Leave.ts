// models/Leave.js
import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  email: { type: String },
  department: { type: String },
  role: { type: String },

  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },

  status: { 
    type: String, 
    enum: ["pending", "waiting_for_hr", "approved", "rejected"],
    default: "pending" 
  },

  managerApproval: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  hrApproval: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },

  submittedAt: { type: Date, default: Date.now },
  approvedBy: { type: String },
  managerComments: { type: String },
  hrComments: { type: String },

  // ✅ These fields are correctly defined
  actualReturnDate: { type: Date },
  report: { type: String },
  startWorkStatus: { 
    type: String,
    enum: ['leaved', 'reported'],
    default: 'leaved'
  }
});

export default mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);