// models/Report.ts
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  department: String,
  fileName: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
