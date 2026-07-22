import mongoose from 'mongoose'

const ResumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true }, // Path where the file is stored
  fileType: { type: String, required: true }, // pdf, doc, docx
  fileSize: { type: Number, required: true }, // in bytes
  applicantName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'processed', 'failed'], 
    default: 'uploaded' 
  },
  extractedData: {
    skills: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    education: { type: [String], default: [] },
    email: { type: String },
    phone: { type: String },
    rawText: { type: String } // Store full extracted text
  }
}, { timestamps: true })

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema)