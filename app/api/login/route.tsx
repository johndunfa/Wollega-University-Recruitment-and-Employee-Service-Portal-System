import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { employeeId, password } = await request.json();

    await connectToDatabase();

    const user = await User.findOne({ employeeId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Direct plain-text password comparison (not secure!)
    if (password !== user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userData = {
      employeeId: user.employeeId,
      role: user.role,
      name: user.name || null,
    };

    return NextResponse.json(
      { message: 'Login successful', role: user.role, user: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { message: 'Something went wrong. Try again later.' },
      { status: 500 }
    );
  }
}
