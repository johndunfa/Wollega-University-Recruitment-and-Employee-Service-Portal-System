// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

interface Notification {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const collection = db.collection('notifications');

    const notifications = await collection.find()
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();
    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { _id } = await request.json();
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const collection = db.collection('notifications');

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { isRead: true } }
    );

    await client.close();

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Notification marked as read' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const collection = db.collection('notifications');

    const result = await collection.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    await client.close();

    return NextResponse.json(
      { message: `${result.modifiedCount} notifications marked as read` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { message: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}