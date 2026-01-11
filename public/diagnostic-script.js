/**
 * Browser Console Diagnostic Script
 * 
 * Copy and paste this entire script into your browser console (F12)
 * while viewing your trip page.
 * 
 * It will show you exactly what's happening with the settlement calculations.
 */

(async function diagnosticCheck() {
  console.log('='.repeat(60));
  console.log('🔍 SETTLEMENT DIAGNOSTIC CHECK');
  console.log('='.repeat(60));
  
  // Get trip ID from URL
  const pathParts = window.location.pathname.split('/');
  const tripId = pathParts[pathParts.indexOf('trip') + 1]?.split('?')[0];
  
  if (!tripId || tripId === 'settle-up' || tripId === 'diagnostic') {
    console.error('❌ Could not find trip ID in URL');
    console.log('Current URL:', window.location.pathname);
    console.log('Please navigate to a trip page (/trip/{id}) and run this script again.');
    return;
  }
  
  console.log(`\n📍 Trip ID: ${tripId}`);
  console.log(`\n⏳ Fetching data...\n`);

  try {
    // Fetch all data
    const [tripResponse, settlementsResponse] = await Promise.all([
      fetch(`/api/trips/${tripId}`),
      fetch(`/api/trips/${tripId}/settlements`)
    ]);

    if (!tripResponse.ok) {
      console.error('❌ Trip API failed:', tripResponse.status, tripResponse.statusText);
      const errorText = await tripResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    if (!settlementsResponse.ok) {
      console.error('❌ Settlements API failed:', settlementsResponse.status, settlementsResponse.statusText);
      const errorText = await settlementsResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const tripData = await tripResponse.json();
    const settlementsData = await settlementsResponse.json();

    // ========== TRIP DATA ==========
    console.log('='.repeat(60));
    console.log('📊 TRIP DATA');
    console.log('='.repeat(60));
    
    const trip = tripData.data;
    console.log(`Trip Name: ${trip.name}`);
    console.log(`Status: ${trip.status}`);
    console.log(`Total Expense: ₹${trip.totalExpense?.toLocaleString()}`);
    console.log(`Your Balance: ${trip.yourBalance >= 0 ? '+' : ''}₹${trip.yourBalance}`);
    console.log(`Members: ${trip.members?.length}`);
    console.log(`Expenses: ${trip.expenses?.length}`);

    // ========== MEMBER BALANCES ==========
    console.log('\n' + '='.repeat(60));
    console.log('👥 MEMBER BALANCES');
    console.log('='.repeat(60));
    
    if (!trip.members || trip.members.length === 0) {
      console.error('❌ No members found in trip data');
    } else {
      console.table(trip.members.map(m => ({
        'Name': m.name,
        'Email': m.email,
        'Status': m.status,
        'Balance (₹)': m.balance.toFixed(2),
        'Type': m.balance > 0 ? '✅ Receives' : m.balance < 0 ? '❌ Pays' : '⚪ Even'
      })));

      // Calculate sum
      const balanceSum = trip.members.reduce((sum, m) => sum + m.balance, 0);
      console.log(`\n💰 Balance Sum: ${balanceSum.toFixed(2)}`);
      
      if (Math.abs(balanceSum) < 0.01) {
        console.log('✅ VALIDATION PASSED - Balances sum to zero');
      } else {
        console.error('❌ VALIDATION FAILED - Balances do not sum to zero');
        console.error(`   Difference: ₹${Math.abs(balanceSum).toFixed(2)}`);
        console.error('   This indicates a calculation error!');
      }
    }

    // ========== SETTLEMENTS ==========
    console.log('\n' + '='.repeat(60));
    console.log('💸 SETTLEMENTS');
    console.log('='.repeat(60));
    
    const settlements = settlementsData.data;
    
    if (!settlements || settlements.length === 0) {
      console.log('✅ No settlements needed - Everyone is even!');
    } else {
      console.log(`\nTotal Transactions: ${settlements.length}\n`);
      
      settlements.forEach((s, idx) => {
        console.log(`${idx + 1}. ${s.from.name} PAYS → ${s.to.name} RECEIVES: ₹${s.amount.toFixed(2)}`);
      });

      const totalSettlement = settlements.reduce((sum, s) => sum + s.amount, 0);
      console.log(`\n💵 Total Amount to Settle: ₹${totalSettlement.toFixed(2)}`);

      // Verify settlements match negative balances
      const totalNegativeBalance = trip.members
        .filter(m => m.balance < 0)
        .reduce((sum, m) => sum + Math.abs(m.balance), 0);
      
      console.log(`\n🔍 Verification:`);
      console.log(`   Total negative balances: ₹${totalNegativeBalance.toFixed(2)}`);
      console.log(`   Total settlements: ₹${totalSettlement.toFixed(2)}`);
      
      if (Math.abs(totalNegativeBalance - totalSettlement) < 0.01) {
        console.log('   ✅ Settlements match negative balances');
      } else {
        console.error('   ❌ Mismatch between settlements and balances!');
      }
    }

    // ========== EXPENSE DETAILS ==========
    console.log('\n' + '='.repeat(60));
    console.log('📝 EXPENSE DETAILS');
    console.log('='.repeat(60));
    
    if (!trip.expenses || trip.expenses.length === 0) {
      console.log('⚠️  No expenses found');
    } else {
      console.log(`\nTotal Expenses: ${trip.expenses.length}\n`);
      
      const expenseTable = trip.expenses.map((e, idx) => ({
        '#': idx + 1,
        'Title': e.title,
        'Amount (₹)': e.amount,
        'Paid By': e.paidBy,
        'Split Among': e.splitNames || 'N/A',
        'Per Person (₹)': e.perPerson
      }));
      
      console.table(expenseTable);
      
      // Calculate total from expenses
      const expenseTotal = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
      console.log(`\n💰 Sum of expenses: ₹${expenseTotal.toFixed(2)}`);
      console.log(`💰 Trip total expense: ₹${trip.totalExpense.toFixed(2)}`);
      
      if (Math.abs(expenseTotal - trip.totalExpense) < 0.01) {
        console.log('✅ Expense totals match');
      } else {
        console.error('❌ Expense totals do not match!');
      }
    }

    // ========== MANUAL CALCULATION ==========
    console.log('\n' + '='.repeat(60));
    console.log('🧮 MANUAL CALCULATION VERIFICATION');
    console.log('='.repeat(60));
    
    if (trip.expenses && trip.expenses.length > 0 && trip.members && trip.members.length > 0) {
      console.log('\nCalculating from scratch...\n');
      
      const manualBalances = {};
      
      // Initialize
      trip.members.forEach(m => {
        manualBalances[m.name] = { paid: 0, share: 0 };
      });
      
      // Process expenses
      trip.expenses.forEach(e => {
        // Add to paid
        if (manualBalances[e.paidBy]) {
          manualBalances[e.paidBy].paid += e.amount;
        }
        
        // Add to shares
        const splitNames = e.splitNames.split(', ');
        const perPerson = e.amount / splitNames.length;
        splitNames.forEach(name => {
          if (manualBalances[name]) {
            manualBalances[name].share += perPerson;
          }
        });
      });
      
      // Calculate net
      const manualResults = Object.entries(manualBalances).map(([name, data]) => {
        const net = data.paid - data.share;
        const apiMember = trip.members.find(m => m.name === name);
        const apiBalance = apiMember?.balance || 0;
        const matches = Math.abs(net - apiBalance) < 0.01;
        
        return {
          'Name': name,
          'Paid (₹)': data.paid.toFixed(2),
          'Share (₹)': data.share.toFixed(2),
          'Calculated Net (₹)': net.toFixed(2),
          'API Balance (₹)': apiBalance.toFixed(2),
          'Match': matches ? '✅' : '❌'
        };
      });
      
      console.table(manualResults);
      
      const allMatch = manualResults.every(r => r.Match === '✅');
      if (allMatch) {
        console.log('\n✅ All manual calculations match API balances!');
      } else {
        console.error('\n❌ Some calculations do not match API balances!');
        console.error('This indicates an issue with the balance calculation algorithm.');
      }
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    
    const balanceSum = trip.members?.reduce((sum, m) => sum + m.balance, 0) || 0;
    const balanceValid = Math.abs(balanceSum) < 0.01;
    const hasSettlements = settlements && settlements.length > 0;
    
    console.log('\n✓ Trip loaded successfully');
    console.log(`✓ ${trip.members?.length || 0} members found`);
    console.log(`✓ ${trip.expenses?.length || 0} expenses found`);
    console.log(`${balanceValid ? '✓' : '✗'} Balance validation ${balanceValid ? 'passed' : 'FAILED'}`);
    console.log(`✓ ${settlements?.length || 0} settlement transaction(s) generated`);
    
    if (!balanceValid) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   Balance sum is not zero. Check:');
      console.log('   1. Are all expenses properly saved?');
      console.log('   2. Are all members marked as "joined"?');
      console.log('   3. Check server logs for calculation warnings');
    } else if (!hasSettlements && trip.members?.some(m => Math.abs(m.balance) > 0.01)) {
      console.log('\n⚠️  WARNING:');
      console.log('   Members have non-zero balances but no settlements generated.');
      console.log('   This might indicate an issue with the settlement algorithm.');
    } else {
      console.log('\n✅ Everything looks good!');
    }

    // ========== LINKS ==========
    console.log('\n' + '='.repeat(60));
    console.log('🔗 USEFUL LINKS');
    console.log('='.repeat(60));
    console.log(`\nDiagnostic Page: /trip/${tripId}/diagnostic`);
    console.log(`Settle Up Page: /trip/${tripId}/settle-up`);
    console.log(`Trip API: /api/trips/${tripId}`);
    console.log(`Settlements API: /api/trips/${tripId}/settlements`);

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('\nFull error details:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Diagnostic Complete');
  console.log('='.repeat(60));
})();
