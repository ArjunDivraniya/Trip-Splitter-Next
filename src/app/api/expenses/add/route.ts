import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Expense from "@/models/Expense";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request); // Ensure user is logged in
    
    const reqBody = await request.json();
    const { tripId, title, amount, category, paidBy, splitBetween } = reqBody;

    // Validation
    if (!tripId || !title || !amount || !paidBy || !splitBetween || splitBetween.length === 0) {
      return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
    }

    // Create Expense
    const newExpense = new Expense({
      trip: tripId,
      title,
      amount: Number(amount),
      category,
      paidBy, // This is a User ID
      splitBetween, // Array of User IDs
    });

    const savedExpense = await newExpense.save();

    // Link Expense to Trip
    await Trip.findByIdAndUpdate(tripId, {
      $push: { expenses: savedExpense._id }
    });

    return NextResponse.json({
      message: "Expense added successfully",
      success: true,
      data: savedExpense
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}