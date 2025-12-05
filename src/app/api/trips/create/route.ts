import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const reqBody = await request.json();
    const { name, destination, startDate, endDate, members } = reqBody;

    if (!name || !destination || !startDate || !endDate) {
      return NextResponse.json({ message: "Please fill in all required fields" }, { status: 400 });
    }

    // Process Members: Look up User IDs for emails
    const memberList = await Promise.all(members.map(async (m: any) => {
      // Try to find user by email to link their ID immediately
      const existingUser = await User.findOne({ email: m.email });
      return {
        email: m.email,
        userId: existingUser ? existingUser._id : null, // Link ID if found
        status: "invited" // Pending acceptance
      };
    }));

    // Add creator as a joined member
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
      status: "active"
    });

    const savedTrip = await newTrip.save();

    return NextResponse.json({
      message: "Trip created successfully",
      success: true,
      tripId: savedTrip._id,
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}