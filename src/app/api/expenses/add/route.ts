import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Expense from "@/models/Expense";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendNotification } from "@/lib/notification"; // Import Helper

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    
    const reqBody = await request.json();
    const { tripId, title, amount, category, paidBy, splitBetween } = reqBody;

    if (!tripId || !title || !amount || !paidBy || !splitBetween || splitBetween.length === 0) {
      return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
    }

    const newExpense = new Expense({
      trip: tripId,
      title,
      amount: Number(amount),
      category,
      paidBy,
      splitBetween,
    });

    const savedExpense = await newExpense.save();

    await Trip.findByIdAndUpdate(tripId, {
      $push: { expenses: savedExpense._id }
    });

    // --- TRIGGER NOTIFICATION ---
    // Notify everyone involved in the split (except the one who performed the action)
    await sendNotification(
      splitBetween, 
      userId, 
      tripId, 
      `Added expense "${title}" of ₹${amount}`, 
      "expense"
    );
    // ---------------------------

    return NextResponse.json({
      message: "Expense added successfully",
      success: true,
      data: savedExpense
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}