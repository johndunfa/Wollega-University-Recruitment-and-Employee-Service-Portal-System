// File: /app/api/leave/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Leave from '@/models/Leave';
import User from '@/models/User'; // ✅ import the User model

export async function POST(req: NextRequest) {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = await req.json();

    // Basic required fields check
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();

    // ✅ Fetch user details based on employeeId
    const user = await User.findOne({ employeeId });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // ✅ Create new leave request with enriched data
    const newLeave = new Leave({
      employeeId,
      employeeName: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });

    await newLeave.save();

    return NextResponse.json({ success: true, message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error submitting leave:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
