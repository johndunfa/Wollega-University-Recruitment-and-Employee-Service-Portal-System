// app/api/reports/employee-data/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');
  const type = searchParams.get('type'); // 'attendance', 'training', 'leave'

  if (!employeeId || !type) {
    return NextResponse.json({ error: 'Missing employeeId or type' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'Database connection not configured' }, { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); // uses default DB from URI

    let collectionName = '';
    switch (type) {
      case 'attendance':
        collectionName = 'attendances';
        break;
      case 'training':
        collectionName = 'trainings';
        break;
      case 'leave':
        collectionName = 'leaves';
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const collection = db.collection(collectionName);
    const data = await collection
      .find({ employeeId })
      .sort({ createdAt: -1, startDate: -1, date: -1 })
      .limit(50)
      .toArray();

    // Serialize BSON/Date to JSON
    const serialized = JSON.parse(JSON.stringify(data));

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error('DB error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}