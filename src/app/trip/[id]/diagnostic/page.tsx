"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function DiagnosticPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState<any>(null);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/trips/${id}`).then(r => r.json()),
      fetch(`/api/trips/${id}/settlements`).then(r => r.json()),
      fetch(`/api/expenses?trip=${id}`).then(r => r.json())
    ]).then(([trip, settlements, exp]) => {
      setTripData(trip.data);
      setSettlementData(settlements.data);
      setExpenses(exp.expenses || exp.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Failed to load trip data</p>
      </div>
    );
  }

  const balanceSum = tripData.members?.reduce((sum: number, m: any) => sum + m.balance, 0) || 0;
  const isValid = Math.abs(balanceSum) < 0.01;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settlement Diagnostic</h1>
          <p className="text-muted-foreground">Debug view for trip calculations</p>
        </div>

        {/* Validation Status */}
        <Card className={isValid ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isValid ? (
                <><CheckCircle2 className="h-5 w-5 text-green-500" /> Validation Passed</>
              ) : (
                <><AlertCircle className="h-5 w-5 text-red-500" /> Validation Failed</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div>Balance Sum: <span className={isValid ? "text-green-600" : "text-red-600"}>₹{balanceSum.toFixed(2)}</span></div>
              <div>Expected: ₹0.00</div>
              <div>Status: {isValid ? "✅ Correct" : "❌ Error - Balances don't sum to zero"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div><strong>Trip Name:</strong> {tripData.name}</div>
            <div><strong>Total Expenses:</strong> ₹{tripData.totalExpense?.toLocaleString()}</div>
            <div><strong>Total Members:</strong> {tripData.members?.length}</div>
            <div><strong>Total Expenses Count:</strong> {expenses.length}</div>
            <div><strong>Status:</strong> {tripData.status}</div>
          </CardContent>
        </Card>

        {/* Member Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Member Net Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tripData.members?.map((member: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                    <div className="text-xs text-muted-foreground">Status: {member.status}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {member.balance >= 0 ? '+' : ''}₹{member.balance.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.balance >= 0 ? 'Should RECEIVE' : 'Should PAY'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settlements */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Settlements ({settlementData?.length || 0} transactions)</CardTitle>
          </CardHeader>
          <CardContent>
            {settlementData && settlementData.length > 0 ? (
              <div className="space-y-3">
                {settlementData.map((settlement: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-red-600">{settlement.from.name}</div>
                      <div className="text-muted-foreground">PAYS</div>
                    </div>
                    <div className="text-xl font-bold text-green-600">₹{settlement.amount.toFixed(2)}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">TO</div>
                      <div className="font-semibold text-green-600">{settlement.to.name}</div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold text-green-800">
                    Total to be settled: ₹{settlementData.reduce((sum: number, s: any) => sum + s.amount, 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No settlements needed - All balanced!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {expenses.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Title</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-left py-2">Paid By</th>
                      <th className="text-left py-2">Split Between</th>
                      <th className="text-right py-2">Per Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp: any, idx: number) => {
                      const splitCount = exp.splitBetween?.length || 1;
                      const perPerson = exp.amount / splitCount;
                      return (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{exp.title}</td>
                          <td className="text-right">₹{exp.amount}</td>
                          <td>{exp.paidBy?.name || 'Unknown'}</td>
                          <td className="text-xs">{exp.splitBetween?.map((u: any) => u.name).join(', ')}</td>
                          <td className="text-right">₹{perPerson.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No expenses found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Calculation */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Calculation Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tripData.members?.map((member: any) => {
              const paidExpenses = expenses.filter((e: any) => e.paidBy?._id === member.id || e.paidBy === member.id);
              const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
              
              const shareExpenses = expenses.filter((e: any) => 
                e.splitBetween?.some((u: any) => (u._id || u) === member.id)
              );
              const totalShare = shareExpenses.reduce((sum, e) => {
                const splitCount = e.splitBetween?.length || 1;
                return sum + (e.amount / splitCount);
              }, 0);
              
              const calculatedBalance = totalPaid - totalShare;
              const matches = Math.abs(calculatedBalance - member.balance) < 0.01;

              return (
                <div key={member.id} className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="font-bold text-lg">{member.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div>Total Paid:</div>
                    <div className="text-right">₹{totalPaid.toFixed(2)}</div>
                    
                    <div>Total Share:</div>
                    <div className="text-right">₹{totalShare.toFixed(2)}</div>
                    
                    <div className="font-bold border-t pt-2">Calculated Balance:</div>
                    <div className={`text-right font-bold border-t pt-2 ${calculatedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatedBalance >= 0 ? '+' : ''}₹{calculatedBalance.toFixed(2)}
                    </div>
                    
                    <div>API Balance:</div>
                    <div className={`text-right ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {member.balance >= 0 ? '+' : ''}₹{member.balance.toFixed(2)}
                    </div>
                    
                    <div className="col-span-2 text-center mt-2">
                      {matches ? (
                        <span className="text-green-600 font-semibold">✅ Matches</span>
                      ) : (
                        <span className="text-red-600 font-semibold">❌ Mismatch (diff: ₹{Math.abs(calculatedBalance - member.balance).toFixed(2)})</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Console Tip */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Open browser DevTools (F12) and check the <strong>Network</strong> tab to see API responses, 
              and <strong>Console</strong> tab for detailed calculation logs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
