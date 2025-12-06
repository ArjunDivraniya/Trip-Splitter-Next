import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { getDataFromToken } from "@/lib/getDataFromToken";

// GET Messages
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await getDataFromToken(request);
    const { id } = await context.params;

    const messages = await Message.find({ trip: id })
      .sort({ createdAt: 1 })
      .populate("sender", "name profileImage");

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST Message
export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await context.params;
    const { content } = await request.json();

    const newMessage = await Message.create({
      trip: id,
      sender: userId,
      content
    });

    // Re-fetch to ensure populate works correctly and returns full sender details
    const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name profileImage");

    return NextResponse.json({ success: true, data: populatedMessage });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}