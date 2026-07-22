// app/api/applications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

// Helper: Safely serialize MongoDB documents
function serialize(doc: any) {
  const { _id, ...rest } = doc;
  return {
    _id: _id?.toString(),
    ...rest,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobTitle = url.searchParams.get('jobTitle');
    const jobId = url.searchParams.get('jobId');

    const filter: any = {};
    if (jobTitle) filter.jobTitle = jobTitle;
    if (jobId) filter.jobId = jobId;

    await client.connect();
    const db = client.db();
    const collection = db.collection('applications');

    // Fetch data
    let cursor = collection.find(filter);
    cursor = cursor.sort({ appliedAt: -1 });

    const applicants = await cursor.toArray();

    // Safe mapping: avoid errors if cvFile is missing
    const safeApplicants = applicants.map((app) => {
      const { cvFile, ...rest } = app;
      return {
        ...serialize(rest),
        resumeUrl: cvFile?.name || cvFile?.originalName || 'Resume.pdf',
      };
    });

    return NextResponse.json(safeApplicants);
  } catch (err: any) {
    console.error('API GET Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch applicants', details: err.message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const portfolio = formData.get('portfolio') as string;
    const cvFile = formData.get('cv') as File | null;
    const jobTitle = formData.get('jobTitle') as string;
    const jobId = formData.get('jobId') as string;

    // Validation
    if (!fullName || !email || !phone || !jobTitle || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!cvFile) {
      return NextResponse.json(
        { error: 'CV file is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // File handling
    const timestamp = Date.now();
    const cleanName = fullName.replace(/\s+/g, '_');
    const extension = path.extname(cvFile.name) || '.pdf';
    const uniqueFilename = `${cleanName}_${timestamp}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploaded_resume');
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await cvFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploaded_resume/${uniqueFilename}`;

    // Save to DB
    await client.connect();
    const db = client.db();
    const collection = db.collection('applications');

    const result = await collection.insertOne({
      fullName,
      email,
      phone,
      coverLetter,
      portfolio: portfolio || null,
      jobId,
      jobTitle,
      resumeUrl: publicUrl,
      cvFile: {
        name: cvFile.name,
        type: cvFile.type,
        size: cvFile.size,
        content: buffer.toString('base64'), // optional
      },
      appliedAt: new Date(), // Ensure this is set
      status: 'Applied',
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      resumeUrl: publicUrl,
    });
  } catch (err: any) {
    console.error('API POST Error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit application', 
        details: err.message 
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}