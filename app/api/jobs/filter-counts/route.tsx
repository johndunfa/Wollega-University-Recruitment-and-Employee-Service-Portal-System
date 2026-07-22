import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET() {
  try {
    await connectToDatabase();

    // Get counts for each filter category
    const [jobTypeCounts, jobFunctionCounts, experienceCounts] = await Promise.all([
      Job.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Job.aggregate([
        { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
      ])
    ]);

    // Convert to object format
    const formatCounts = (results: any[]) => 
      results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

    return NextResponse.json({
      jobType: formatCounts(jobTypeCounts),
      jobFunction: formatCounts(jobFunctionCounts),
      experienceLevel: formatCounts(experienceCounts)
    });

  } catch (error) {
    console.error('Error fetching filter counts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch filter counts' },
      { status: 500 }
    );
  }
}