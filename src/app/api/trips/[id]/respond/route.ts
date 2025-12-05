import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendNotification } from "@/lib/notification";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await context.params;
    const { action } = await request.json(); // action: 'accept' | 'reject'

    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    // Find the member entry for this user
    const memberIndex = trip.members.findIndex((m: any) => 
      m.userId && m.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return NextResponse.json({ message: "You are not invited to this trip" }, { status: 403 });
    }

    if (action === "accept") {
      // Update status to 'joined'
      trip.members[memberIndex].status = "joined";
      await trip.save();

      // Notify Admin
      await sendNotification(
        [trip.createdBy],
        userId,
        trip._id,
        "Accepted your trip invitation",
        "system"
      );

      return NextResponse.json({ success: true, message: "Invitation accepted" });

    } else if (action === "reject") {
      // Remove member from the list
      trip.members.splice(memberIndex, 1);
      await trip.save();

      return NextResponse.json({ success: true, message: "Invitation rejected" });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}