import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Leave from '@/models/Leave';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { requestId, status, managerId } = await req.json();

    if (!requestId || !status || !managerId) {
      return NextResponse.json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Verify the manager
    const manager = await User.findOne({ employeeId: managerId });
    if (!manager || manager.role.toLowerCase() !== 'manager') {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 403 }
      );
    }

    // Validate status
    const allowedStatuses = ['approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' }, 
        { status: 400 }
      );
    }

    // Update the leave request
    const updatedRequest = await Leave.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { message: 'Leave request not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: `Leave request ${status} successfully`,
        updatedRequest 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('[UPDATE_STATUS_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}