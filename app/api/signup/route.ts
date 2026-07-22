import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employee_id, password, name, department, role, email } = body;

    // Validation
    if (!employee_id || !password || !name || !department || !role || !email) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existing = await User.findOne({ employeeId: employee_id });
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // Create user
    const newUser = new User({
      employeeId: employee_id,
      password,
      role,
      name,
      department,
      email,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid request body or server error' }, { status: 500 });
  }
}
