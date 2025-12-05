import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    // CRITICAL FIX: Read token from Cookies, NOT just headers
    const token = request.cookies.get("token")?.value || "";
    
    if (!token) {
        throw new Error("No token found in cookies");
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decodedToken.userId;
    
  } catch (error: any) {
    throw new Error("Invalid or Expired Token");
  }
};