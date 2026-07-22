import { connectToDatabase } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

interface AssignmentsRequestBody {
  assignments: Record<string, string>;
}

export async function POST(req: Request) {
  try {
    const { assignments }: AssignmentsRequestBody = await req.json();
    
    if (!assignments || typeof assignments !== 'object') {
      return NextResponse.json(
        { message: 'Invalid assignments data' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update each employee with their assigned manager
    const updatePromises = Object.entries(assignments).map(([employeeId, managerId]) => {
      return Employee.findByIdAndUpdate(
        employeeId,
        { managerId: managerId || null },
        { new: true }
      );
    });

    await Promise.all(updatePromises);
    return NextResponse.json({ message: 'Assignments updated successfully' });
  } catch (error: unknown) {
    console.error('Error updating assignments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to update assignments', error: errorMessage },
      { status: 500 }
    );
  }
}