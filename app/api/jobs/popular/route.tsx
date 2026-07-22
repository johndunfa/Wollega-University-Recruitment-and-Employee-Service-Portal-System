import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();

    // Sort jobs: jobs with no deadline first, then the rest by deadline ascending
    const jobs = await Job.find()
      .sort({ deadline: -1 }) // null/undefined deadlines come first in MongoDB
      .limit(4)
      .lean();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
