import { connectToDatabase } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

interface EmployeeResponse {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  managerId?: string;
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const employees = await Employee.find({}).lean();
    
    // Convert to response format with proper typing
    const employeesData: EmployeeResponse[] = employees.map((employee: any) => ({
      _id: employee._id.toString(),
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      managerId: employee.managerId || undefined
    }));
    
    return NextResponse.json(employeesData);
  } catch (error: unknown) {
    console.error('Error fetching employees:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to fetch employees', error: errorMessage },
      { status: 500 }
    );
  }
}