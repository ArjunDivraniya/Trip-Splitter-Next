import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // CHANGED: params is a Promise
) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    
    // Await params to get ID
    const { id } = await context.params;

    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    // Check if user is the Creator
    if (trip.createdBy.toString() !== userId) {
      return NextResponse.json({ message: "Only the admin can end this trip" }, { status: 403 });
    }

    trip.status = "completed";
    await trip.save();

    return NextResponse.json({ success: true, message: "Trip ended successfully", data: trip });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}