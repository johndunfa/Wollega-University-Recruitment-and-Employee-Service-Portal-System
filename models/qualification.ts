import mongoose from 'mongoose';

const QualificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['Diploma', 'Bachelor', 'Master', 'PhD'],
    required: true,
  },
  description: String,
}, { timestamps: true });

export default mongoose.models.Qualification || mongoose.model('Qualification', QualificationSchema);
