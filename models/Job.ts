import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  department: string;
  location: string;
  deadline: Date;
  qualifications: string;
  organization: string;
  type: string;
  category: string;
  experienceLevel: string;
  createdAt: Date;
  updatedAt: Date;
  
  // For EditJobPost compatibility - using your existing field names where possible
  employmentType: string;
  salaryRange: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: string;
}

const JobSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true
  },
  department: { 
    type: String, 
    default: 'General',
    trim: true
  },
  location: { 
    type: String, 
    default: 'Remote',
    trim: true
  },
  deadline: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  qualifications: { 
    type: String, 
    default: '',
    trim: true
  },
  organization: { 
    type: String, 
    default: '',
    trim: true
  },
  type: { 
    type: String, 
    default: '',
    trim: true
  },
  category: { 
    type: String, 
    default: '',
    trim: true
  },
  experienceLevel: { 
    type: String, 
    default: '',
    trim: true
  },
  
  // New fields for EditJobPost compatibility
  employmentType: {
    type: String,
    default: 'Full-time'
  },
  salaryRange: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String,
    default: []
  }],
  responsibilities: [{
    type: String,
    default: []
  }],
  benefits: [{
    type: String,
    default: []
  }],
  status: {
    type: String,
    default: 'Active'
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Prevent model overwrite in case of hot-reload
export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);