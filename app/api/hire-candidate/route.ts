// app/api/hire-candidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined');
}

const client = new MongoClient(uri as string);

export async function POST(req: NextRequest) {
  let responseBody = { success: false, error: 'Unknown error' };
  let status = 500;

  try {
    console.log('📥 Received request to /api/hire-candidate');

    const body = await req.json();
    console.log('📄 Request body:', JSON.stringify(body, null, 2));

    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }

    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('hr_system'); // Optional: specify DB name
    const collection = db.collection('hired_employees');

    const result = await collection.insertOne({
      ...body,
      signedAt: new Date(),
    });

    console.log('💾 Inserted document with ID:', result.insertedId);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (err: any) {
    console.error('🚨 API POST Error:', err); // This is key!
    responseBody = {
      success: false,
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
  } finally {
    await client.close().catch((closeErr) => {
      console.error('⚠️ Error closing DB client:', closeErr);
    });
  }

  return NextResponse.json(responseBody, { status });
}