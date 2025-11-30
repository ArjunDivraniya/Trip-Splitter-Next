import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ message: "No file found" }, { status: 400 });

    const user = await User.findById(userId);

    if (user.qrPublicId) {
      await deleteFromCloudinary(user.qrPublicId);
    }

    const result: any = await uploadToCloudinary(file, "trip-splitter-qr");
    
    user.qrCode = result.secure_url;
    user.qrPublicId = result.public_id;
    await user.save();

    return NextResponse.json({ message: "QR Code uploaded", data: user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}