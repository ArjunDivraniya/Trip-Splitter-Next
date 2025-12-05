import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendNotification } from "@/lib/notification"; // Import Helper

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);
    const reqBody = await request.json();
    const { name, destination, startDate, endDate, members } = reqBody;

    if (!name || !destination || !startDate || !endDate) {
      return NextResponse.json({ message: "Please fill in all required fields" }, { status: 400 });
    }

    const memberList = members.map((m: any) => ({
      email: m.email,
      userId: m.userId || null,
      status: "invited"
    }));

    const creator = await User.findById(userId);
    if (creator) {
      const isCreatorAdded = memberList.some((m: any) => m.email === creator.email);
      if (!isCreatorAdded) {
          memberList.push({ email: creator.email, userId: creator._id, status: "joined" });
      }
    }

    const newTrip = new Trip({
      name,
      destination,
      startDate,
      endDate,
      createdBy: userId,
      members: memberList,
    });

    const savedTrip = await newTrip.save();

    // --- TRIGGER NOTIFICATION ---
    // Get all valid user IDs excluding the creator
    const recipientIds = memberList
      .filter((m: any) => m.userId && m.userId.toString() !== userId)
      .map((m: any) => m.userId);

    if (recipientIds.length > 0) {
      await sendNotification(
        recipientIds,
        userId,
        savedTrip._id,
        `Invited you to join "${name}" to ${destination}`,
        "invite"
      );
    }
    // ---------------------------

    return NextResponse.json({
      message: "Trip created successfully",
      success: true,
      tripId: savedTrip._id,
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}