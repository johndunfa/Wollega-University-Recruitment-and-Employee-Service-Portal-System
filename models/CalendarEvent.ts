import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  department: String,
  title: String,
  date: String,
  time: String,
  type: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CalendarEvent ||
  mongoose.model('CalendarEvent', CalendarEventSchema);
