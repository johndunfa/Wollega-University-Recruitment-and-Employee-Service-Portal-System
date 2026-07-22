// app/api/leave/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Leave from '../../../../models/Leave';
import { isValidObjectId } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('[API] Database connection failed:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Server is unable to connect to the database.',
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid JSON in request body.',
      },
      { status: 400 }
    );
  }

  const { employeeId, leaveRequestId } = body;

  // ✅ Input validation
  if (!employeeId || typeof employeeId !== 'string' || !employeeId.trim()) {
    return NextResponse.json(
      { success: false, message: 'Valid employeeId is required.' },
      { status: 400 }
    );
  }

  if (!leaveRequestId || typeof leaveRequestId !== 'string' || !leaveRequestId.trim()) {
    return NextResponse.json(
      { success: false, message: 'Valid leaveRequestId is required.' },
      { status: 400 }
    );
  }

  if (!isValidObjectId(leaveRequestId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid leave request ID format.' },
      { status: 400 }
    );
  }

  try {
    // 🔍 Find the document (Mongoose document, not plain object)
    const leaveDoc = await Leave.findOne({
      _id: leaveRequestId,
      employeeId,
    });

    if (!leaveDoc) {
      return NextResponse.json(
        {
          success: false,
          message: 'Leave request not found or unauthorized.',
        },
        { status: 404 }
      );
    }

    // ❌ Only approved leaves can be reported
    if (leaveDoc.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only approved leaves can be reported.',
        },
        { status: 400 }
      );
    }

    // ❌ Prevent double reporting
    if (leaveDoc.startWorkStatus === 'reported') {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already reported your return.',
        },
        { status: 400 }
      );
    }

    // 📆 Set today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Update fields directly
    leaveDoc.actualReturnDate = today;
    leaveDoc.report = leaveDoc.report || 'Return reported.';
    leaveDoc.startWorkStatus = 'reported';

    // 🛠️ Explicitly mark fields as modified (critical for nested updates)
    leaveDoc.markModified('actualReturnDate');
    leaveDoc.markModified('report');
    leaveDoc.markModified('startWorkStatus');

    // 💾 Save back to database — await and catch any DB error
    const savedDoc = await leaveDoc.save();

    // ✅ Log to confirm persistence
    console.log('[DB] Successfully updated leave:', {
      _id: savedDoc._id,
      actualReturnDate: savedDoc.actualReturnDate,
      report: savedDoc.report,
      startWorkStatus: savedDoc.startWorkStatus,
    });

    // ✅ Return success with updated data
    return NextResponse.json(
      {
        success: true,
        message: 'Return reported and saved successfully.',
        data: {
          actualReturnDate: savedDoc.actualReturnDate?.toISOString(),
          report: savedDoc.report,
          startWorkStatus: savedDoc.startWorkStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Failed to report return:', error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: `Validation error: ${error.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to report return. Please try again later.',
      },
      { status: 500 }
    );
  }
}