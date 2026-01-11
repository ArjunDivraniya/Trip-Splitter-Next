import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
// Import all models at once to ensure proper registration
import { User, Trip, Expense } from "@/models";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    let userId: string;
    try {
      userId = await getDataFromToken(request);
    } catch (error: any) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await context.params;

    // 1. Fetch Trip and all expenses
    const trip = await Trip.findById(id)
      .populate("members.userId", "name email profileImage")
      .populate("createdBy", "name email profileImage");
    
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    const expenses = await Expense.find({ trip: id })
      .populate("paidBy", "name profileImage email")
      .populate("splitBetween", "name profileImage email");

    // 2. Initialize Direct Debts Matrix (in Paise for precision)
    // debts[A][B] = amount A owes B (in paise)
    const debts: Record<string, Record<string, number>> = {};
    const userDetails: Record<string, any> = {};

    const registerUser = (user: any) => {
      if (!user) return;
      const uid = user._id.toString();
      if (!debts[uid]) {
        debts[uid] = {};
        userDetails[uid] = {
          id: uid,
          name: user.name,
          avatar: user.profileImage,
          email: user.email,
        };
      }
    };

    // Register all participants
    registerUser(trip.createdBy);
    trip.members.forEach((m: any) => {
      if (m.status === "joined") registerUser(m.userId);
    });

    console.log(`\n[Settlement ${id}] Calculating Direct Debts:`);
    console.log(`  - Registered users: ${Object.keys(debts).length}`);
    console.log(`  - Expenses to process: ${expenses.length}`);

    // 3. CORE CALCULATION: Track direct debts from each expense
    // For each expense, beneficiaries owe the payer their share
    expenses.forEach((expense: any) => {
      const amountPaise = Math.round(Number(expense.amount) * 100);
      const payerId = expense.paidBy._id.toString();
      
      registerUser(expense.paidBy);

      const beneficiaries = expense.splitBetween.map((u: any) => {
        const uid = u._id.toString();
        registerUser(u);
        return uid;
      });

      if (beneficiaries.length === 0) {
        console.warn(`⚠️  Skipping expense "${expense.title}" - no beneficiaries`);
        return;
      }

      console.log(`  Expense: "${expense.title}" ₹${expense.amount} paid by ${expense.paidBy.name}, split ${beneficiaries.length} ways (${expense.splitType || 'equally'})`);

      // Calculate share for each beneficiary based on split type
      beneficiaries.forEach((beneficiaryId: string, index: number) => {
        if (beneficiaryId === payerId) {
          // Payer is also a beneficiary - they don't owe themselves
          return;
        }

        let sharePaise = 0;
        
        // Check if custom split amounts exist
        if (expense.splitAmounts && expense.splitAmounts.get && expense.splitAmounts.get(beneficiaryId)) {
          // Use custom amount from splitAmounts
          sharePaise = Math.round(expense.splitAmounts.get(beneficiaryId) * 100);
        } else {
          // Default to equal split
          const baseShare = Math.floor(amountPaise / beneficiaries.length);
          const remainder = amountPaise % beneficiaries.length;
          sharePaise = baseShare + (index < remainder ? 1 : 0);
        }
        
        // Initialize debt tracking if needed
        if (!debts[beneficiaryId]) debts[beneficiaryId] = {};
        if (!debts[beneficiaryId][payerId]) debts[beneficiaryId][payerId] = 0;
        
        // Beneficiary owes payer this share
        debts[beneficiaryId][payerId] += sharePaise;

        const beneficiaryName = userDetails[beneficiaryId]?.name || beneficiaryId.substring(0, 8);
        console.log(`    ${beneficiaryName} owes ${expense.paidBy.name}: +₹${(sharePaise / 100).toFixed(2)}`);
      });
    });

    console.log(`\n[Settlement ${id}] Debt Netting:`);

    // 4. DEBT NETTING: If A owes B and B owes A, subtract the smaller amount
    // This simplifies the debts to show only net amounts
    const allUserIds = Object.keys(debts);
    
    for (let i = 0; i < allUserIds.length; i++) {
      for (let j = i + 1; j < allUserIds.length; j++) {
        const userA = allUserIds[i];
        const userB = allUserIds[j];
        
        const aOwesB = debts[userA]?.[userB] || 0;
        const bOwesA = debts[userB]?.[userA] || 0;
        
        if (aOwesB > 0 && bOwesA > 0) {
          // Both owe each other - net them out
          const netAmount = Math.abs(aOwesB - bOwesA);
          const creditor = aOwesB > bOwesA ? userB : userA;
          const debtor = aOwesB > bOwesA ? userA : userB;
          
          const nameA = userDetails[userA]?.name || userA.substring(0, 8);
          const nameB = userDetails[userB]?.name || userB.substring(0, 8);
          console.log(`    Netting: ${nameA} ↔ ${nameB}: ₹${(aOwesB/100).toFixed(2)} vs ₹${(bOwesA/100).toFixed(2)} = ${userDetails[debtor]?.name} owes ${userDetails[creditor]?.name} ₹${(netAmount/100).toFixed(2)}`);
          
          // Clear both debts
          if (debts[userA]) debts[userA][userB] = 0;
          if (debts[userB]) debts[userB][userA] = 0;
          
          // Set the net debt
          if (!debts[debtor]) debts[debtor] = {};
          debts[debtor][creditor] = netAmount;
        }
      }
    }

    // 5. Format Final Settlements
    const settlements: any[] = [];
    
    Object.entries(debts).forEach(([debtorId, creditors]) => {
      Object.entries(creditors).forEach(([creditorId, amountPaise]) => {
        if (amountPaise > 0) {
          settlements.push({
            from: userDetails[debtorId],
            to: userDetails[creditorId],
            amount: Number((amountPaise / 100).toFixed(2)),
            amountPaise: amountPaise, // Keep for validation
          });
        }
      });
    });

    console.log(`\n[Settlement ${id}] Final Settlements:`);
    console.log(`  - Total settlements: ${settlements.length}`);
    settlements.forEach((s, idx) => {
      console.log(`    ${idx + 1}. ${s.from.name} → ${s.to.name}: ₹${s.amount}`);
    });

    // 6. Validation: Verify debts balance out
    const totalDebts = settlements.reduce((sum, s) => sum + s.amountPaise, 0);
    console.log(`  - Total debt amount (validation): ₹${(totalDebts / 100).toFixed(2)}`);

    // Remove amountPaise from response (internal use only)
    const cleanSettlements = settlements.map(({ from, to, amount }) => ({ from, to, amount }));

    console.log(`✓ Direct debt settlement calculation complete\n`);

    return NextResponse.json({
      success: true,
      data: cleanSettlements
    });

  } catch (error: any) {
    console.error("Settlement Logic Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}