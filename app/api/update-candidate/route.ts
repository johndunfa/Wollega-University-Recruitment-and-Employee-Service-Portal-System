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
    const { candidateId, field, value } = body;
    
    if (!candidateId || !field) {
      return NextResponse.json(
        { success: false, error: 'Candidate ID and field are required' },
        { status: 400 }
      );
    }

    // Validate candidateId format
    let objectId;
    try {
      objectId = new ObjectId(candidateId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid candidate ID format' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('candidates').updateOne(
      { _id: objectId },
      { 
        $set: { 
          [field]: value,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Candidate updated successfully',
      modifiedCount: result.modifiedCount
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