import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Correct type: params is a Promise
) {
  try {
    await dbConnect();
    await getDataFromToken(request);
    
    // Await params to get the id
    const { id } = await context.params;

    const expenses = await Expense.find({ trip: id }).populate("paidBy", "name");

    // 1. Category Breakdown
    const categoryData: Record<string, number> = {};
    // 2. Spending by Member
    const memberSpending: Record<string, number> = {};
    
    let totalSpent = 0;

    expenses.forEach((expense: any) => {
      // Category Sum
      const cat = expense.category || "other";
      categoryData[cat] = (categoryData[cat] || 0) + expense.amount;

      // Member Sum
      const payerName = expense.paidBy.name;
      memberSpending[payerName] = (memberSpending[payerName] || 0) + expense.amount;

      totalSpent += expense.amount;
    });

    // Format for Recharts
    const pieData = Object.keys(categoryData).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: categoryData[key]
    }));

    const barData = Object.keys(memberSpending).map(key => ({
      name: key.split(" ")[0], // First name only
      amount: memberSpending[key]
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSpent,
        pieData,
        barData
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}