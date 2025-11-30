"use client";
// placeholder for `trip/[id]/packing-list/page.tsx` (migrated from TripPackingList.tsx)
// File intentionally left without component code.
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Package, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";

interface PackingItem {
  id: string;
  item_name: string;
  category: string;
  is_packed: boolean;
  claimed_by: string | null;
  claimed_by_name: string | null;
  trip_id: string;
}

const categories = [
  "Clothing",
  "Toiletries",
  "Electronics",
  "Documents",
  "Medications",
  "Entertainment",
  "Food & Snacks",
  "Other",
];

const TripPackingList = () => {
  const router = useRouter();
  const { id } = useParams();
  const tripId = Array.isArray(id) ? id[0] : id || "";
  const { toast } = useToast();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Clothing" });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchItems();
    setupRealtimeSubscription();
    
    // Get user name
    const storedName = localStorage.getItem("userName") || "Anonymous";
    setUserName(storedName);
  }, [id]);

  const fetchItems = async () => {
    // Supabase removed: load nothing from remote. Keep local state empty
    // or you can seed local items here if desired.
    setItems([]);
  };

  const setupRealtimeSubscription = () => {
    // Supabase removed: realtime subscription is a no-op
    return () => {};
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;

    // Supabase removed: add item locally
    const created: PackingItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      item_name: newItem.name,
      category: newItem.category,
      is_packed: false,
      claimed_by: null,
      claimed_by_name: null,
      trip_id: tripId,
    };
    setItems((prev) => [...prev, created]);
    setNewItem({ name: "", category: "Clothing" });
    setIsDialogOpen(false);
  };

  const togglePacked = async (item: PackingItem) => {
    // Supabase removed: toggle locally
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_packed: !i.is_packed } : i))
    );
  };

  const claimItem = async (item: PackingItem) => {
    // Supabase removed: toggle claimed status locally
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              claimed_by: i.claimed_by ? null : "local-user",
              claimed_by_name: i.claimed_by ? null : userName,
            }
          : i
      )
    );
  };

  const deleteItem = async (itemId: string) => {
    // Supabase removed: delete locally
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const itemsByCategory = categories.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const totalItems = items.length;
  const packedItems = items.filter((item) => item.is_packed).length;
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/trip/${id}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Packing List</h1>
                <p className="text-sm text-muted-foreground">
                  {packedItems} of {totalItems} items packed ({progress.toFixed(0)}%)
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Packing Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      placeholder="e.g., Sunscreen"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addItem} className="w-full">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {itemsByCategory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding items to your packing list
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {itemsByCategory.map(({ category, items: categoryItems }) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {category}
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                      {categoryItems.filter((i) => i.is_packed).length} of{" "}
                      {categoryItems.length} packed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={item.is_packed}
                          onCheckedChange={() => togglePacked(item)}
                        />
                        <span
                          className={`flex-1 ${
                            item.is_packed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {item.item_name}
                        </span>
                        {item.claimed_by_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.claimed_by_name}
                          </span>
                        )}
                        <Button
                          variant={item.claimed_by ? "default" : "outline"}
                          size="sm"
                          onClick={() => claimItem(item)}
                        >
                          {item.claimed_by ? "Unclaim" : "Claim"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripPackingList;
