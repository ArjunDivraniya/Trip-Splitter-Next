import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { getDataFromToken } from "@/lib/getDataFromToken";

// GET Messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed: params is a Promise
) {
  try {
    await dbConnect();
    await getDataFromToken(request);

    // Await the params promise to get the ID
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
  context: { params: Promise<{ id: string }> } // Changed: params is a Promise
) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    
    // Await the params promise to get the ID
    const { id } = await context.params;
    
    const { content } = await request.json();

    const newMessage = await Message.create({
      trip: id,
      sender: userId,
      content
    });

    // Populate sender details immediately for the UI
    await newMessage.populate("sender", "name profileImage");

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}