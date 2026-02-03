import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getDataFromToken = async (request: NextRequest) => {
  try {
    // 1) Try app-specific token cookie first (fast, synchronous source)
    const appToken = request.cookies.get("token")?.value;
    if (appToken) {
      const decoded: any = jwt.verify(appToken, process.env.JWT_SECRET!);
      return decoded.userId || decoded.id || decoded.sub;
    }

    // 2) Fallback to NextAuth session via getServerSession
    const session = await getServerSession(authOptions);
    if (session && session.user && (session.user as any).id) {
      return (session.user as any).id;
    }

    // 3) Last-resort: try common next-auth session cookies (JWT strategy)
    const nextAuthToken = request.cookies.get("next-auth.session-token")?.value || request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (nextAuthToken) {
      const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
      const decoded: any = jwt.verify(nextAuthToken, secret!);
      return decoded.id || decoded.sub || decoded.user?.id;
    }

    throw new Error("No valid auth token found");
  } catch (error: any) {
    throw new Error(error?.message || "Invalid or expired token");
  }
};