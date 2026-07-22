import { connectToDatabase } from '@/lib/mongodb';
import Qualification from '@/models/qualification';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: any) {
  await connectToDatabase();
  const data = await req.json();
  const updated = await Qualification.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: any) {
  await connectToDatabase();
  await Qualification.findByIdAndDelete(params.id);
  return NextResponse.json({ message: 'Deleted' });
}
