import { connectToDatabase } from '@/lib/mongodb';
import Event from '@/lib/eventModel';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newEvent = new Event({
      title: body.title,
      date: body.date,
      time: body.time,
      type: body.type,
      department: body.department,
    });

    await newEvent.save();
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Event save error:', err);
    return NextResponse.json({ error: 'Failed to save event' }, { status: 500 });
  }
}
