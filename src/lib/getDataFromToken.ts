import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    // Try getting token from Authorization header (Bearer token) or Cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1] || ""; // Bearer <token>
    
    if (!token) throw new Error("No token found");

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decodedToken.userId;
  } catch (error: any) {
    throw new Error("Invalid Token");
  }
};