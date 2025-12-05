import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = getDataFromToken(request);
    const { id } = await params;

    // 1. Fetch Trip & Members
    const trip = await Trip.findById(id)
      .populate("members.userId", "name email profileImage")
      .populate("createdBy", "name email profileImage");

    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    // 2. Fetch Expenses with deep population
    const expenses = await Expense.find({ trip: id })
      .populate("paidBy", "name")
      .populate("splitBetween", "name") // Fetch names of split members
      .sort({ date: -1 });

    // 3. Calculate Balances (Logic remains same as before)
    let totalTripExpense = 0;
    const memberBalances: Record<string, number> = {};

    // Initialize balances
    trip.members.forEach((m: any) => {
        if (m.userId) memberBalances[m.userId._id.toString()] = 0;
    });
    const creatorId = trip.createdBy._id.toString();
    if (memberBalances[creatorId] === undefined) memberBalances[creatorId] = 0;

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

    // 4. Format Expenses for UI (Specific Format Requested)
    const formattedExpenses = expenses.map((e: any) => {
      const splitNames = e.splitBetween.map((u: any) => u.name.split(" ")[0]); // Get first names
      const perPerson = e.amount / (e.splitBetween.length || 1);

      return {
        id: e._id,
        title: e.title,
        amount: e.amount,
        category: e.category,
        paidBy: e.paidBy.name, // Name of payer
        splitNames: splitNames.join(", "), // "Arjun, Krish, Priya"
        perPerson: Math.round(perPerson), // 100
        date: new Date(e.date).toLocaleDateString(),
      };
    });

    // Format Members
    const formattedMembers = trip.members.map((m: any) => ({
      id: m.userId?._id || "unknown",
      name: m.userId?.name || m.email,
      avatar: m.userId?.profileImage || "",
      balance: memberBalances[m.userId?._id.toString()] || 0
    }));

    // Add creator to members list if not there (for dropdowns)
    const isCreatorInMembers = formattedMembers.some((m: any) => m.id === creatorId);
    if (!isCreatorInMembers) {
        formattedMembers.push({
            id: trip.createdBy._id,
            name: trip.createdBy.name,
            avatar: trip.createdBy.profileImage,
            balance: memberBalances[creatorId] || 0
        });
    }

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
        members: formattedMembers,
        expenses: formattedExpenses,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}