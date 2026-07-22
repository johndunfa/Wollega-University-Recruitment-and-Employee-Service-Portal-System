// lib/eventModel.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  type: String,
  department: String,
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
