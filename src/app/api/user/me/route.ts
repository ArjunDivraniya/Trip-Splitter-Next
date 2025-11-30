import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}