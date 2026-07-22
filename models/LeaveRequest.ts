import mongoose from 'mongoose'

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedDate: { type: Date, default: Date.now },
  approvedBy: { type: String },
  managerComments: { type: String }
})

// Export as default
export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema)