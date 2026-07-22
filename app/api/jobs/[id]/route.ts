// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define a Mongoose schema for the Job model
const jobSchema = new mongoose.Schema({
  title: String,
  department: String,
  location: String,
  employmentType: String,
  experienceLevel: String,
  salaryRange: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  deadline: Date,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// ================== GET JOB ==================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params; // ✅ await here

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid job ID format' }, { status: 400 });
    }

    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    const jobObject = job.toObject();
    const serializedJob = {
      ...jobObject,
      _id: jobObject._id.toString(),
      deadline: jobObject.deadline
        ? new Date(jobObject.deadline).toISOString().split('T')[0]
        : ''
    };

    return NextResponse.json(serializedJob, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// ================== UPDATE JOB ==================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params; // ✅ await here

    const {
      title,
      department,
      location,
      employmentType,
      experienceLevel,
      salaryRange,
      description,
      requirements,
      responsibilities,
      benefits,
      deadline,
      status
    } = await request.json();

    if (!title || !department || !location || !employmentType || !experienceLevel || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid job ID format' }, { status: 400 });
    }

    // Convert string ↔ array fields
    const processArrayField = (field: any): string[] => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        return field
          .split('\n')
          .filter((item: string) => item.trim() !== '')
          .map((item: string) => item.trim());
      }
      return [];
    };

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title,
        department,
        location,
        employmentType,
        experienceLevel,
        salaryRange,
        description,
        requirements: processArrayField(requirements),
        responsibilities: processArrayField(responsibilities),
        benefits: processArrayField(benefits),
        deadline: deadline ? new Date(deadline) : null,
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// ================== DELETE JOB ==================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params; // ✅ await here

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid job ID format' }, { status: 400 });
    }

    const deleteResult = await Job.findByIdAndDelete(id);

    if (!deleteResult) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

  