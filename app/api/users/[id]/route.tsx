import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const user = await User.findByIdAndUpdate(params.id, body, { new: true }).select('-password');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
