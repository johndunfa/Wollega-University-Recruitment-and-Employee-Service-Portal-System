// app/api/reports/recruitment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start'); // ex: 2025-01-01
    const end = searchParams.get('end');     // ex: 2025-12-31

    // Build filter for date range
    const filters: any = {};
    if (start) {
      filters.appliedAt = { $gte: new Date(start) };
    }
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59);
      filters.appliedAt = { ...filters.appliedAt, $lte: endDate };
    }

    await client.connect();
    const db = client.db();
    const collection = db.collection('hired_employees');

    const hires = await collection
      .find(filters)
      .sort({ appliedAt: -1 })
      .toArray();

    // Process data
    const totalHires = hires.length;

    // Count by job title
    const hiresByJob: Record<string, number> = {};
    const hiresByMonth: Record<string, number> = {};

    // For time-to-hire (if you have appliedAt and startDate)
    let totalTimeToHire = 0;
    let validTimeToHireCount = 0;

    hires.forEach(hire => {
      const jobTitle = hire.jobTitle || 'Unknown';
      hiresByJob[jobTitle] = (hiresByJob[jobTitle] || 0) + 1;

      // Group by month: "2025-04"
      const appliedAt = new Date(hire.appliedAt);
      const monthKey = `${appliedAt.getFullYear()}-${String(appliedAt.getMonth() + 1).padStart(2, '0')}`;
      hiresByMonth[monthKey] = (hiresByMonth[monthKey] || 0) + 1;

      // Calculate time-to-hire (in days)
      if (hire.appliedAt && hire.startDate) {
        const applied = new Date(hire.appliedAt);
        const start = new Date(hire.startDate);
        const days = Math.ceil((start.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0) {
          totalTimeToHire += days;
          validTimeToHireCount++;
        }
      }
    });

    const avgTimeToHire = validTimeToHireCount > 0 ? Math.round(totalTimeToHire / validTimeToHireCount) : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalHires,
          avgTimeToHire,
          hiresByJob,
          hiresByMonth,
        },
        hires: hires.map(hire => ({
          id: hire._id.toString(),
          fullName: hire.fullName,
          email: hire.email,
          jobTitle: hire.jobTitle,
          department: hire.department || 'N/A',
          appliedAt: new Date(hire.appliedAt).toLocaleDateString(),
          startDate: hire.startDate ? new Date(hire.startDate).toLocaleDateString() : 'Not set',
          signedAt: hire.appliedAt && hire.startDate
            ? Math.ceil((new Date(hire.startDate).getTime() - new Date(hire.appliedAt).getTime()) / (86400000)) + ' days'
            : 'N/A',
        })),
        period: {
          start,
          end,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching recruitment report:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recruitment data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}