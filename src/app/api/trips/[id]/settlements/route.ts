import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    // Verify user is logged in
    await getDataFromToken(request);
    const { id } = await context.params;

    // 1. Fetch Trip & Expenses
    const trip = await Trip.findById(id).populate("members.userId", "name email profileImage");
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    const expenses = await Expense.find({ trip: id })
      .populate("paidBy", "name")
      .populate("splitBetween", "name");

    // 2. Calculate Net Balances
    // Map: UserId -> Balance (Positive = Owed to them, Negative = They owe)
    const balances: Record<string, number> = {};
    const userDetails: Record<string, any> = {}; // Helper to store name/avatar

    // Initialize all members with 0 balance
    trip.members.forEach((m: any) => {
        if (m.userId) {
            const uid = m.userId._id.toString();
            balances[uid] = 0;
            userDetails[uid] = {
                name: m.userId.name,
                avatar: m.userId.profileImage,
                email: m.userId.email
            };
        }
    });
    // Add creator if missing
    const creatorId = trip.createdBy.toString();
    if (balances[creatorId] === undefined) {
        // We'd ideally fetch creator details here if populate didn't get them, 
        // but let's assume they are covered or we handle missing display gracefully
        balances[creatorId] = 0;
    }

    // Process every expense
    expenses.forEach((expense: any) => {
      const payerId = expense.paidBy._id.toString();
      const amount = expense.amount;
      const splitCount = expense.splitBetween.length;
      
      if (splitCount === 0) return;

      const splitAmount = amount / splitCount;

      // Payer gets +Amount (Total they paid)
      if (balances[payerId] !== undefined) {
          balances[payerId] += amount;
      }

      // Each split member gets -SplitAmount (Their share)
      expense.splitBetween.forEach((member: any) => {
          const mid = member._id.toString();
          if (balances[mid] !== undefined) {
              balances[mid] -= splitAmount;
          }
      });
    });

    // 3. Debt Simplification Algorithm
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    // Separate into two lists
    Object.entries(balances).forEach(([uid, balance]) => {
        // Round to 2 decimals to avoid floating point errors
        const net = Math.round(balance * 100) / 100;
        if (net < -0.01) debtors.push({ id: uid, amount: -net }); // Store as positive debt
        else if (net > 0.01) creditors.push({ id: uid, amount: net });
    });

    const settlements = [];

    // Greedy matching: Match biggest debtor with biggest creditor
    // This isn't always optimal (NP-hard), but efficient enough for trip splits
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(debtor.amount, creditor.amount);

        // Record transaction
        settlements.push({
            from: userDetails[debtor.id] || { name: "Unknown" },
            to: userDetails[creditor.id] || { name: "Unknown" },
            amount: Math.round(amount), // Round for display
        });

        // Update remaining amounts
        debtor.amount -= amount;
        creditor.amount -= amount;

        // Move indices if settled
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return NextResponse.json({
      success: true,
      data: settlements
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}