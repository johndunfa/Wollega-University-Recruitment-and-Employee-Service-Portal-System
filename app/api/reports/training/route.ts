// app/api/reports/training/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || '';
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build filter
    const filter: any = {
      eventType: { $in: ['Training', 'Workshop', 'Onboarding', 'Certification'] }
    };

    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    await client.connect();
    const db = client.db();
    const collection = db.collection('events');

    const events = await collection
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    const today = new Date();
    const completedEvents = events.filter(e => new Date(e.date) <= today);
    const upcomingEvents = events.filter(e => new Date(e.date) > today);

    // Count types and skills
    const typeCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    events.forEach(event => {
      const type = event.eventType || 'Training';
      const skill = event.topic || event.title || 'General';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    // Count unique participants
    const allParticipants = new Set<string>();
    events.forEach(event => {
      if (Array.isArray(event.participants)) {
        event.participants.forEach((p: any) => {
          allParticipants.add(typeof p === 'string' ? p : (p.email || p.id || p.name));
        });
      }
    });

    // ✅ CORRECT: No extra `{`, just one clean object
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEvents: events.length,
          completed: completedEvents.length,
          upcoming: upcomingEvents.length,
          totalParticipants: allParticipants.size,
          typeCounts,
          skillCounts,
        },
        completedEvents: completedEvents.map(e => ({
          id: e._id.toString(),
          title: e.title,
          topic: e.topic || 'N/A',
          date: new Date(e.date).toLocaleDateString(),
          trainer: e.trainer || 'Internal',
          participants: Array.isArray(e.participants) ? e.participants.length : 0,
        })),
        upcomingEvents: upcomingEvents.map(e => ({
          id: e._id.toString(),
          title: e.title,
          topic: e.topic || 'N/A',
          date: new Date(e.date).toLocaleDateString(),
          trainer: e.trainer || 'TBD',
          participants: Array.isArray(e.participants) ? e.participants.length : 0,
        })),
        period: {
          start,
          end,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching training report:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}