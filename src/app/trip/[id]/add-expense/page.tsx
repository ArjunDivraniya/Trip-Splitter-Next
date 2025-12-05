"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, IndianRupee, Check } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  avatar: string;
}

const AddExpense = () => {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]); // Array of member IDs

  // Fetch Trip Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (res.ok) {
          setMembers(data.data.members);
          // Default: Current user pays (need logic to find current user, here we pick first)
          if (data.data.members.length > 0) {
             setPaidBy(data.data.members[0].id);
             setSplitBetween(data.data.members.map((m: any) => m.id)); // Default: Split all
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
    setSplitBetween((prev) => 
      prev.includes(memberId) 
        ? prev.filter((id) => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleAddExpense = async () => {
    if (!title || !amount || !paidBy || splitBetween.length === 0) {
      toast.error("Please fill all fields and select members to split with.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          title,
          amount,
          category,
          paidBy,
          splitBetween
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Expense added successfully!");
      router.push(`/trip/${tripId}`); // Go back to overview
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

            {/* Category */}
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
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                <div className="grid grid-cols-1 gap-2">
                    {members.map((m) => {
                        const isSelected = splitBetween.includes(m.id);
                        return (
                            <div 
                                key={m.id}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                    isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                                }`}
                                onClick={() => toggleSplitMember(m.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={m.avatar} />
                                        <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{m.name}</span>
                                </div>
                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                            </div>
                        );
                    })}
                </div>
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