import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request); // User requesting the data
    const { id } = await params;

    // 1. Fetch Trip
    const trip = await Trip.findById(id)
      .populate("members.userId", "name email profileImage")
      .populate("createdBy", "name email profileImage");

    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    // 2. Fetch Expenses
    const expenses = await Expense.find({ trip: id })
      .populate("paidBy", "name")
      .populate("splitBetween", "name")
      .sort({ date: -1 });

    // 3. Calculate Balances
    let totalTripExpense = 0;
    const memberBalances: Record<string, number> = {};

    // Initialize balances ONLY for joined members and creator
    const creatorId = trip.createdBy._id.toString();
    memberBalances[creatorId] = 0;

    trip.members.forEach((m: any) => {
        // Only include members who have ACCEPTED the invite
        if (m.userId && m.status === "joined") {
            memberBalances[m.userId._id.toString()] = 0;
        }
    });

    expenses.forEach((expense: any) => {
      totalTripExpense += expense.amount;
      const payerId = expense.paidBy._id.toString();
      const splitCount = expense.splitBetween.length;
      const splitAmount = expense.amount / (splitCount || 1);

      if (memberBalances[payerId] !== undefined) memberBalances[payerId] += expense.amount;

      expense.splitBetween.forEach((u: any) => {
        const uString = u._id.toString();
        if (memberBalances[uString] !== undefined) memberBalances[uString] -= splitAmount;
      });
    });

    // 4. Format Members (Only Joined + Creator)
    const activeMembers = trip.members
        .filter((m: any) => m.status === "joined" && m.userId)
        .map((m: any) => ({
            id: m.userId._id.toString(),
            name: m.userId.name,
            email: m.email,
            avatar: m.userId.profileImage || "",
            balance: memberBalances[m.userId._id.toString()] || 0,
            status: "joined"
        }));

    // Ensure creator is in the list
    if (!activeMembers.some((m: any) => m.id === creatorId)) {
        activeMembers.push({
            id: creatorId,
            name: trip.createdBy.name,
            avatar: trip.createdBy.profileImage,
            email: trip.createdBy.email,
            balance: memberBalances[creatorId] || 0,
            status: "joined"
        });
    }

    // 5. Format Expenses
    const formattedExpenses = expenses.map((e: any) => ({
      id: e._id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      paidBy: e.paidBy.name,
      splitNames: e.splitBetween.map((u: any) => u.name.split(" ")[0]).join(", "),
      perPerson: Math.round(e.amount / (e.splitBetween.length || 1)),
      date: new Date(e.date).toLocaleDateString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: trip._id,
        name: trip.name,
        location: trip.destination,
        startDate: new Date(trip.startDate).toDateString(),
        endDate: new Date(trip.endDate).toDateString(),
        totalExpense: totalTripExpense,
        yourBalance: memberBalances[userId] || 0,
        status: trip.status, 
        members: activeMembers, // Only active members returned here
        expenses: formattedExpenses,
        isCreator: userId === creatorId,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}