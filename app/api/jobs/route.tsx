// /app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch jobs', error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    // Validate required fields
    if (!requestData.title || !requestData.description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the current user session for userId
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Create new Job document
    const newJob = new Job({
      title: requestData.title,
      description: requestData.description,
      department: requestData.department || 'General',
      location: requestData.location || 'Remote',
      deadline: requestData.deadline || 
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      qualifications: requestData.qualifications || '',
      organization: requestData.organization || 'MInT',
      type: requestData.type,
      category: requestData.category,
      experienceLevel: requestData.experienceLevel,
      createdBy: userId, // Add createdBy field to track who created the job
      createdAt: new Date(),
    });

    const savedJob = await newJob.save();

    // Create notification that matches your schema
    if (userId) {
      try {
        const notification = new Notification({
          userId: userId, // Required field
          title: 'New Job Opportunity',
          message: `A new job "${requestData.title}" has been posted in ${requestData.department || 'General'} department`,
          type: 'success', // Using valid enum value from your schema
          priority: 'medium',
          isRead: false,
          actionUrl: `/jobs/${savedJob._id}`,
          metadata: {
            jobId: savedJob._id,
            jobTitle: requestData.title,
            department: requestData.department
          }
        });

        await notification.save();
      } catch (notificationError) {
        console.error('Notification creation failed:', notificationError);
        // Continue even if notification fails
      }
    }

    return NextResponse.json(
      {
        message: 'Job created successfully',
        job: savedJob
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}