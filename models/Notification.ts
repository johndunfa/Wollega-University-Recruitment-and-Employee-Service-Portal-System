// models/Notification.ts
import { Schema, model, models } from 'mongoose'

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'system', 'alert', 'success', 'error', 'info',
      'job_created', 'job_posted', 'application_received', 'application_status'
    ], 
    default: 'system' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
})

export default models.Notification || model('Notification', notificationSchema)