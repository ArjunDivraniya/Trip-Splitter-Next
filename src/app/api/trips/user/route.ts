import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);

    // 1. Find trips where user is creator OR a member
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { "members.userId": userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("members.userId", "name profileImage");

    // 2. Fetch ALL expenses for these trips to calculate totals
    const tripIds = trips.map(t => t._id);
    const expenses = await Expense.find({ trip: { $in: tripIds } });

    // 3. Process expenses to calculate totals & balances
    const tripStats: Record<string, { total: number, balance: number }> = {};

    expenses.forEach((expense) => {
        const tid = expense.trip.toString();
        if (!tripStats[tid]) tripStats[tid] = { total: 0, balance: 0 };

        // Total Trip Expense
        tripStats[tid].total += expense.amount;

        // User Balance Calculation
        const paidById = expense.paidBy.toString();
        const splitCount = expense.splitBetween.length;
        const splitAmount = expense.amount / (splitCount || 1);

        // If current user paid, they "get back" this amount (Positive)
        if (paidById === userId) {
            tripStats[tid].balance += expense.amount;
        }

        // If current user is involved in split, they "owe" this share (Negative)
        const isInSplit = expense.splitBetween.some((id: any) => id.toString() === userId);
        if (isInSplit) {
            tripStats[tid].balance -= splitAmount;
        }
    });

    // 4. Merge stats into trip objects
    const tripsWithData = trips.map(trip => {
        const stats = tripStats[trip._id.toString()] || { total: 0, balance: 0 };
        
        // Determine status based on dates
        const now = new Date();
        let status = "ongoing";
        if (new Date(trip.endDate) < now) status = "completed";
        
        return {
            ...trip.toObject(),
            totalExpense: stats.total,
            yourBalance: Math.round(stats.balance) // Round for cleaner UI
        };
    });

    return NextResponse.json({
      success: true,
      data: tripsWithData
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}