import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import User from "@/models/User";
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
    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    // Check if user is the Creator (Only admin can add members)
    if (trip.createdBy.toString() !== userId) {
      return NextResponse.json({ message: "Only the admin can add members" }, { status: 403 });
    }

    // Check if already a member
    const isAlreadyMember = trip.members.some((m: any) => m.email === email);
    if (isAlreadyMember) {
        return NextResponse.json({ message: "User is already added or invited" }, { status: 400 });
    }

    // Find user ID if they exist in the system
    const existingUser = await User.findOne({ email });
    const newMemberId = existingUser ? existingUser._id : null;

    // Add to members list
    trip.members.push({
        email,
        userId: newMemberId,
        status: "invited"
    });

    await trip.save();

    // Notify the new member if they exist
    if (newMemberId) {
        await sendNotification(
            [newMemberId],
            userId,
            trip._id,
            `Invited you to join "${trip.name}"`,
            "invite"
        );
    }

    return NextResponse.json({ success: true, message: "Member invited successfully", data: trip });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}