"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, IndianRupee, Check, Percent, Hash } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Member {
  id: string;
  name: string;
  avatar: string;
}

type SplitType = "equally" | "unequally" | "percentage" | "shares";

const AddExpense = () => {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [customCategory, setCustomCategory] = useState(""); // New state for "Other"
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  
  // Split Type State
  const [splitType, setSplitType] = useState<SplitType>("equally");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Trip Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (res.ok) {
          // Include all members (both trip members and creator)
          const allMembers = data.data.members || [];
          setMembers(allMembers);
          // Default: First member pays & split all
          if (allMembers.length > 0) {
             setPaidBy(allMembers[0].id);
             setSplitBetween(allMembers.map((m: any) => m.id)); 
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchMembers();
  }, [tripId]);

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
      const hasInvalidShares = splitBetween.some(id => {
        const share = parseFloat(shares[id]);
        return isNaN(share) || share <= 0;
      });
      
      if (hasInvalidShares) {
        toast.error("All shares must be positive numbers");
        return false;
      }
    }
    
    return true;
  };

  const calculateSplitAmounts = (): Record<string, number> => {
    const amountNum = parseFloat(amount);
    const result: Record<string, number> = {};
    
    if (splitType === "equally") {
      const perPerson = amountNum / splitBetween.length;
      splitBetween.forEach(id => {
        result[id] = perPerson;
      });
    } else if (splitType === "unequally") {
      splitBetween.forEach(id => {
        result[id] = parseFloat(customAmounts[id]) || 0;
      });
    } else if (splitType === "percentage") {
      splitBetween.forEach(id => {
        const pct = parseFloat(percentages[id]) || 0;
        result[id] = (amountNum * pct) / 100;
      });
    } else if (splitType === "shares") {
      const totalShares = splitBetween.reduce((sum, id) => {
        return sum + (parseFloat(shares[id]) || 0);
      }, 0);
      
      splitBetween.forEach(id => {
        const share = parseFloat(shares[id]) || 0;
        result[id] = (amountNum * share) / totalShares;
      });
    }
    
    return result;
  };

  const handleAddExpense = async () => {
    // Determine final category (Preset or Custom)
    const finalCategory = category === "other" && customCategory.trim() 
        ? customCategory.trim() 
        : category;

    if (!title || !amount || !paidBy || splitBetween.length === 0 || !finalCategory) {
      toast.error("Please fill all fields and select members.");
      return;
    }
    
    // Validate split amounts/percentages/shares
    if (!validateSplit()) {
      return;
    }

    setSubmitting(true);
    try {
      const splitAmounts = calculateSplitAmounts();
      
      const res = await fetch("/api/expenses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          title,
          amount,
          category: finalCategory,
          paidBy,
          splitBetween,
          splitType,
          splitAmounts // Send calculated amounts for each member
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Expense added successfully!");
      router.push(`/trip/${tripId}`); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
        
        <Card>
          <CardContent className="space-y-6 pt-6">
            
            {/* Amount */}
            <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-10 text-lg h-12" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                    placeholder="What was this for?" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12"
                />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="food">Food & Drink</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="hotel">Accommodation</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other / Custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Custom Category Input (Only shows if "Other" is selected) */}
            {category === "other" && (
                <div className="space-y-2 animate-fade-in">
                    <Label>Custom Category Name</Label>
                    <Input 
                        placeholder="e.g. Souvenirs, Tips" 
                        value={customCategory} 
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="h-12"
                    />
                </div>
            )}

            {/* Paid By */}
            <div className="space-y-2">
                <Label>Paid By</Label>
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

            {/* Split With */}
            <div className="space-y-3">
                <Label>Split Amongst</Label>
                
                {/* Split Type Selector */}
                <RadioGroup value={splitType} onValueChange={(value: SplitType) => setSplitType(value)} className="space-y-2 mb-4">
                  <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${splitType === "equally" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-muted/50"}`}>
                    <RadioGroupItem value="equally" id="equally" className="flex-shrink-0" />
                    <Label htmlFor="equally" className="cursor-pointer flex-1 font-medium m-0">
                      = Equally
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${splitType === "unequally" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-muted/50"}`}>
                    <RadioGroupItem value="unequally" id="unequally" className="flex-shrink-0" />
                    <Label htmlFor="unequally" className="cursor-pointer flex-1 font-medium m-0">
                      ≠ Unequally
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${splitType === "percentage" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-muted/50"}`}>
                    <RadioGroupItem value="percentage" id="percentage" className="flex-shrink-0" />
                    <Label htmlFor="percentage" className="cursor-pointer flex-1 font-medium m-0 flex items-center gap-2">
                      <Percent className="h-4 w-4" /> By %
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${splitType === "shares" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-muted/50"}`}>
                    <RadioGroupItem value="shares" id="shares" className="flex-shrink-0" />
                    <Label htmlFor="shares" className="cursor-pointer flex-1 font-medium m-0 flex items-center gap-2">
                      <Hash className="h-4 w-4" /> By Shares
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                    {members.map((m) => {
                        const isSelected = splitBetween.includes(m.id);
                        return (
                            <div 
                                key={m.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border/60 hover:bg-accent/30"
                                }`}
                            >
                                <div 
                                  className="flex items-center gap-3 flex-1 cursor-pointer"
                                  onClick={() => toggleSplitMember(m.id)}
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={m.avatar} />
                                        <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{m.name}</span>
                                </div>
                                
                                {isSelected && mounted && (
                                  <div className="flex items-center gap-3">
                                    {splitType === "equally" && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <span className="text-sm font-medium text-primary">
                                          ₹{amount && splitBetween.length > 0 ? (parseFloat(amount) / splitBetween.length).toFixed(2) : "0.00"}
                                        </span>
                                        <Check className="h-5 w-5 text-primary" />
                                      </div>
                                    )}
                                    
                                    {splitType === "unequally" && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <div className="relative w-24">
                                          <IndianRupee className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="number"
                                            placeholder="0"
                                            value={customAmounts[m.id] || ""}
                                            onChange={(e) => setCustomAmounts(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            className="pl-7 h-8 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {splitType === "percentage" && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <div className="relative w-20">
                                          <Input
                                            type="number"
                                            placeholder="0"
                                            value={percentages[m.id] || ""}
                                            onChange={(e) => setPercentages(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            className="pr-6 h-8 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <Percent className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {splitType === "shares" && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <div className="relative w-20">
                                          <Input
                                            type="number"
                                            placeholder="1"
                                            value={shares[m.id] || "1"}
                                            onChange={(e) => setShares(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            className="h-8 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {!isSelected && (
                                  <div 
                                    className="h-8 w-8 rounded-full border-2 border-border cursor-pointer hover:border-primary/50 transition-colors flex-shrink-0"
                                    onClick={() => toggleSplitMember(m.id)}
                                  />
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Summary for percentage and shares */}
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

            <Button 
                className="w-full h-12 text-lg gradient-primary"
                onClick={handleAddExpense}
                disabled={submitting}
            >
                {submitting ? <Loader2 className="animate-spin" /> : "Save Expense"}
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;