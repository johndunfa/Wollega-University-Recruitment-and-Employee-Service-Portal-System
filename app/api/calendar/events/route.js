import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/lib/eventModel';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');

    const query = department ? { department } : {};

    const events = await Event.find(query).sort({ date: 1, time: 1 }).lean();

    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    console.error('Fetch events error:', err);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
