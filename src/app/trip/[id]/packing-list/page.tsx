"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CheckCircle2, Circle, Loader2, Trash2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Pre-defined suggestions
const SUGGESTIONS = {
  Essentials: ["Passport", "Tickets", "Wallet", "Phone Charger", "Power Bank", "ID Card"],
  Clothing: ["T-Shirts", "Jeans", "Underwear", "Socks", "Jacket", "Pyjamas"],
  Toiletries: ["Toothbrush", "Toothpaste", "Shampoo", "Towel", "Sunscreen", "Deodorant"],
  Health: ["First Aid Kit", "Painkillers", "Vitamins", "Hand Sanitizer", "Masks"],
  Gadgets: ["Headphones", "Camera", "Adapter", "Laptop", "Smart Watch"]
};

const TripPackingList = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fetch Items
  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/trips/${id}/packing`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchItems();
  }, [id]);

  // Add Item Logic
  const addItem = async (text: string, cat: string) => {
    if (!text.trim()) return;
    setAdding(true);
    
    // Optimistic UI update (optional, adds to list immediately)
    const tempId = Date.now().toString();
    const tempItem = { _id: tempId, text, category: cat, isChecked: false, temporary: true };
    setItems((prev) => [tempItem, ...prev]);

    try {
      const res = await fetch(`/api/trips/${id}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category: cat }),
      });
      
      if (res.ok) {
        toast.success(`Added ${text}`);
        setNewItem("");
        fetchItems(); // Refresh to get real ID
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast.error("Failed to add item");
      setItems((prev) => prev.filter(i => i._id !== tempId)); // Revert on fail
    } finally {
      setAdding(false);
    }
  };

  const handleManualAdd = () => addItem(newItem, category);

  // Toggle Checkbox
  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    // Optimistic Update
    setItems(items.map(i => i._id === itemId ? { ...i, isChecked: !currentStatus } : i));
    
    try {
        await fetch(`/api/trips/${id}/packing`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, isChecked: !currentStatus }),
        });
    } catch (e) {
        toast.error("Update failed");
        fetchItems(); // Revert
    }
  };

  // Delete Item
  const deleteItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent toggling when clicking delete
    if (!confirm("Remove this item?")) return;

    setItems(items.filter(i => i._id !== itemId));
    try {
        await fetch(`/api/trips/${id}/packing?itemId=${itemId}`, { method: "DELETE" });
        toast.success("Item removed");
    } catch (e) {
        fetchItems();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // Calculate Progress
  const total = items.length;
  const packed = items.filter(i => i.isChecked).length;
  const progress = total === 0 ? 0 : Math.round((packed / total) * 100);

  // Group items by category for display
  const groupedItems = items.reduce((acc: any, item: any) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="font-bold text-lg">Packing List</h1>
            <p className="text-xs text-muted-foreground">{packed} of {total} items packed</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        
        {/* Progress Bar */}
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 pr-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Packing Progress</span>
                        <span className="text-sm font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${progress === 100 ? "bg-green-500 text-white" : "bg-primary/10 text-primary"}`}>
                    <CheckCircle2 className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>

        {/* --- ADD ITEM SECTION --- */}
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Item
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Manual Input */}
                <div className="flex gap-2">
                    <Input 
                        placeholder="Item name (e.g. Umbrella)" 
                        value={newItem} 
                        onChange={(e) => setNewItem(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
                        className="flex-1"
                    />
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Essentials">Essentials</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Toiletries">Toiletries</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Gadgets">Gadgets</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleManualAdd} disabled={adding} size="icon">
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Suggestions Tabs */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> Quick Add Suggestions:
                    </p>
                    <Tabs defaultValue="Essentials" className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-1 no-scrollbar">
                            {Object.keys(SUGGESTIONS).map((cat) => (
                                <TabsTrigger 
                                    key={cat} 
                                    value={cat}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border px-3 py-1.5 h-auto text-xs rounded-full"
                                >
                                    {cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.entries(SUGGESTIONS).map(([cat, suggestions]) => (
                            <TabsContent key={cat} value={cat} className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion) => (
                                        <Badge 
                                            key={suggestion} 
                                            variant="outline" 
                                            className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors py-1 px-3 text-sm font-normal"
                                            onClick={() => addItem(suggestion, cat)}
                                        >
                                            + {suggestion}
                                        </Badge>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </CardContent>
        </Card>

        {/* --- ITEMS LIST --- */}
        <div className="space-y-6">
            {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Your packing list is empty. Start adding items!
                </div>
            ) : (
                Object.entries(groupedItems).map(([cat, catItems]: any) => (
                    <div key={cat}>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-1">{cat}</h3>
                        <div className="bg-card border rounded-lg overflow-hidden">
                            {catItems.map((item: any, index: number) => (
                                <div 
                                    key={item._id} 
                                    className={`flex items-center gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-accent/50 transition-all ${item.isChecked ? "bg-muted/30" : ""}`}
                                    onClick={() => toggleItem(item._id, item.isChecked)}
                                >
                                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${item.isChecked ? "bg-primary border-primary text-white" : "border-muted-foreground"}`}>
                                        {item.isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>
                                    
                                    <span className={`flex-1 font-medium text-sm ${item.isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                        {item.text}
                                    </span>

                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => deleteItem(e, item._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default TripPackingList;