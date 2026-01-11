"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, Loader2, Receipt, Utensils, Hotel, Plane, ShoppingBag, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const categoryIcons: Record<string, any> = {
  food: Utensils,
  travel: Plane,
  hotel: Hotel,
  shopping: ShoppingBag,
  entertainment: BarChart3,
  other: Receipt,
};

const categoryColors: Record<string, string> = {
  food: "text-green-500 bg-green-500/10",
  travel: "text-blue-500 bg-blue-500/10",
  hotel: "text-orange-500 bg-orange-500/10",
  shopping: "text-purple-500 bg-purple-500/10",
  entertainment: "text-pink-500 bg-pink-500/10",
  other: "text-gray-500 bg-gray-500/10",
};

interface ExpenseDetail {
  id: string;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  paidById: string;
  date: string;
  splitType: string;
  breakdown: Array<{ id: string; name: string; amount: number }>;
  statusLabel: string;
  yourShare?: number;
}

const ExpenseDetail = () => {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const expenseId = params.expenseId as string;

  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Ensure client-side hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !tripId || !expenseId) return;
    
    const fetchExpenseDetail = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        
        if (res.ok && data.data) {
          setMembers(data.data.members || []);
          const foundExpense = data.data.expenses.find((e: any) => e.id === expenseId);
          
          if (foundExpense) {
            setExpense(foundExpense);
          } else {
            toast.error("Expense not found");
            router.back();
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load expense details");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetail();
  }, [mounted, tripId, expenseId, router]);

  const handleDeleteExpense = async () => {
    setIsDeletingExpense(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Expense deleted successfully!");
        router.push(`/trip/${tripId}`);
      } else {
        toast.error(data.message || "Failed to delete expense");
      }
    } catch (e) {
      toast.error("Error deleting expense");
    } finally {
      setIsDeletingExpense(false);
    }
  };

  const CategoryIcon = (category: string) => {
    const key = category ? category.toLowerCase() : "other";
    const Icon = categoryIcons[key] || Receipt;
    const colorClass = categoryColors[key] || "text-gray-500 bg-gray-100";
    return (
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
    );
  };

  const getMemberDetails = (memberId: string) => {
    return members.find((m) => m.id === memberId);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!expense) {
    return <div className="p-8 text-center">Expense not found</div>;
  }

  const paidByMember = getMemberDetails(expense.paidById);
  const splitTypeLabel = {
    equally: "Split equally",
    unequally: "Split unequally",
    percentage: "Split by percentage",
    shares: "Split by shares",
  }[expense.splitType] || "Split equally";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Expense Header Card */}
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {CategoryIcon(expense.category)}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{expense.title}</h1>
                <p className="text-sm text-muted-foreground mt-2">{expense.date}</p>
                <p className="text-3xl font-bold mt-4 text-foreground">₹{expense.amount}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={`mb-2 ${
                  expense.statusLabel === 'You borrowed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  expense.statusLabel === 'You lent' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {expense.statusLabel}
                </Badge>
                {expense.yourShare !== undefined && expense.yourShare !== null && (
                  <p className={`font-bold text-lg ${
                    expense.statusLabel === 'You borrowed' ? 'text-orange-500' :
                    expense.statusLabel === 'You lent' ? 'text-green-600' :
                    'text-foreground'
                  }`}>₹{expense.yourShare}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Paid By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={paidByMember?.avatar} />
                <AvatarFallback>{paidByMember?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{paidByMember?.name}</p>
                <p className="text-xs text-muted-foreground">{paidByMember?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{splitTypeLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expense.breakdown && expense.breakdown.length > 0 ? (
                expense.breakdown.map((member: any, idx: number) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getMemberDetails(member.id)?.avatar} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                    <span className="font-bold">₹{member.amount}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No breakdown data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category & Split Type Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{expense.category}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Split Type</span>
                <span className="font-medium capitalize">{expense.splitType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 gap-2">
                <Trash2 className="h-4 w-4" /> Delete Expense
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteExpense}
                  disabled={isDeletingExpense}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingExpense ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
