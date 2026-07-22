import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { Types } from "mongoose";

interface NotificationParams {
  id: string;
}

interface UpdateResult {
  isRead: boolean;
  readAt: Date;
}

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: Request,
  { params }: { params: NotificationParams }
): Promise<NextResponse> {
  try {
    const { id } = params;

    // Validate the ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID format" },
        { status: 400 }
      );
    }

    console.log(`Marking notification ${id} as read`);

    // Connect to database
    await connectToDatabase();

    // Prepare update data
    const updateData: UpdateResult = {
      isRead: true,
      readAt: new Date(),
    };

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true, runValidators: true }
    ).lean() as { _id: string; isRead: boolean; readAt: Date } | null;

    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      data: {
        id: updatedNotification._id,
        isRead: updatedNotification.isRead,
        readAt: updatedNotification.readAt,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
/*
export async function GET(
  request: Request,
  { params }: { params: NotificationParams }
) {
  // Implementation for GET requests
}

export async function DELETE(
  request: Request,
  { params }: { params: NotificationParams }
) {
  // Implementation for DELETE requests
}
*/