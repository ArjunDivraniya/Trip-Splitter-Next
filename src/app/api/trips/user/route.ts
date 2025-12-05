import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);

    // Find trips where user is creator OR a member
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { "members.userId": userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("members.userId", "name profileImage"); // Get member details

    return NextResponse.json({
      success: true,
      data: trips
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}