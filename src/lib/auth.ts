import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    if (!token) throw new Error("Authentication token missing");

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch (error: any) {
    throw new Error(error.message);
  }
};