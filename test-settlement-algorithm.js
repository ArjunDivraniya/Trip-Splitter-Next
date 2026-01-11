/**
 * Trip Expense Settlement Algorithm - Test Suite (JavaScript)
 * Run with: node test-settlement-algorithm.js
 */

/**
 * Production-grade settlement calculation algorithm
 */
function calculateSettlements(expenses, allMembers) {
  // Step 1: Initialize
  const totalPaid = {};
  const totalShare = {};
  const netBalances = {};

  allMembers.forEach(member => {
    totalPaid[member] = 0;
    totalShare[member] = 0;
  });

  // Step 2: Calculate Total Paid and Total Share
  expenses.forEach(expense => {
    const amountPaise = Math.round(expense.amount * 100);
    const beneficiaries = expense.members;
    const splitCount = beneficiaries.length;

    if (splitCount === 0) return;

    const baseSharePaise = Math.floor(amountPaise / splitCount);
    const remainderPaise = amountPaise - (baseSharePaise * splitCount);

    // Update total paid
    totalPaid[expense.paidBy] = (totalPaid[expense.paidBy] || 0) + amountPaise;

    // Update total share
    beneficiaries.forEach((member, idx) => {
      const share = baseSharePaise + (idx < remainderPaise ? 1 : 0);
      totalShare[member] = (totalShare[member] || 0) + share;
    });
  });

  // Step 3: Calculate Net Balance
  allMembers.forEach(member => {
    netBalances[member] = totalPaid[member] - totalShare[member];
  });

  // Validation: Sum must be 0
  const sum = Object.values(netBalances).reduce((a, b) => a + b, 0);
  if (Math.abs(sum) > 1) {
    console.warn(`⚠️  Balance sum validation failed: ${sum} paise (should be 0)`);
  }

  // Step 4: Generate Settlements
  const receivers = Object.entries(netBalances)
    .filter(([_, bal]) => bal > 1)
    .map(([id, bal]) => ({ id, amount: bal }))
    .sort((a, b) => b.amount - a.amount);

  const payers = Object.entries(netBalances)
    .filter(([_, bal]) => bal < -1)
    .map(([id, bal]) => ({ id, amount: -bal }))
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let payerIdx = 0;
  let receiverIdx = 0;

  while (payerIdx < payers.length && receiverIdx < receivers.length) {
    const payer = payers[payerIdx];
    const receiver = receivers[receiverIdx];

    const settlementAmount = Math.min(payer.amount, receiver.amount);

    settlements.push({
      from: payer.id,
      to: receiver.id,
      amount: Number((settlementAmount / 100).toFixed(2))
    });

    payer.amount -= settlementAmount;
    receiver.amount -= settlementAmount;

    if (payer.amount <= 1) payerIdx++;
    if (receiver.amount <= 1) receiverIdx++;
  }

  // Convert balances to rupees for display
  const netBalancesRupees = {};
  Object.entries(netBalances).forEach(([member, balance]) => {
    netBalancesRupees[member] = Number((balance / 100).toFixed(2));
  });

  return { netBalances: netBalancesRupees, settlements };
}

// ==================== TEST CASES ====================

console.log("🧪 Running Settlement Algorithm Tests\n");

// Test 1: Simple Case
console.log("📋 Test 1: Simple Case");
console.log("A paid ₹300 for A, B, C");
const test1 = calculateSettlements(
  [{ amount: 300, paidBy: "A", members: ["A", "B", "C"] }],
  ["A", "B", "C"]
);
console.log("Net Balances:", test1.netBalances);
console.log("Expected: A=+200, B=-100, C=-100");
console.log("Settlements:", test1.settlements);
console.log("Expected: B→A:100, C→A:100");
console.log(test1.netBalances.A === 200 && test1.netBalances.B === -100 && test1.netBalances.C === -100 ? "✅ PASS" : "❌ FAIL");
console.log("\n---\n");

// Test 2: Multiple Expenses
console.log("📋 Test 2: Multiple Expenses");
console.log("A paid ₹300 for A,B,C | B paid ₹150 for B,C");
const test2 = calculateSettlements(
  [
    { amount: 300, paidBy: "A", members: ["A", "B", "C"] },
    { amount: 150, paidBy: "B", members: ["B", "C"] }
  ],
  ["A", "B", "C"]
);
console.log("Net Balances:", test2.netBalances);
console.log("Expected: A=+200, B=-25, C=-175");
console.log("Settlements:", test2.settlements);
console.log("Expected: C→A:175, B→A:25");
console.log(test2.netBalances.A === 200 && test2.netBalances.B === -25 && test2.netBalances.C === -175 ? "✅ PASS" : "❌ FAIL");
console.log("\n---\n");

