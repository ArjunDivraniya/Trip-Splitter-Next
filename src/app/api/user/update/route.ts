import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request); // Await this just in case
    const reqBody = await request.json();
    const { name, phone } = reqBody; // Don't allow email update here for security

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: "Profile updated", data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}