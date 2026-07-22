// models/User.ts (or .js)
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  department: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
