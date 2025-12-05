import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PackingItem from "@/models/PackingItem";
import { getDataFromToken } from "@/lib/getDataFromToken";

// GET: Fetch all items for a trip
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    await getDataFromToken(request); // Verify Auth
    const { id } = await params;

    const items = await PackingItem.find({ trip: id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Add a new item
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await params;
    
    const { text, category } = await request.json();

    if (!text) {
        return NextResponse.json({ message: "Item name is required" }, { status: 400 });
    }

    const newItem = await PackingItem.create({
      trip: id,
      text,
      category: category || "Other",
      addedBy: userId
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Toggle checkbox status
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await getDataFromToken(request);
    const { itemId, isChecked } = await request.json();

    const updatedItem = await PackingItem.findByIdAndUpdate(
      itemId,
      { isChecked },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Remove an item
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        await getDataFromToken(request);
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get("itemId");

        if (!itemId) return NextResponse.json({ message: "Item ID required" }, { status: 400 });

        await PackingItem.findByIdAndDelete(itemId);

        return NextResponse.json({ success: true, message: "Item deleted" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}