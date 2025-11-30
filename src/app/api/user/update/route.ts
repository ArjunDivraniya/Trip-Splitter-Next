import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);
    const reqBody = await request.json();
    const { name, email, phone } = reqBody;

    // Check if email belongs to another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: "Profile updated", data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}