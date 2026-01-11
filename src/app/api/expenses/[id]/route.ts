import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Expense from "@/models/Expense";
import Trip from "@/models/Trip";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendNotification } from "@/lib/notification";

// UPDATE Expense
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Check if the current user is the one who paid (creator of expense)
    if (expense.paidBy.toString() !== userId) {
      return NextResponse.json({ message: "Only the expense creator can edit this expense" }, { status: 403 });
    }

    const reqBody = await request.json();
    const { title, amount, category, splitBetween, splitType, splitAmounts, splitPercentages, splitShares, paidById } = reqBody;

    if (!title || !amount || !splitBetween || splitBetween.length === 0) {
      return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
    }

    // Update expense
    expense.title = title;
    expense.amount = Number(amount);
    expense.category = category;
    expense.splitBetween = splitBetween;
    expense.splitType = splitType || "equally";
    
    if (splitAmounts) {
      expense.splitAmounts = splitAmounts;
    }
    if (splitPercentages) {
      expense.splitPercentages = splitPercentages;
    }
    if (splitShares) {
      expense.splitShares = splitShares;
    }

    await expense.save();

    // Send notification
    await sendNotification(
      splitBetween,
      userId,
      expense.trip.toString(),
      `Updated expense "${title}" to ₹${amount}`,
      "expense"
    );

    return NextResponse.json({
      message: "Expense updated successfully",
      success: true,
      data: expense
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE Expense
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = await getDataFromToken(request);
    const { id } = await params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Check if the current user is the one who paid (creator of expense)
    if (expense.paidBy.toString() !== userId) {
      return NextResponse.json({ message: "Only the expense creator can delete this expense" }, { status: 403 });
    }

    const tripId = expense.trip;
    const expenseTitle = expense.title;

    // Remove expense from trip's expenses array
    await Trip.findByIdAndUpdate(tripId, {
      $pull: { expenses: id }
    });

    // Delete the expense
    await Expense.findByIdAndDelete(id);

    // Send notification
    await sendNotification(
      expense.splitBetween,
      userId,
      tripId.toString(),
      `Deleted expense "${expenseTitle}"`,
      "expense"
    );

    return NextResponse.json({
      message: "Expense deleted successfully",
      success: true
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
