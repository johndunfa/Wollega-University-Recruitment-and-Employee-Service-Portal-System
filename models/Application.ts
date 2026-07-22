import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  fullName: string;
  email: string;
  resume: string;
  status: string;
  jobId: string;
}

const ApplicationSchema: Schema = new Schema({
  fullName: String,
  email: String,
  resume: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending',
  },
  jobId: String,
});

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
