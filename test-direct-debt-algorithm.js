/**
 * Direct Debt Settlement Algorithm - Test Suite
 * Tests the expense-participant-based debt tracking with netting
 * Run with: node test-direct-debt-algorithm.js
 */

/**
 * Calculate direct debts based on specific expense participants
 * with debt netting
 */
function calculateDirectDebts(expenses, allMembers) {
  // Step 1: Initialize direct debts matrix
  // debts[A][B] = amount A owes B (in paise)
  const debts = {};
  allMembers.forEach(member => {
    debts[member] = {};
  });

  console.log(`\n  Processing ${expenses.length} expenses...`);

  // Step 2: Track direct debts from each expense
  expenses.forEach((expense, idx) => {
    const amountPaise = Math.round(expense.amount * 100);
    const payer = expense.paidBy;
    const beneficiaries = expense.members;
    const splitCount = beneficiaries.length;

    if (splitCount === 0) return;

    const baseSharePaise = Math.floor(amountPaise / splitCount);
    const remainderPaise = amountPaise % splitCount;

    console.log(`    Expense ${idx + 1}: "${expense.title}" ₹${expense.amount} by ${payer}, split ${splitCount} ways`);

    // Each beneficiary owes the payer their share
    beneficiaries.forEach((beneficiary, index) => {
      if (beneficiary === payer) {
        // Payer is also a beneficiary - they don't owe themselves
        return;
      }

      const sharePaise = baseSharePaise + (index < remainderPaise ? 1 : 0);
      
      if (!debts[beneficiary]) debts[beneficiary] = {};
      if (!debts[beneficiary][payer]) debts[beneficiary][payer] = 0;
      
      debts[beneficiary][payer] += sharePaise;

      console.log(`      ${beneficiary} owes ${payer}: ₹${(sharePaise / 100).toFixed(2)}`);
    });
  });

  console.log(`\n  Debt Netting...`);

  // Step 3: DEBT NETTING - If A owes B and B owes A, net them out
  for (let i = 0; i < allMembers.length; i++) {
    for (let j = i + 1; j < allMembers.length; j++) {
      const userA = allMembers[i];
      const userB = allMembers[j];
      
      const aOwesB = debts[userA]?.[userB] || 0;
      const bOwesA = debts[userB]?.[userA] || 0;
      
      if (aOwesB > 0 && bOwesA > 0) {
        // Both owe each other - net them out
        const netAmount = Math.abs(aOwesB - bOwesA);
        const creditor = aOwesB > bOwesA ? userB : userA;
        const debtor = aOwesB > bOwesA ? userA : userB;
        
        console.log(`    Netting: ${userA} ↔ ${userB}: ₹${(aOwesB/100).toFixed(2)} vs ₹${(bOwesA/100).toFixed(2)} → ${debtor} owes ${creditor} ₹${(netAmount/100).toFixed(2)}`);
        
        // Clear both debts
        debts[userA][userB] = 0;
        debts[userB][userA] = 0;
        
        // Set the net debt
        debts[debtor][creditor] = netAmount;
      }
    }
  }

  // Step 4: Format final settlements
  const settlements = [];
  Object.entries(debts).forEach(([debtor, creditors]) => {
    Object.entries(creditors).forEach(([creditor, amountPaise]) => {
      if (amountPaise > 0) {
        settlements.push({
          from: debtor,
          to: creditor,
          amount: Number((amountPaise / 100).toFixed(2))
        });
      }
    });
  });

  // Calculate individual balances for verification
  const netBalances = {};
  allMembers.forEach(member => netBalances[member] = 0);
  
  settlements.forEach(s => {
    const amountPaise = Math.round(s.amount * 100);
    netBalances[s.from] -= amountPaise;
    netBalances[s.to] += amountPaise;
  });

  const netBalancesRupees = {};
  Object.entries(netBalances).forEach(([member, balance]) => {
    netBalancesRupees[member] = Number((balance / 100).toFixed(2));
  });

  return { settlements, netBalances: netBalancesRupees };
}

// ==================== TEST CASES ====================

console.log("🧪 Testing Direct Debt Settlement Algorithm\n");
console.log("=" .repeat(60));

// Test 1: Simple Direct Debt Case
console.log("\n📋 Test 1: Simple Direct Debt");
console.log("Scenario: Arjun paid ₹100 for [Arjun, Mohil], Jagjeet paid ₹90 for [Jagjeet, Arjun]");
console.log("Expected: Mohil owes Arjun ₹50, Arjun owes Jagjeet ₹45");

const test1 = calculateDirectDebts(
  [
    { title: "Lunch", amount: 100, paidBy: "Arjun", members: ["Arjun", "Mohil"] },
    { title: "Dinner", amount: 90, paidBy: "Jagjeet", members: ["Jagjeet", "Arjun"] }
  ],
  ["Arjun", "Mohil", "Jagjeet"]
);

console.log("\n  ✅ Settlements:");
console.table(test1.settlements);
console.log("\n  💰 Net Balances:");
console.table(test1.netBalances);

const test1Pass = 
  test1.settlements.some(s => s.from === "Mohil" && s.to === "Arjun" && s.amount === 50) &&
  test1.settlements.some(s => s.from === "Arjun" && s.to === "Jagjeet" && s.amount === 45);

console.log(`\n  ${test1Pass ? "✅ PASS" : "❌ FAIL"}`);

