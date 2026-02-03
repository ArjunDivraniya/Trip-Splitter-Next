import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const user = await User.findById(userId);

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Clean up Cloudinary assets
    if (user.publicId) await deleteFromCloudinary(user.publicId);
    if (user.qrPublicId) await deleteFromCloudinary(user.qrPublicId);

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}