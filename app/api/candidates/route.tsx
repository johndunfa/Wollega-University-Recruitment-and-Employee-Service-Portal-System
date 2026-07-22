import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

function getDatabase() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  return db;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting candidates API request...');
    
    // Connect to database
    await connectToDatabase();
    const db = getDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const jobTitle = searchParams.get('jobTitle');
    
    // Build query - support both jobId and jobTitle searches
    let query = {};
    
    if (jobId) {
      try {
        // Try to convert to ObjectId if it's a valid format
        const objectId = new ObjectId(jobId);
        query = { jobId: objectId };
        console.log('Filtering by jobId (ObjectId):', jobId);
      } catch (error) {
        // If it's not a valid ObjectId, search as string
        query = { jobId: jobId };
        console.log('Filtering by jobId (string):', jobId);
      }
    } else if (jobTitle) {
      // Search by job title (case-insensitive)
      query = { 
        jobTitle: { 
          $regex: jobTitle, 
          $options: 'i' 
        } 
      };
      console.log('Filtering by jobTitle:', jobTitle);
    }
    
    // Also support jobTitle field that might exist
    if (Object.keys(query).length === 0) {
      // If no specific query, get all candidates but limit to 100
      query = {};
      console.log('No filters applied, getting all candidates');
    }

    console.log('Final query:', query);

    // Fetch candidates using native MongoDB driver
    const candidates = await db.collection('candidates')
      .find(query)
      .sort({ resumeScore: -1, appliedDate: -1 })
      .limit(1000) // Limit results for safety
      .toArray();

    console.log(`Found ${candidates.length} candidates in database`);

    // Log sample data to understand the structure
    if (candidates.length > 0) {
      console.log('First candidate data structure:', {
        _id: candidates[0]._id,
        fullName: candidates[0].fullName,
        jobId: candidates[0].jobId,
        jobTitle: candidates[0].jobTitle,
        status: candidates[0].status,
        resumeScore: candidates[0].resumeScore || candidates[0].score || candidates[0].qualificationScore,
        documentScore: candidates[0].documentScore,
        interviewScore: candidates[0].interviewScore,
        totalScore: candidates[0].totalScore

      });
    } else {
      console.log('No candidates found with the given query');
    }

    // Transform documents - handle various field name possibilities
    const serializedCandidates = candidates.map((candidate: any) => {
      // Handle different field name possibilities for name
      const name = candidate.name || candidate.fullName || candidate.candidateName || 
                  (candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate');
      
      const resumeScore = candidate.resumeScore || candidate.score || candidate.qualificationScore || 0;
      const documentScore = candidate.documentScore || 0;
      const interviewScore = candidate.interviewScore || 0;
      const totalScore = candidate.totalScore || 0;

      const appliedDate = candidate.appliedDate || candidate.applicationDate || candidate.dateApplied || new Date();
      const jobTitle = candidate.jobTitle || candidate.position || candidate.jobName || '';
      
      return {
        _id: candidate._id?.toString() || '',
        name: name,
        email: candidate.email || candidate.emailAddress || '',
        phone: candidate.phone || candidate.phoneNumber || '',
        location: candidate.location || '',
        resumeScore: resumeScore,
        documentScore: documentScore,
        interviewScore: interviewScore,
        totalScore: totalScore,
        skills: candidate.skills || candidate.skillset || [],
        experience: candidate.experience || candidate.yearsExperience || 0,
        education: candidate.education || '',
        appliedDate: appliedDate instanceof Date ? 
          appliedDate.toISOString() : 
          new Date(appliedDate).toISOString(),
        status: candidate.status || 'new',
        notes: candidate.notes,
        resumeUrl: candidate.resumeUrl || candidate.resume || '',
        jobId: candidate.jobId?.toString() || '',
        jobTitle: jobTitle,
        department: candidate.department || ''
      };
    });

    return NextResponse.json({ 
      success: true, 
      candidates: serializedCandidates,
      count: serializedCandidates.length
    });
    
  } catch (error) {
    console.error('Error in candidates API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch candidates from database',
        message: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const db = getDatabase();
    
    const body = await request.json();
    const { candidateId, field, value } = body;
    
    if (!candidateId || !field) {
      return NextResponse.json(
        { success: false, error: 'Candidate ID and field are required' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('candidates').updateOne(
      { _id: new ObjectId(candidateId) },
      { $set: { [field]: value, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found or no changes made' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Candidate updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update candidate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}