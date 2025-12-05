import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Activity from "@/models/Activity";
import Trip from "@/models/Trip"; // Need trip to get members
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendNotification } from "@/lib/notification"; // Import Helper

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await getDataFromToken(request);
    const { id } = await params;

    const activities = await Activity.find({ trip: id }).sort({ date: 1, time: 1 });
    return NextResponse.json({ success: true, data: activities });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await params;
    const reqBody = await request.json();

    const activity = await Activity.create({
      trip: id,
      createdBy: userId,
      ...reqBody
    });

    // --- TRIGGER NOTIFICATION ---
    const trip = await Trip.findById(id);
    if (trip) {
      const memberIds = trip.members
        .filter((m: any) => m.userId && m.userId.toString() !== userId)
        .map((m: any) => m.userId);

      await sendNotification(
        memberIds,
        userId,
        id,
        `Added activity: ${reqBody.title}`,
        "activity"
      );
    }
    // ---------------------------

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}