import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    // Delete old image if exists
    if (user.publicId) {
      await deleteFromCloudinary(user.publicId);
    }

    // Upload new image
    const result: any = await uploadToCloudinary(file, "trip-splitter-profiles");
    
    user.profileImage = result.secure_url;
    user.publicId = result.public_id;
    await user.save();

    return NextResponse.json({ message: "Image uploaded", data: user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}