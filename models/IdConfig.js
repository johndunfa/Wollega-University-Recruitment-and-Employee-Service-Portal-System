// models/IdConfig.js
import mongoose from 'mongoose';

const IdConfigSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true
  },
  prefix: {
    type: String,
    required: true
  },
  nextNumber: {
    type: Number,
    required: true,
    default: 1
  }
});

export default mongoose.models.IdConfig || mongoose.model('IdConfig', IdConfigSchema);