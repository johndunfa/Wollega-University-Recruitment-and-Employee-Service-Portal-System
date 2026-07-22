// app/api/passmark/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for development (replace with MongoDB in production)
const passMarks = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, passMark } = await request.json();

    if (!jobTitle || passMark === undefined) {
      return NextResponse.json(
        { success: false, error: 'Job title and pass mark are required' },
        { status: 400 }
      );
    }

    if (passMark < 0 || passMark > 100) {
      return NextResponse.json(
        { success: false, error: 'Pass mark must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Store in memory (replace with database in production)
    passMarks.set(jobTitle, passMark);

    return NextResponse.json({
      success: true,
      message: 'Pass mark set successfully',
      jobTitle,
      passMark
    });
  } catch (error) {
    console.error('Error setting pass mark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set pass mark' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobTitle = searchParams.get('jobTitle');

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    const passMark = passMarks.get(jobTitle);

    if (passMark === undefined) {
      return NextResponse.json(
        { success: true, passMark: null, message: 'No pass mark set for this job' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      passMark,
      jobTitle
    });
  } catch (error) {
    console.error('Error fetching pass mark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pass mark' },
      { status: 500 }
    );
  }
}