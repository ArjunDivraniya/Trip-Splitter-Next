import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import User from "@/models/User";
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

    // 1. Fetch Trip with all relationships
    const trip = await Trip.findById(id)
      .populate("members.userId", "name email profileImage")
      .populate("createdBy", "name email profileImage");
    
    if (!trip) return NextResponse.json({ message: "Trip not found" }, { status: 404 });

    const expenses = await Expense.find({ trip: id })
      .populate("paidBy", "name profileImage")
      .populate("splitBetween", "name profileImage");

    // 2. Calculate Net Balances using TOTAL PAID vs TOTAL SHARE methodology
    const totalPaid: Record<string, number> = {}; // in paise
    const totalShare: Record<string, number> = {}; // in paise
    const netBalances: Record<string, number> = {}; // in paise
    const userDetails: Record<string, any> = {};
    const userRegistry: Set<string> = new Set();

    // Helper to register a member (only joined members)
    const registerUser = (user: any, status?: string) => {
      if (!user) return null;
      if (status && status !== "joined") return null;
      
      const uid = user._id.toString();
      if (!userRegistry.has(uid)) {
        userRegistry.add(uid);
        totalPaid[uid] = 0;
        totalShare[uid] = 0;
        userDetails[uid] = {
          name: user.name,
          avatar: user.profileImage,
          email: user.email,
        };
      }
      return uid;
    };

    // Register creator (always joined) and all joined members
    registerUser(trip.createdBy, "joined");
    trip.members.forEach((m: any) => registerUser(m.userId, m.status));

    // Process every expense - Calculate TOTAL PAID and TOTAL SHARE
    expenses.forEach((expense: any) => {
      const amount = Number(expense.amount);
      const amountPaise = Math.round(amount * 100);
      const payerId = expense.paidBy._id.toString();

      // IMPORTANT: Ensure payer is registered (they might not be in members list initially)
      if (!userRegistry.has(payerId)) {
        console.warn(`⚠️  [Settlement] Registering payer ${expense.paidBy.name} who wasn't in initial members list`);
        registerUser(expense.paidBy, "joined");
      }

      // Get beneficiaries (only registered joined members)
      const beneficiaries = expense.splitBetween
        .map((u: any) => {
          const uid = u._id.toString();
          // Ensure all beneficiaries are registered
          if (!userRegistry.has(uid)) {
            console.warn(`⚠️  [Settlement] Registering beneficiary ${u.name} who wasn't in initial members list`);
            registerUser(u, "joined");
          }
          return uid;
        })
        .filter((uid: string) => userRegistry.has(uid));

      if (beneficiaries.length === 0) {
        console.warn(`⚠️  [Settlement] Skipping expense "${expense.title}" - no valid beneficiaries`);
        return; // Skip invalid expenses
      }

      // Calculate per-head share with fair rounding
      const splitCount = beneficiaries.length;
      const baseSharePaise = Math.floor(amountPaise / splitCount);
      const remainderPaise = amountPaise - (baseSharePaise * splitCount);

      // Update TOTAL PAID for payer
      if (userRegistry.has(payerId)) {
        totalPaid[payerId] += amountPaise;
      }

      // Update TOTAL SHARE for each beneficiary
      beneficiaries.forEach((beneficiaryId: string, idx: number) => {
        const share = baseSharePaise + (idx < remainderPaise ? 1 : 0);
        totalShare[beneficiaryId] += share;
      });

      // Log each expense processing
      console.log(`  [Settlement] Expense: "${expense.title}" ₹${amount} paid by ${expense.paidBy.name}, split among ${beneficiaries.length} people`);
    });

    // Calculate NET BALANCE for each member
    // netBalance = totalPaid - totalShare
    // Positive = they should RECEIVE, Negative = they should PAY
    userRegistry.forEach((userId) => {
      netBalances[userId] = totalPaid[userId] - totalShare[userId];
    });

    // Validation: Sum of all balances MUST be 0
    const balanceSum = Object.values(netBalances).reduce((sum, bal) => sum + bal, 0);
    console.log(`[Settlement ${id}] Balance Calculation:`);
    console.log(`  - Registered users: ${userRegistry.size}`);
    console.log(`  - Expenses processed: ${expenses.length}`);
    console.log(`  - Balance sum (paise): ${balanceSum} (${(balanceSum/100).toFixed(2)} rupees)`);
    Object.entries(netBalances).forEach(([uid, bal]) => {
      const rupees = (bal / 100).toFixed(2);
      const userName = userDetails[uid]?.name || 'Unknown';
      console.log(`    ${userName}: ${bal > 0 ? '+' : ''}${rupees} (${bal > 0 ? '+' : ''}${bal} paise)`);
    });
    if (Math.abs(balanceSum) > 1) {
      console.warn(`⚠️  Settlement validation warning: sum is ${balanceSum} paise (should be 0)`);
    } else {
      console.log(`✓ Settlement validation passed`);
    }

    // 3. Production-Grade Greedy Settlement Algorithm
    // Separate into receivers (positive balance) and payers (negative balance)
    const receivers: Array<{ id: string; amount: number }> = [];
    const payers: Array<{ id: string; amount: number }> = [];

    Object.entries(netBalances).forEach(([userId, balance]) => {
      if (balance > 1) { // More than 1 paisa to receive
        receivers.push({ id: userId, amount: balance });
      } else if (balance < -1) { // More than 1 paisa to pay
        payers.push({ id: userId, amount: -balance }); // Store as positive
      }
    });

    // Sort largest first for optimal greedy matching
    receivers.sort((a, b) => b.amount - a.amount);
    payers.sort((a, b) => b.amount - a.amount);

    const settlements = [];

    // Greedy matching: Match payers with receivers to minimize transactions
    let payerIdx = 0;
    let receiverIdx = 0;

    while (payerIdx < payers.length && receiverIdx < receivers.length) {
      const payer = payers[payerIdx];
      const receiver = receivers[receiverIdx];

      // Validate no self-payment
      if (payer.id === receiver.id) {
        console.error("Critical error: Self-payment detected");
        receiverIdx++;
        continue;
      }

      // Settlement amount is minimum of what payer owes and receiver is owed
      const settlementAmount = Math.min(payer.amount, receiver.amount);

      if (settlementAmount <= 0) {
        console.error("Critical error: Non-positive settlement amount");
        break;
      }

      // Record transaction
      settlements.push({
        from: userDetails[payer.id] || { name: "Unknown", email: "", avatar: "" },
        to: userDetails[receiver.id] || { name: "Unknown", email: "", avatar: "" },
        amount: Number((settlementAmount / 100).toFixed(2)), // Convert back to rupees
      });

      // Update remaining amounts
      payer.amount -= settlementAmount;
      receiver.amount -= settlementAmount;

      // Move to next if settled
      if (payer.amount <= 1) payerIdx++; // 1 paisa tolerance
      if (receiver.amount <= 1) receiverIdx++;
    }

    // Final validation: Check if all balances are settled
    const unsettledPayers = payers.slice(payerIdx).filter(p => p.amount > 1);
    const unsettledReceivers = receivers.slice(receiverIdx).filter(r => r.amount > 1);
    
    console.log(`[Settlement ${id}] Generated Transactions:`);
    console.log(`  - Total settlements: ${settlements.length}`);
    console.log(`  - Payers: ${payers.length}, Receivers: ${receivers.length}`);
    settlements.forEach((s, idx) => {
      console.log(`    ${idx + 1}. ${s.from.name} → ${s.to.name}: ₹${s.amount}`);
    });
    
    if (unsettledPayers.length > 0 || unsettledReceivers.length > 0) {
      console.warn("⚠️  Settlement warning: Some balances remain unsettled", {
        unsettledPayers: unsettledPayers.map(p => ({ id: p.id, amount: (p.amount/100).toFixed(2) })),
        unsettledReceivers: unsettledReceivers.map(r => ({ id: r.id, amount: (r.amount/100).toFixed(2) }))
      });
    } else {
      console.log(`✓ All balances settled successfully`);
    }

    return NextResponse.json({
      success: true,
      data: settlements
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}