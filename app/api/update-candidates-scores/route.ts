import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const body = await request.json();
    const { candidates } = body;
    
    if (!candidates || !Array.isArray(candidates)) {
      return NextResponse.json(
        { success: false, error: 'Candidates array is required' },
        { status: 400 }
      );
    }
    
    // Validate all candidate IDs first
    const validCandidates = [];
    const invalidCandidateIds = [];
    
    for (const candidate of candidates) {
      try {
        const objectId = new ObjectId(candidate.candidateId);
        validCandidates.push({
          ...candidate,
          objectId
        });
      } catch (error) {
        invalidCandidateIds.push(candidate.candidateId);
      }
    }
    
    if (invalidCandidateIds.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid candidate ID format',
          invalidCandidateIds 
        },
        { status: 400 }
      );
    }
    
    // First, fetch the current qualification scores (stored as "score") for all candidates
    const candidateIds = validCandidates.map(c => c.objectId);
    const existingCandidates = await db.collection('candidates')
      .find({ _id: { $in: candidateIds } })
      .project({ _id: 1, score: 1 })
      .toArray();
    
    // Create a map of candidate IDs to their existing qualification scores
    const qualificationScoresMap = new Map();
    existingCandidates.forEach(candidate => {
      qualificationScoresMap.set(candidate._id.toString(), candidate.score || 0);
    });
    
    // Update all candidates with their scores
    const bulkOperations = validCandidates.map(candidate => {
      // Get the existing qualification score (stored as "score")
      const qualificationScore = qualificationScoresMap.get(candidate.objectId.toString()) || 0;
      
      // Get the new scores from the request
      const interviewScore = candidate.interviewScore || 0;
      const documentScore = candidate.documentScore || 0;
      
      // Calculate total score as the sum of all three scores
      const totalScore = qualificationScore + interviewScore + documentScore;
      
      return {
        updateOne: {
          filter: { _id: candidate.objectId },
          update: {
            $set: {
              score: qualificationScore, // Keep the original qualification score
              interviewScore: interviewScore,
              documentScore: documentScore,
              totalScore: totalScore,
              updatedAt: new Date()
            }
          }
        }
      };
    });
    
    let result;
    try {
      result = await db.collection('candidates').bulkWrite(bulkOperations);
    } catch (bulkError) {
      console.error('Bulk write error:', bulkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update candidate scores',
          message: 'Database operation failed'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Scores updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      totalCandidates: validCandidates.length
    });
    
  } catch (error) {
    console.error('Error updating candidate scores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update candidate scores',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}