import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    // 1. Find user & include password for checking
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    // 2. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 4. Create Response
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });

    // 5. CRITICAL FIX: Set the Token in a Cookie
    // This allows the browser to send it automatically to /api/user/me
    response.cookies.set("token", token, {
      httpOnly: true, // Secure: JavaScript cannot read this
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}