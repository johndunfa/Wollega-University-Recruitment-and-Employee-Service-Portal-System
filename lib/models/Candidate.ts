import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    }, // ✅ link to job/position

    jobTitle: {
      type: String,
      required: true, // 👈 make sure it's saved!
    },

    score: {
      type: Number,
      required: true,
    },
    skillMatch: {
      type: Number,
      required: true,
    },
    contentSimilarity: {
      type: Number,
      required: true,
    },
    matchedSkills: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    jobDescription: {
      type: String,
      required: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
    totalCandidates: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Use the candidates collection explicitly
const Candidate =
  mongoose.models.Candidate ||
  mongoose.model("Candidate", CandidateSchema, "candidates");

export default Candidate;