// Test 2: Debt Netting
console.log("\n" + "=".repeat(60));
console.log("\n📋 Test 2: Debt Netting");
console.log("Scenario: Arjun paid ₹150 for [Arjun, Jagjeet], Jagjeet paid ₹100 for [Jagjeet, Arjun]");
console.log("Expected: After netting, Jagjeet owes Arjun ₹25 (75 - 50)");

const test2 = calculateDirectDebts(
  [
    { title: "Breakfast", amount: 150, paidBy: "Arjun", members: ["Arjun", "Jagjeet"] },
    { title: "Taxi", amount: 100, paidBy: "Jagjeet", members: ["Jagjeet", "Arjun"] }
  ],
  ["Arjun", "Jagjeet"]
);

console.log("\n  ✅ Settlements:");
console.table(test2.settlements);
console.log("\n  💰 Net Balances:");
console.table(test2.netBalances);

const test2Pass = 
  test2.settlements.length === 1 &&
  test2.settlements[0].from === "Jagjeet" &&
  test2.settlements[0].to === "Arjun" &&
  test2.settlements[0].amount === 25;

console.log(`\n  ${test2Pass ? "✅ PASS" : "❌ FAIL"}`);

// Test 3: Complex Multi-Person with Netting
console.log("\n" + "=".repeat(60));
console.log("\n📋 Test 3: Complex Multi-Person Direct Debts");
console.log("Scenario: Multiple expenses with overlapping participants");

const test3 = calculateDirectDebts(
  [
    { title: "Hotel", amount: 300, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "Food", amount: 150, paidBy: "Jagjeet", members: ["Arjun", "Jagjeet"] },
    { title: "Gas", amount: 90, paidBy: "Mohil", members: ["Mohil", "Arjun", "Jagjeet"] }
  ],
  ["Arjun", "Jagjeet", "Mohil"]
);

console.log("\n  ✅ Settlements:");
console.table(test3.settlements);
console.log("\n  💰 Net Balances:");
console.table(test3.netBalances);

const balanceSum = Object.values(test3.netBalances).reduce((a, b) => a + b, 0);
const test3Pass = Math.abs(balanceSum) < 0.02; // Allow 1 paisa rounding

console.log(`\n  Balance Sum: ₹${balanceSum.toFixed(2)} ${test3Pass ? "✅ (within tolerance)" : "❌ (should be 0)"}`);
console.log(`\n  ${test3Pass ? "✅ PASS" : "❌ FAIL"}`);

// Test 4: Your Real Trip Data
console.log("\n" + "=".repeat(60));
console.log("\n📋 Test 4: Real Trip Data (₹4,083 total)");
console.log("10 expenses with various splits");

const test4 = calculateDirectDebts(
  [
    { title: "cd", amount: 23, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "c v", amount: 545, paidBy: "Arjun", members: ["Arjun", "Jagjeet"] },
    { title: "xcc", amount: 200, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "h", amount: 50, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "h", amount: 380, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "h", amount: 100, paidBy: "Arjun", members: ["Arjun", "Jagjeet"] },
    { title: "j", amount: 290, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "k", amount: 1950, paidBy: "Mohil", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "ll", amount: 500, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] },
    { title: "kk", amount: 45, paidBy: "Arjun", members: ["Arjun", "Jagjeet", "Mohil"] }
  ],
  ["Arjun", "Jagjeet", "Mohil"]
);

console.log("\n  ✅ Final Settlements:");
console.table(test4.settlements);
console.log("\n  💰 Net Balances:");
console.table(test4.netBalances);

const test4BalanceSum = Object.values(test4.netBalances).reduce((a, b) => a + b, 0);
const test4Pass = Math.abs(test4BalanceSum) < 0.02;

console.log(`\n  Balance Sum: ₹${test4BalanceSum.toFixed(2)} ${test4Pass ? "✅" : "❌"}`);
console.log(`\n  ${test4Pass ? "✅ PASS" : "❌ FAIL"}`);

// Test 5: Circular Debts
console.log("\n" + "=".repeat(60));
console.log("\n📋 Test 5: Circular Debt Pattern");
console.log("Scenario: A paid for [A,B], B paid for [B,C], C paid for [C,A]");

const test5 = calculateDirectDebts(
  [
    { title: "E1", amount: 120, paidBy: "A", members: ["A", "B"] },
    { title: "E2", amount: 90, paidBy: "B", members: ["B", "C"] },
    { title: "E3", amount: 60, paidBy: "C", members: ["C", "A"] }
  ],
  ["A", "B", "C"]
);

console.log("\n  ✅ Settlements:");
console.table(test5.settlements);
console.log("\n  💰 Net Balances:");
console.table(test5.netBalances);

const test5BalanceSum = Object.values(test5.netBalances).reduce((a, b) => a + b, 0);
const test5Pass = Math.abs(test5BalanceSum) < 0.02;

console.log(`\n  Balance Sum: ₹${test5BalanceSum.toFixed(2)}`);
console.log(`\n  ${test5Pass ? "✅ PASS" : "❌ FAIL"}`);

// Summary
console.log("\n" + "=".repeat(60));
console.log("\n📊 TEST SUMMARY");
console.log("=".repeat(60));
const allTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass];
const passCount = allTests.filter(Boolean).length;
console.log(`\n  Total: ${allTests.length} tests`);
console.log(`  Passed: ${passCount} ✅`);
console.log(`  Failed: ${allTests.length - passCount} ❌`);
console.log(`\n  ${passCount === allTests.length ? "🎉 ALL TESTS PASSED!" : "⚠️  Some tests failed"}`);
console.log("\n" + "=".repeat(60));
