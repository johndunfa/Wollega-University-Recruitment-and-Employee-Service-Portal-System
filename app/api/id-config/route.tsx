import { NextResponse } from 'next/server';
import {connectToDatabase} from '@/lib/mongodb';
import IdConfig from '@/models/IdConfig';

export async function GET() {
  await connectToDatabase();
  try {
    const configs = await IdConfig.find();
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch ID configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectToDatabase();
  try {
    const { role, prefix, nextNumber } = await request.json();
    
    // Validate input
    if (!role || !prefix) {
      return NextResponse.json(
        { message: 'Role and prefix are required' },
        { status: 400 }
      );
    }

    // Upsert the configuration
    const config = await IdConfig.findOneAndUpdate(
      { role },
      { prefix, nextNumber },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to save ID configuration' },
      { status: 500 }
    );
  }
}