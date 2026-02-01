import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false,
        message: "No session found"
      });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: session.user,
        expiresAt: session.expires,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      authenticated: false
    }, { status: 500 });
  }
}
