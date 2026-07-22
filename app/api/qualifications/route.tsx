import { connectToDatabase } from '@/lib/mongodb';
import Qualification from '@/models/qualification';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  const qualifications = await Qualification.find().sort({ createdAt: -1 });
  return NextResponse.json(qualifications);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const qualification = await Qualification.create(data);
  return NextResponse.json(qualification, { status: 201 });
}
