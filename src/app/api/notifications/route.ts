import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getDataFromToken } from "@/lib/getDataFromToken";

// GET: Fetch User Notifications
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "name profileImage")
      .populate("trip", "name")
      .limit(50);

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Mark all as read
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, message: "All marked as read" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}