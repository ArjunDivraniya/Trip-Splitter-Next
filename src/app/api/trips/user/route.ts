import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);

    // Find trips
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { "members.userId": userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("members.userId", "name profileImage"); // Populate for avatars

    // Calculate totals (Same as before)
    const tripIds = trips.map(t => t._id);
    const expenses = await Expense.find({ trip: { $in: tripIds } });

    const tripStats: Record<string, { total: number, balance: number }> = {};
    expenses.forEach((expense) => {
        const tid = expense.trip.toString();
        if (!tripStats[tid]) tripStats[tid] = { total: 0, balance: 0 };
        tripStats[tid].total += expense.amount;

        const paidById = expense.paidBy.toString();
        const splitCount = expense.splitBetween.length;
        const splitAmount = expense.amount / (splitCount || 1);

        if (paidById === userId) tripStats[tid].balance += expense.amount;
        const isInSplit = expense.splitBetween.some((id: any) => id.toString() === userId);
        if (isInSplit) tripStats[tid].balance -= splitAmount;
    });

    // Format data with USER STATUS
    const tripsWithData = trips.map(trip => {
        const stats = tripStats[trip._id.toString()] || { total: 0, balance: 0 };
        
        // Check current user's status in this trip
        let userStatus = "joined"; // Default for creator
        if (trip.createdBy.toString() !== userId) {
            const memberRecord = trip.members.find((m: any) => m.userId?._id.toString() === userId);
            userStatus = memberRecord ? memberRecord.status : "invited";
        }

        return {
            ...trip.toObject(),
            totalExpense: stats.total,
            yourBalance: Math.round(stats.balance),
            userStatus: userStatus, // 'invited' or 'joined'
            isAdmin: trip.createdBy.toString() === userId
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