// app/api/reports/hiring-needs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || 'Engineering';
    const months = parseInt(searchParams.get('months') || '3', 10);

    if (isNaN(months) || months < 1 || months > 24) {
      return NextResponse.json(
        { success: false, error: 'Invalid months parameter' },
        { status: 400 }
      );
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    await client.connect();
    const db = client.db();

    const hiredCount = await db.collection('hired_employees').countDocuments({
      department: { $regex: department, $options: 'i' },
      appliedAt: { $gte: cutoffDate },
    });

    const openApplications = await db.collection('applications').countDocuments({
      jobTitle: { $regex: department, $options: 'i' },
      status: { $in: ['Applied', 'Interviewing'] },
    });

    const openPositions = await db.collection('jobs').countDocuments({
      department: { $regex: department, $options: 'i' },
      status: 'Open',
    });

    const growthRate = parseFloat((hiredCount / months).toFixed(2));
    const highDemand = openApplications > 8 || openPositions > 2;

    let recommendation = 'No immediate hiring needed.';
    let urgency = '🟢 Low';

    if (openPositions > 2 && highDemand) {
      recommendation = 'Urgently hire 2-3 team members.';
      urgency = '🔴 High';
    } else if (openPositions > 0 && hiredCount < 2) {
      recommendation = 'Plan to hire 1-2 members next quarter.';
      urgency = '🟡 Medium';
    }

    // ✅ CORRECT: Use `data` as key — no extra `{`
    return NextResponse.json({
      success: true,
      data: {
        department,
        period: `Last ${months} months`,
        metrics: { hiredCount, openApplications, openPositions, growthRate },
        analysis: {
          hiringTrend: hiredCount < 2 ? 'Low hiring activity' : 'Stable hiring',
          demandSignal: highDemand ? 'High demand' : 'Stable workload',
          coverageGap: openPositions > 0 ? 'Yes' : 'No',
        },
        recommendation,
        urgency,
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await client.close().catch(console.warn);
  }
}