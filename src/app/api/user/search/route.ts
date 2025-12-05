import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Verify auth (optional, but good for security)
    try {
      await getDataFromToken(request);
    } catch (error) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // Search by name or email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
    .select("name email profileImage _id")
    .limit(5);

    return NextResponse.json({ data: users });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}