import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { department } = await req.json();

    if (!department) {
      return NextResponse.json({ message: 'Department is required' }, { status: 400 });
    }

    const employees = await User.find({
      department,
      role: 'employee',
      status: 'active' // or remove this line if status is not in schema
    });

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
