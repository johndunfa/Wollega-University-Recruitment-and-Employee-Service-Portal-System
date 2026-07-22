import mongoose from "mongoose"

const ApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    cvFile: {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    },
    skills: [
      {
        type: String,
      },
    ],
    education: [
      {
        type: String,
      },
    ],
    experience: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "applications", // Explicitly set collection name to 'applications'
  },
)

export const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema)
