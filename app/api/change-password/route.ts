import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
//import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { employeeId, currentPassword, newPassword } = await request.json();

    if (!employeeId || !currentPassword || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ employeeId });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'User not found or password not set' }, { status: 404 });
    }

    let isMatch = false;

    // Check if password is already hashed (starts with bcrypt format)
    if (user.password || user.password) {
      isMatch = currentPassword === user.password;
    } else {
      // Compare plain text
      isMatch = currentPassword === user.password;
    }

    if (!isMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password and update
   // const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
