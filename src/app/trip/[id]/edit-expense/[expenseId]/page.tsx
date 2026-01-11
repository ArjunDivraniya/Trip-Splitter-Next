"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, IndianRupee, Check, Percent, Hash, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Member {
  id: string;
  name: string;
  avatar: string;
}

type SplitType = "equally" | "unequally" | "percentage" | "shares";

const EditExpense = () => {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;
  const expenseId = params.expenseId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [customCategory, setCustomCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  
  // Split Type State
  const [splitType, setSplitType] = useState<SplitType>("equally");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const [paidById, setPaidById] = useState("");

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Trip and Expense Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (res.ok) {
          const allMembers = data.data.members || [];
          setMembers(allMembers);
          
          // Find the expense to edit
          const expense = data.data.expenses?.find((e: any) => e.id === expenseId);
          if (expense) {
            setTitle(expense.title);
            setAmount(expense.amount.toString());
            setCategory(expense.category);
            setSplitBetween(expense.splitBetween);
            setPaidBy(expense.paidById);
            setPaidById(expense.paidById);
            
            // Set split type and amounts based on expense data
            if (expense.splitType) {
              setSplitType(expense.splitType);
              
              if (expense.splitType === "unequally" && expense.splitAmounts) {
                setCustomAmounts(expense.splitAmounts);
              } else if (expense.splitType === "percentage" && expense.splitPercentages) {
                setPercentages(expense.splitPercentages);
              } else if (expense.splitType === "shares" && expense.splitShares) {
                setShares(expense.splitShares);
              } else {
                // Default: equally split - initialize empty
                initializeDefaultShares(expense.splitBetween, "equally");
              }
            } else {
              // Fallback for old expenses without splitType - assume equally
              setSplitType("equally");
              initializeDefaultShares(expense.splitBetween, "equally");
            }
          } else {
            toast.error("Expense not found");
            router.back();
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load expense");
      } finally {
        setLoading(false);
      }
    };
    if (tripId && expenseId && mounted) fetchData();
  }, [tripId, expenseId, mounted]);

  const initializeDefaultShares = (splitBetweenIds: string[], type: SplitType) => {
    if (type === "unequally") {
      const amounts: Record<string, string> = {};
      splitBetweenIds.forEach(id => {
        amounts[id] = "";
      });
      setCustomAmounts(amounts);
    } else if (type === "percentage") {
      const percs: Record<string, string> = {};
      splitBetweenIds.forEach(id => {
        percs[id] = (100 / splitBetweenIds.length).toFixed(1);
      });
      setPercentages(percs);
    } else if (type === "shares") {
      const shs: Record<string, string> = {};
      splitBetweenIds.forEach(id => {
        shs[id] = "1";
      });
      setShares(shs);
    }
  };

  const toggleSplitMember = (memberId: string) => {
    setSplitBetween((prev) => {
      const newSplit = prev.includes(memberId) 
        ? prev.filter((id) => id !== memberId) 
        : [...prev, memberId];
      
      // Initialize values for new split members
      if (!prev.includes(memberId)) {
        setCustomAmounts(curr => ({ ...curr, [memberId]: "" }));
        setPercentages(curr => ({ ...curr, [memberId]: "" }));
        setShares(curr => ({ ...curr, [memberId]: "1" }));
      }
      
      return newSplit;
    });
  };

  const validateSplit = (): boolean => {
    const amountNum = parseFloat(amount);
    
    if (splitType === "unequally") {
      const total = splitBetween.reduce((sum, id) => {
        return sum + (parseFloat(customAmounts[id]) || 0);
      }, 0);
      
      if (Math.abs(total - amountNum) > 0.01) {
        toast.error(`Custom amounts (₹${total.toFixed(2)}) must equal total amount (₹${amountNum})`);
        return false;
      }
    }
    
    if (splitType === "percentage") {
      const total = splitBetween.reduce((sum, id) => {
        return sum + (parseFloat(percentages[id]) || 0);
      }, 0);
      
      if (Math.abs(total - 100) > 0.01) {
        toast.error(`Percentages must add up to 100% (currently ${total.toFixed(1)}%)`);
        return false;
      }
    }
    
    if (splitType === "shares") {
      const total = splitBetween.reduce((sum, id) => {
        return sum + (parseFloat(shares[id]) || 0);
      }, 0);
      
      if (total === 0) {
        toast.error("At least one member must have shares > 0");
        return false;
      }
    }
    
    return true;
  };

  const handleUpdateExpense = async () => {
    if (!title || !amount || splitBetween.length === 0 || !paidBy) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!validateSplit()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        amount: parseFloat(amount),
        category: category === "other" ? customCategory : category,
        splitBetween,
        splitType,
        paidById: paidBy,
      };

      if (splitType === "unequally") {
        payload.splitAmounts = customAmounts;
      } else if (splitType === "percentage") {
        payload.splitPercentages = percentages;
      } else if (splitType === "shares") {
        payload.splitShares = shares;
      }

      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Expense updated successfully!");
        router.back();
      } else {
        toast.error(data.message || "Failed to update expense");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!confirm("Are you sure you want to delete this expense? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Expense deleted successfully!");
        router.back();
      } else {
        toast.error("Failed to delete expense");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting expense");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Expense</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Expense Title</Label>
              <Input
                id="title"
                placeholder="e.g., Dinner at restaurant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">🍽️ Food</SelectItem>
                  <SelectItem value="travel">✈️ Travel</SelectItem>
                  <SelectItem value="hotel">🏨 Hotel</SelectItem>
                  <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                  <SelectItem value="other">🔧 Other</SelectItem>
                </SelectContent>
              </Select>
              {category === "other" && (
                <Input 
                  placeholder="e.g. Souvenirs, Tips" 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="h-12 mt-2"
                />
              )}
            </div>

            {/* Paid By */}
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Split Options */}
            <div className="space-y-3">
              <Label>Split Amongst</Label>
              
              {/* Split Type Selector */}
              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSplitType("equally");
                    initializeDefaultShares(splitBetween, "equally");
                  }}
                  className={`w-full flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    splitType === "equally"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{
                    borderColor: splitType === "equally" ? "currentColor" : "currentColor",
                    backgroundColor: splitType === "equally" ? "currentColor" : "transparent"
                  }}>
                    {splitType === "equally" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="flex-1 font-medium text-left">= Equally</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSplitType("unequally");
                    initializeDefaultShares(splitBetween, "unequally");
                  }}
                  className={`w-full flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    splitType === "unequally"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{
                    borderColor: splitType === "unequally" ? "currentColor" : "currentColor",
                    backgroundColor: splitType === "unequally" ? "currentColor" : "transparent"
                  }}>
                    {splitType === "unequally" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="flex-1 font-medium text-left">≠ Unequally</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSplitType("percentage");
                    initializeDefaultShares(splitBetween, "percentage");
                  }}
                  className={`w-full flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    splitType === "percentage"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{
                    borderColor: splitType === "percentage" ? "currentColor" : "currentColor",
                    backgroundColor: splitType === "percentage" ? "currentColor" : "transparent"
                  }}>
                    {splitType === "percentage" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="flex-1 font-medium text-left flex items-center gap-2"><Percent className="h-4 w-4" /> By %</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSplitType("shares");
                    initializeDefaultShares(splitBetween, "shares");
                  }}
                  className={`w-full flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    splitType === "shares"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{
                    borderColor: splitType === "shares" ? "currentColor" : "currentColor",
                    backgroundColor: splitType === "shares" ? "currentColor" : "transparent"
                  }}>
                    {splitType === "shares" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="flex-1 font-medium text-left flex items-center gap-2"><Hash className="h-4 w-4" /> By Shares</span>
                </button>
              </div>

              {/* Member Selection */}
              <div className="space-y-2">
                {members.map((member) => {
                  const isSelected = splitBetween.includes(member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-border/60 hover:bg-accent/30"
                      }`}
                      onClick={() => toggleSplitMember(member.id)}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-3 flex-1 font-medium">{member.name}</span>
                      
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          {splitType === "unequally" && (
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                value={customAmounts[member.id] || ""}
                                onChange={(e) => setCustomAmounts(curr => ({ ...curr, [member.id]: e.target.value }))}
                                className="h-8 w-24 text-xs text-primary font-medium ml-auto"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                          
                          {splitType === "percentage" && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="0"
                                value={percentages[member.id] || ""}
                                onChange={(e) => setPercentages(curr => ({ ...curr, [member.id]: e.target.value }))}
                                className="h-8 w-20 text-xs text-primary font-medium ml-auto"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                            </div>
                          )}
                          
                          {splitType === "shares" && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="1"
                                value={shares[member.id] || ""}
                                onChange={(e) => setShares(curr => ({ ...curr, [member.id]: e.target.value }))}
                                className="h-8 w-16 text-xs text-primary font-medium ml-auto"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-xs text-muted-foreground">shares</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isSelected && (
                        <div 
                          className="h-8 w-8 rounded-full border-2 border-border cursor-pointer hover:border-primary/50 transition-colors flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Validation Summary */}
              {mounted && splitType === "percentage" && splitBetween.length > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-muted">
                  <div className="flex justify-between items-center">
                    <span>Total Percentage:</span>
                    <span className="font-medium">{splitBetween.reduce((sum, id) => sum + (parseFloat(percentages[id]) || 0), 0).toFixed(1)}%</span>
                  </div>
                  {Math.abs(splitBetween.reduce((sum, id) => sum + (parseFloat(percentages[id]) || 0), 0) - 100) > 0.01 && (
                    <span className="text-destructive text-xs mt-2 block">⚠️ Must equal 100%</span>
                  )}
                </div>
              )}
              
              {mounted && splitType === "unequally" && splitBetween.length > 0 && amount && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-muted">
                  <div className="flex justify-between items-center">
                    <span>Total Amount:</span>
                    <span className="font-medium">₹{splitBetween.reduce((sum, id) => sum + (parseFloat(customAmounts[id]) || 0), 0).toFixed(2)} / ₹{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  {Math.abs(splitBetween.reduce((sum, id) => sum + (parseFloat(customAmounts[id]) || 0), 0) - parseFloat(amount)) > 0.01 && (
                    <span className="text-destructive text-xs mt-2 block">⚠️ Must equal total amount</span>
                  )}
                </div>
              )}
              
              {mounted && splitType === "shares" && splitBetween.length > 0 && amount && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-muted">
                  <div className="flex justify-between items-center">
                    <span>Total Shares / Per Share Value:</span>
                    <span className="font-medium">{splitBetween.reduce((sum, id) => sum + (parseFloat(shares[id]) || 0), 0)} shares / ₹{(parseFloat(amount) / splitBetween.reduce((sum, id) => sum + (parseFloat(shares[id]) || 0), 0)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteExpense}
            disabled={deleting || submitting}
            className="flex-1"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
          <Button 
            onClick={handleUpdateExpense}
            disabled={submitting}
            className="flex-1 gradient-primary"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
