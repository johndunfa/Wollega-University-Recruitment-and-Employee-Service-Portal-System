// app/api/reports/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

// Define types
type LeaveStatus = 'Approved' | 'Rejected' | 'Pending' | 'Waiting for HR' | 'Waiting for Report';
type StartWorkStatus = 'leaved' | 'reported';

/**
 * Maps any variation of status to canonical LeaveStatus (case-insensitive)
 */
const mapToLeaveStatus = (status: any): LeaveStatus => {
  const value = String(status).trim().toLowerCase();
  if (['approved', 'approve', 'accept', 'accepted'].includes(value)) return 'Approved';
  if (['rejected', 'reject', 'denied'].includes(value)) return 'Rejected';
  if (['pending', 'in review'].includes(value)) return 'Pending';
  if (['wait for hr', 'waiting for hr', 'pending hr'].includes(value)) return 'Waiting for HR';
  if (['wait for report', 'waiting for report', 'pending report'].includes(value)) return 'Waiting for Report';
  return 'Pending'; // fallback
};

/**
 * Maps any variation of startWorkStatus to canonical value
 */
const mapToStartWorkStatus = (status: any): StartWorkStatus => {
  const value = String(status).trim().toLowerCase();
  if (['leaved', 'left', 'absent', 'on leave', 'not reported'].includes(value)) return 'leaved';
  if (['reported', 'back', 'returned', 'present', 'completed', 'returned to work'].includes(value)) return 'reported';
  return 'leaved'; // safe fallback
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // ✅ Use 'start' and 'end' to match frontend (e.g., ?start=2025-08-01&end=2025-08-31)
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build MongoDB filter using ACTUAL field names: startDate, endDate
    const filters: any = {};
    if (start) {
      filters.startDate = { $gte: new Date(start) };
    }
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59); // Include entire end day
      filters.endDate = { $lte: endDate };
    }

    await client.connect();
    const db = client.db();
    const collection = db.collection('leaves');

    // Fetch matching documents
    const leaves = await collection
      .find(filters)
      .sort({ appliedAt: -1 })
      .toArray();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize for date comparison

    // Initialize counters
    const statusCounts: Record<LeaveStatus, number> = {
      Approved: 0,
      Rejected: 0,
      Pending: 0,
      'Waiting for HR': 0,
      'Waiting for Report': 0,
    };

    const workStatusCounts: Record<StartWorkStatus, number> = {
      leaved: 0,
      reported: 0,
    };

    const periodStatusCounts = {
      Upcoming: 0,
      'On Leave': 0,
      Completed: 0,
    };

    // Process each leave
    const formattedLeaves = leaves.map(leave => {
      // ✅ Use actual DB fields: startDate, endDate
      const fromDate = new Date(leave.startDate);
      const toDate = new Date(leave.endDate);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      // Determine current work period status
      let workStatus: 'Upcoming' | 'On Leave' | 'Completed' = 'Completed';
      if (today > toDate) {
        workStatus = 'Completed';
      } else if (today < fromDate) {
        workStatus = 'Upcoming';
      } else {
        workStatus = 'On Leave';
      }

      // Normalize statuses (case-insensitive, flexible)
      const status = mapToLeaveStatus(leave.status);
      const startWorkStatus = mapToStartWorkStatus(leave.startWorkStatus);

      // Increment counters
      statusCounts[status]++;
      workStatusCounts[startWorkStatus]++;
      periodStatusCounts[workStatus]++;

      return {
        id: leave._id.toString(),
        employeeName: leave.employeeName || 'N/A',
        department: leave.department || 'Unknown',
        leaveType: leave.leaveType || 'Other',
        startDate: fromDate.toLocaleDateString(),
        endDate: toDate.toLocaleDateString(),
        status, // Now shows "Approved", not "pending"
        startWorkStatus, // Now shows "reported" if DB has "Reported"
        workStatus, // Upcoming / On Leave / Completed
        reason: leave.reason || '-',
      };
    });

    const total = formattedLeaves.length;
    const absenteeismRate = total > 0 ? ((total / 200 * 100).toFixed(1)) : '0'; // Replace 200 with real headcount

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total,
          status: statusCounts,
          startWorkStatus: workStatusCounts,
          workPeriodStatus: periodStatusCounts,
          absenteeismRate,
        },
        leaves: formattedLeaves,
        period: {
          start,
          end,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching attendance report:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leave data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}