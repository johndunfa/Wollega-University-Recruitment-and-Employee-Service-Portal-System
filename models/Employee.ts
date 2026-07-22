import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  managerId?: string;
}

const EmployeeSchema: Schema = new Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  managerId: { type: String, default: null }
}, {
  timestamps: true
});

// Check if the model already exists to prevent overwriting
export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);