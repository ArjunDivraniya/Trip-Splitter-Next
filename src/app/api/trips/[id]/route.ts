import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 3. Calculate Balances using TOTAL PAID vs TOTAL SHARE methodology
    // Using integer paise to avoid floating point errors
    let totalTripExpense = 0;
    
    // Step 1: Initialize data structures
    const totalPaid: Record<string, number> = {}; // in paise
    const totalShare: Record<string, number> = {}; // in paise
    const memberBalances: Record<string, number> = {}; // net balance in paise
    const userRegistry: Set<string> = new Set();

    // Helper to register a member (only joined members)
    const registerMember = (user: any, status?: string) => {
      if (!user) return null;
      if (status && status !== "joined") return null;
      const uid = user._id.toString();
      
      if (!userRegistry.has(uid)) {
        userRegistry.add(uid);
        totalPaid[uid] = 0;
        totalShare[uid] = 0;
      }
      return uid;
    };

    // Register creator (always joined)
    const creatorId = trip.createdBy._id.toString();
    registerMember(trip.createdBy, "joined");

    // Register all joined members
    trip.members.forEach((m: any) => registerMember(m.userId, m.status));

    // Step 2: Process expenses - Calculate TOTAL PAID and TOTAL SHARE
    expenses.forEach((expense: any) => {
      const amount = Number(expense.amount);
      totalTripExpense += amount;

      const payerId = expense.paidBy._id.toString();
      const amountPaise = Math.round(amount * 100);

      // IMPORTANT: Ensure payer is registered (they might not be in members list initially)
      if (!userRegistry.has(payerId)) {
        console.warn(`⚠️  Registering payer ${expense.paidBy.name} who wasn't in initial members list`);
        registerMember(expense.paidBy, "joined");
      }

      // Get beneficiaries (splitBetween members)
      const beneficiaries = expense.splitBetween
        .map((u: any) => {
          const uid = u._id.toString();
          // Ensure all beneficiaries are registered
          if (!userRegistry.has(uid)) {
            console.warn(`⚠️  Registering beneficiary ${u.name} who wasn't in initial members list`);
            registerMember(u, "joined");
          }
          return uid;
        })
        .filter((uid: string) => userRegistry.has(uid)); // Only count registered members

      if (beneficiaries.length === 0) {
        console.warn(`⚠️  Skipping expense "${expense.title}" - no valid beneficiaries`);
        return; // Skip invalid expenses
      }

      // Calculate per-head share
      // Check if custom split amounts exist (for unequally, percentage, shares)
      const splitCount = beneficiaries.length;
      
      // Update TOTAL PAID for payer
      if (userRegistry.has(payerId)) {
        totalPaid[payerId] += amountPaise;
      }

      // Update TOTAL SHARE for each beneficiary
      beneficiaries.forEach((beneficiaryId: string, idx: number) => {
        let sharePaise = 0;
        
        // Check if custom split amounts exist
        if (expense.splitAmounts && expense.splitAmounts.get && expense.splitAmounts.get(beneficiaryId)) {
          // Use custom amount from splitAmounts
          sharePaise = Math.round(expense.splitAmounts.get(beneficiaryId) * 100);
        } else {
          // Default to equal split with fair rounding
          const baseSharePaise = Math.floor(amountPaise / splitCount);
          const remainderPaise = amountPaise - (baseSharePaise * splitCount);
          sharePaise = baseSharePaise + (idx < remainderPaise ? 1 : 0);
        }
        
        totalShare[beneficiaryId] += sharePaise;
      });

      // Log each expense processing
      console.log(`  Expense: "${expense.title}" ₹${amount} paid by ${expense.paidBy.name}, split among ${beneficiaries.length} people (${expense.splitType || 'equally'})`);
    });

    // Step 3: Calculate NET BALANCE for each member
    // netBalance = totalPaid - totalShare
    // Positive = they should RECEIVE, Negative = they should PAY
    userRegistry.forEach((userId) => {
      memberBalances[userId] = totalPaid[userId] - totalShare[userId];
    });

    // Validation: Sum of all balances MUST be 0 (or very close due to rounding)
    const balanceSum = Object.values(memberBalances).reduce((sum, bal) => sum + bal, 0);
    console.log(`[Trip ${id}] Balance Calculation Complete:`);
    console.log(`  - Registered members: ${userRegistry.size}`);
    console.log(`  - Total expenses processed: ${expenses.length}`);
    console.log(`  - Total trip expense: ₹${totalTripExpense}`);
    console.log(`  - Balance sum (paise): ${balanceSum} (${(balanceSum/100).toFixed(2)} rupees)`);
    
    // Create user ID to name mapping for logging
    const userIdToName: Record<string, string> = {};
    trip.members.forEach((m: any) => {
      if (m.userId) {
        userIdToName[m.userId._id.toString()] = m.userId.name;
      }
    });
    userIdToName[creatorId] = trip.createdBy.name;
    
    Object.entries(memberBalances).forEach(([uid, bal]) => {
      const rupees = (bal / 100).toFixed(2);
      const userName = userIdToName[uid] || uid.substring(0, 8) + '...';
      console.log(`    ${userName}: ${bal > 0 ? '+' : ''}₹${rupees} (${bal > 0 ? '+' : ''}${bal} paise)`);
    });
    
    if (Math.abs(balanceSum) > 1) { // Allow 1 paisa tolerance
      console.warn(`⚠️  Balance validation warning: sum is ${balanceSum} paise (should be 0)`);
    } else {
      console.log(`✓ Balance validation passed`);
    }

    // 4. Format Members (All members should be included for expense splitting)
    const activeMembers = trip.members
        .filter((m: any) => m.userId)
        .map((m: any) => ({
            id: m.userId._id.toString(),
            name: m.userId.name,
            email: m.email,
            avatar: m.userId.profileImage || "",
            balance: Number(((memberBalances[m.userId._id.toString()] || 0) / 100).toFixed(2)),
            status: m.status
        }));

    // Ensure creator is in the list
    if (!activeMembers.some((m: any) => m.id === creatorId)) {
        activeMembers.push({
            id: creatorId,
            name: trip.createdBy.name,
            avatar: trip.createdBy.profileImage,
            email: trip.createdBy.email,
          balance: Number(((memberBalances[creatorId] || 0) / 100).toFixed(2)),
            status: "joined"
        });
    }

    // 5. Format Expenses
    const formattedExpenses = expenses.map((e: any) => {
      const idStr = e._id;
      const amount = Number(e.amount);
      const amountPaise = Math.round(amount * 100);
      const beneficiaries = e.splitBetween.map((u: any) => ({ id: u._id.toString(), name: u.name }));
      const splitCount = beneficiaries.length || 1;

      // Build per-user share using custom splitAmounts when provided, else fair equal split
      const sharesPaise: Record<string, number> = {};
      if (e.splitAmounts && typeof e.splitAmounts.get === 'function') {
        // Use provided amounts for any beneficiary that has a value
        beneficiaries.forEach((b: { id: string; name: string }, idx: number) => {
          const amt = e.splitAmounts.get(b.id);
          if (typeof amt === 'number' && !isNaN(amt)) {
            sharesPaise[b.id] = Math.round(amt * 100);
          }
        });
      }

      // Fill missing with equal split using fair rounding
      const alreadyAssigned = Object.values(sharesPaise).reduce((s, v) => s + v, 0);
      const remainingPaise = Math.max(0, amountPaise - alreadyAssigned);
      const needEqualIds = beneficiaries.filter((b: { id: string; name: string }) => sharesPaise[b.id] === undefined).map((b: { id: string; name: string }) => b.id);
      const baseShare = Math.floor((needEqualIds.length ? remainingPaise / needEqualIds.length : 0));
      const remainder = remainingPaise - baseShare * needEqualIds.length;
      needEqualIds.forEach((bid: string, idx: number) => {
        sharesPaise[bid] = baseShare + (idx < remainder ? 1 : 0);
      });

      // Convert to rupees
      const sharesRupees: Record<string, number> = {};
      beneficiaries.forEach((b: { id: string; name: string }) => {
        sharesRupees[b.id] = Number(((sharesPaise[b.id] || 0) / 100).toFixed(2));
      });

      // Compute default equal per-person for display when splitType === 'equally'
      const equalPerPerson = Number(((amountPaise / splitCount) / 100).toFixed(2));

      const involvedIds = beneficiaries.map((b: { id: string; name: string }) => b.id);
      const youInvolved = involvedIds.includes(userId);
      const yourShare = youInvolved ? (sharesRupees[userId] || 0) : null;
      const youPaidIt = userId === e.paidBy._id.toString();

      // Status label: you borrowed, you lent, not involved
      let statusLabel = 'Not involved';
      if (youInvolved) {
        if (youPaidIt) {
          statusLabel = 'You lent';
        } else {
          statusLabel = 'You borrowed';
        }
      }

      // Right-side label and amount for dashboard card
      const rightLabel = e.splitType === 'equally' ? 'Per person' : (youInvolved ? 'Your share' : 'Not involved');
      const rightAmount = rightLabel === 'Per person' ? equalPerPerson : (youInvolved ? Number((yourShare || 0).toFixed(2)) : null);

      return {
        id: idStr,
        title: e.title,
        amount: e.amount,
        category: e.category,
        paidBy: e.paidBy.name,
        paidById: e.paidBy._id.toString(),
        splitBetween: involvedIds,
        splitNames: beneficiaries.map((u: any) => u.name.split(" ")[0]).join(", "),
        splitType: e.splitType,
        perPerson: equalPerPerson,
        rightLabel,
        rightAmount,
        statusLabel,
        yourShare,
        date: new Date(e.date).toLocaleDateString(),
        // Optional detailed breakdown for future drill-down
        breakdown: beneficiaries.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name, amount: sharesRupees[b.id] || 0 }))
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: trip._id,
        name: trip.name,
        location: trip.destination,
        startDate: new Date(trip.startDate).toDateString(),
        endDate: new Date(trip.endDate).toDateString(),
        totalExpense: totalTripExpense,
        yourBalance: Number(((memberBalances[userId] || 0) / 100).toFixed(2)),
        status: trip.status, 
        members: activeMembers, // Only active members returned here
        expenses: formattedExpenses,
        isCreator: userId === creatorId,
        currentUserId: userId,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}