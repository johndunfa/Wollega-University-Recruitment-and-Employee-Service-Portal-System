import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { employee_id } = await req.json();

    if (!employee_id) {
      return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ employeeId: employee_id });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position || 'N/A',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
