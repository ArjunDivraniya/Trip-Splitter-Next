// placeholder for `trip/[id]/add-expense/page.tsx` (migrated from AddExpense.tsx)
// File intentionally left without component code.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Receipt, DollarSign, User, Users, Utensils, Plane, Hotel, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "food", label: "Food", icon: Utensils },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
];

const members = [
  { id: "1", name: "You" },
  { id: "2", name: "Arjun" },
  { id: "3", name: "Priya" },
  { id: "4", name: "Krish" },
  { id: "5", name: "Neha" },
];

const AddExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState<string[]>(["1"]);

  const handleToggleMember = (memberId: string) => {
    if (splitWith.includes(memberId)) {
      setSplitWith(splitWith.filter(id => id !== memberId));
    } else {
      setSplitWith([...splitWith, memberId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !category || !paidBy) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (splitWith.length === 0) {
      toast.error("Please select at least one person to split with");
      return;
    }

    toast.success("Expense added successfully!");
    navigate(`/trip/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/trip/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Trip
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-float border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Expense Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Beach Restaurant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base">Amount (₹) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-12"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-base">Category *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Button
                        key={cat.value}
                        type="button"
                        variant={category === cat.value ? "default" : "outline"}
                        className="h-16 justify-start gap-3"
                        onClick={() => setCategory(cat.value)}
                      >
                        <Icon className="h-5 w-5" />
                        {cat.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Paid By */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Who Paid? *
                </Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Split With */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Split With *
                </Label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={splitWith.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <label
                        htmlFor={`member-${member.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {member.name}
                      </label>
                    </div>
                  ))}
                </div>
                {splitWith.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Split {splitWith.length} way{splitWith.length > 1 ? "s" : ""}: ₹
                    {amount ? (parseFloat(amount) / splitWith.length).toFixed(2) : "0"} each
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary hover:opacity-90 transition-opacity text-base"
                size="lg"
              >
                Add Expense
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;
