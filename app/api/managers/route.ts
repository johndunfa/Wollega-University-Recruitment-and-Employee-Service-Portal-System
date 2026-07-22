import { connectToDatabase } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

interface ManagerResponse {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employeesManaged?: string[];
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Find employees who are managers
    const managers = await Employee.find({
      $or: [
        { position: { $regex: /manager/i } },
        { role: 'manager' }
      ]
    }).lean();
    
    // Convert to response format with proper typing
    const managersData: ManagerResponse[] = managers.map((manager: any) => ({
      _id: manager._id.toString(),
      employeeId: manager.employeeId,
      name: manager.name,
      email: manager.email,
      department: manager.department,
      position: manager.position,
      employeesManaged: manager.employeesManaged || []
    }));
    
    return NextResponse.json(managersData);
  } catch (error: unknown) {
    console.error('Error fetching managers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to fetch managers', error: errorMessage },
      { status: 500 }
    );
  }
}