import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Candidate from "@/lib/models/Candidate";
import { sendCandidateEmail } from "@/lib/mailer";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    console.log("[v1] Starting candidate selection process");

    const { candidates, totalCandidates, jobDescription, jobTitle } =
      await request.json();

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: "No candidates provided" }, { status: 400 });
    }
    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }
    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 });
    }

    console.log(
      `[v1] Selecting ${candidates.length} candidates out of ${totalCandidates} total`
    );

    await connectToDatabase();

    // ✅ Always enforce jobTitle & jobId
    const candidatesToInsert = candidates.map((candidate: any) => ({
      ...candidate,
      totalCandidates,
      jobDescription: jobDescription.substring(0, 1000),
      jobTitle, // enforce backend copy
      jobId: candidate.jobId
        ? new mongoose.Types.ObjectId(candidate.jobId)
        : new mongoose.Types.ObjectId(),
      selectedAt: new Date(),
    }));

    const result = await Candidate.insertMany(candidatesToInsert, {
      ordered: false,
    });

    console.log(`[v1] Successfully stored ${result.length} candidates in database`);

    // Fire & forget emails
    result.forEach(async (candidate) => {
      if (candidate.email) {
        try {
          await sendCandidateEmail(
            candidate.email,
            jobDescription.split("\n")[0] || "this position"
          );
          console.log(`[v1] Email sent to ${candidate.email}`);
        } catch (err) {
          console.error(`[v1] Failed to send email to ${candidate.email}`, err);
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully selected and stored ${result.length} candidates`,
      selectedCandidates: result.length,
      totalCandidates,
    });
  } catch (error) {
    console.error("[v1] Error saving candidates:", error);
    return NextResponse.json({ error: "Failed to save candidates" }, { status: 500 });
  }
}
