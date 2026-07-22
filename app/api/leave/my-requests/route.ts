import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

import Leave from '../../../../models/Leave';
export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const leaves = await Leave.find({ employeeId }).sort({ startDate: -1 });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