// Test 3: Everyone Settled
console.log("📋 Test 3: Everyone Settled");
console.log("A paid ₹100 for A,B | B paid ₹100 for B,C | C paid ₹100 for A,C");
const test3 = calculateSettlements(
  [
    { amount: 100, paidBy: "A", members: ["A", "B"] },
    { amount: 100, paidBy: "B", members: ["B", "C"] },
    { amount: 100, paidBy: "C", members: ["A", "C"] }
  ],
  ["A", "B", "C"]
);
console.log("Net Balances:", test3.netBalances);
console.log("Expected: A=0, B=0, C=0");
console.log("Settlements:", test3.settlements);
console.log("Expected: [] (no settlements)");
console.log(test3.netBalances.A === 0 && test3.netBalances.B === 0 && test3.netBalances.C === 0 && test3.settlements.length === 0 ? "✅ PASS" : "❌ FAIL");
console.log("\n---\n");

// Test 4: Complex Case (Your Real Trip)
console.log("📋 Test 4: Your Real Trip Data");
console.log("Based on screenshots: Multiple expenses by Arjun, Jagjeet, Mohil");
const test4 = calculateSettlements(
  [
    { amount: 23, paidBy: "Arjun", members: ["Jagjeet", "Mohil", "Arjun"] },
    { amount: 545, paidBy: "Arjun", members: ["Jagjeet", "Arjun"] },
    { amount: 580, paidBy: "Arjun", members: ["Jagjeet", "Arjun"] },
    { amount: 212, paidBy: "Arjun", members: ["Jagjeet", "Mohil", "Arjun"] },
    { amount: 897, paidBy: "Jagjeet", members: ["Jagjeet"] },
    { amount: 251, paidBy: "Mohil", members: ["Jagjeet", "Mohil"] },
    { amount: 548, paidBy: "Mohil", members: ["Jagjeet", "Mohil", "Arjun"] },
    { amount: 569, paidBy: "Mohil", members: ["Jagjeet", "Arjun"] },
    { amount: 258, paidBy: "Jagjeet", members: ["Jagjeet", "Mohil", "Arjun"] },
    { amount: 200, paidBy: "Jagjeet", members: ["Jagjeet", "Mohil", "Arjun"] }
  ],
  ["Arjun", "Jagjeet", "Mohil"]
);
console.log("\n📊 Detailed Breakdown:");
console.log("Net Balances:", test4.netBalances);
console.log("Total Expense:", 23+545+580+212+897+251+548+569+258+200, "= ₹4083");
console.log("\nSettlements:", test4.settlements);
console.log("\nExpected from manual calculation:");
console.log("  Jagjeet → Arjun: ₹99.33");
console.log("  Jagjeet → Mohil: ₹828.83");
const expectedSum = test4.netBalances.Arjun + test4.netBalances.Jagjeet + test4.netBalances.Mohil;
console.log(`\nBalance sum: ${expectedSum.toFixed(2)} (should be 0.00)`);
console.log(Math.abs(expectedSum) < 0.01 ? "✅ PASS - Balances sum to 0" : "❌ FAIL - Balances don't sum to 0");
console.log("\n---\n");

// Test 5: Decimal Rounding
console.log("📋 Test 5: Decimal Rounding (₹100 split 3 ways)");
const test5 = calculateSettlements(
  [{ amount: 100, paidBy: "A", members: ["A", "B", "C"] }],
  ["A", "B", "C"]
);
console.log("Net Balances:", test5.netBalances);
const perPerson = 100 / 3;
console.log(`Expected: A pays 100, owes ${perPerson.toFixed(2)} → balance ≈ +66.67`);
console.log(`B and C owe ${perPerson.toFixed(2)} each → balance ≈ -33.33 each`);
console.log("Settlements:", test5.settlements);
const sum5 = test5.netBalances.A + test5.netBalances.B + test5.netBalances.C;
console.log(`Balance sum: ${sum5.toFixed(2)} (should be 0.00)`);
console.log(Math.abs(sum5) < 0.01 ? "✅ PASS - No rounding errors" : "❌ FAIL - Rounding error detected");
console.log("\n---\n");

// Test 6: Large Amounts
console.log("📋 Test 6: Large Amounts");
const test6 = calculateSettlements(
  [
    { amount: 50000, paidBy: "A", members: ["A", "B", "C", "D"] },
    { amount: 25000, paidBy: "B", members: ["A", "B", "C"] }
  ],
  ["A", "B", "C", "D"]
);
console.log("Net Balances:", test6.netBalances);
console.log("Settlements:", test6.settlements);
const sum6 = Object.values(test6.netBalances).reduce((a, b) => a + b, 0);
console.log(`Balance sum: ${sum6.toFixed(2)} (should be 0.00)`);
console.log(Math.abs(sum6) < 0.01 ? "✅ PASS" : "❌ FAIL");
console.log("\n---\n");

// Test 7: Edge Case - Single Member Expense
console.log("📋 Test 7: Single Member Expense");
const test7 = calculateSettlements(
  [
    { amount: 100, paidBy: "A", members: ["A"] },
    { amount: 200, paidBy: "B", members: ["B"] }
  ],
  ["A", "B"]
);
console.log("Net Balances:", test7.netBalances);
console.log("Expected: A=0, B=0 (everyone paid for themselves)");
console.log("Settlements:", test7.settlements);
console.log(test7.settlements.length === 0 ? "✅ PASS - No settlements needed" : "❌ FAIL");
console.log("\n---\n");

console.log("🎉 All tests completed!\n");

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateSettlements };
}
