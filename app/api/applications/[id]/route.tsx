import { connectToDatabase } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

// PATCH method to update applicant status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid applicant ID' }, { status: 400 });
  }

  try {
    await connectToDatabase();
  } catch (err) {
    console.error('Database connection error:', err);
    return NextResponse.json({ message: 'Failed to connect to database' }, { status: 500 });
  }

  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ message: 'Status is required' }, { status: 400 });
  }

  try {
    const updated = await Application.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ message: 'Applicant not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update applicant status:', error);
    return NextResponse.json({ message: 'Error updating applicant status' }, { status: 500 });
  }
}
