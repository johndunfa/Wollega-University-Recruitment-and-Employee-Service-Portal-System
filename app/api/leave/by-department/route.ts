import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Leave from '@/models/Leave';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { employee_id } = await req.json();

    if (!employee_id) {
      return NextResponse.json(
        { message: 'Employee ID is required' }, 
        { status: 400 }
      );
    }

    // Find the manager by employeeId
    const manager = await User.findOne({ employeeId: employee_id });
    if (!manager) {
      return NextResponse.json(
        { message: 'Manager not found' }, 
        { status: 404 }
      );
    }

    if (manager.role.toLowerCase() !== 'manager') {
      return NextResponse.json(
        { message: 'Unauthorized: User is not a manager' }, 
        { status: 403 }
      );
    }

    // Find leave requests for the manager's department
    const leaveRequests = await Leave.find({ 
      department: manager.department 
    }).lean();

    return NextResponse.json(leaveRequests, { status: 200 });

  } catch (error) {
    console.error('[LEAVE_REQUESTS_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}