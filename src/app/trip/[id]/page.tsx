"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Receipt, 
  DollarSign, 
  ShoppingBag, 
  Utensils, 
  Hotel, 
  Plane, 
  BarChart3, 
  MessageCircle, 
  ClipboardList, 
  CheckSquare, 
  Flag,
  UserPlus,
  Loader2,
  Search,
  Pencil,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Icons & Colors Helper ---
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

interface SearchUser {
    email: string;
    name?: string;
    profileImage?: string;
    _id?: string;
}

const TripOverview = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id; 

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  
  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Edit Expense State
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSplitBetween, setEditSplitBetween] = useState<string[]>([]);
  const [splitSearch, setSplitSearch] = useState("");
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState<string | null>(null);

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      const users = data.success ? data.data : (Array.isArray(data) ? data : []);

      if (Array.isArray(users)) {
        // Filter out existing members
        const currentMemberEmails = trip?.members?.map((m: any) => m.email) || [];
        const filtered = users.filter((u: any) => !currentMemberEmails.includes(u.email));
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (user: SearchUser) => {
      setNewMemberEmail(user.email);
      setSearchQuery(user.email); // Show email in input
      setSearchResults([]); // Hide dropdown
  };

  // --- Fetch Real Trip Data ---
  const fetchTripDetails = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error("Failed to load trip");
      
      const data = await res.json();
      setTrip(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTripDetails();
  }, [id]);

  // Light real-time: refetch on tab focus and every 30s
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && id) {
        fetchTripDetails();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => {
      if (id) fetchTripDetails();
    }, 30000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [id]);

  // --- End Trip Handler ---
  const handleEndTrip = async () => {
    setEnding(true);
    try {
        const res = await fetch(`/api/trips/${id}/end`, { method: "POST" });
        if (res.ok) {
            toast.success("Trip marked as completed");
            setTrip((prev: any) => ({ ...prev, status: "completed" })); 
        } else {
            const data = await res.json();
            toast.error(data.message || "Only admin can end trip");
        }
    } catch (e) {
        toast.error("Failed to end trip");
    } finally {
        setEnding(false);
    }
  };

  // --- Add Member Handler ---
  const handleAddMember = async () => {
    // If input is empty, try using search query if it looks like an email
    const emailToAdd = newMemberEmail || (searchQuery.includes('@') ? searchQuery : "");

    if (!emailToAdd) {
        toast.error("Please select a user or enter a valid email");
        return;
    }

    setAddingMember(true);
    try {
        const res = await fetch(`/api/trips/${id}/add-member`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailToAdd })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Invitation sent!");
            setNewMemberEmail("");
            setSearchQuery("");
            setSearchResults([]);
            setIsAddMemberOpen(false);
            fetchTripDetails(); // Refresh list
        } else {
            toast.error(data.message || "Failed to add member");
        }
    } catch (e) {
        toast.error("Error adding member");
    } finally {
        setAddingMember(false);
    }
  };

  // --- Edit Expense Handler ---
  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditSplitBetween(expense.splitBetween);
    setIsEditExpenseOpen(true);
  };

  const handleUpdateExpense = async () => {
    if (!editTitle || !editAmount || editSplitBetween.length === 0) {
      toast.error("Please fill all fields");
      return;
    }

    setIsUpdatingExpense(true);
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          amount: parseFloat(editAmount),
          category: editCategory,
          splitBetween: editSplitBetween
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Optimistic UI update for the expense card
        const updatedExpense = {
          id: editingExpense.id,
          title: editTitle,
          amount: parseFloat(editAmount),
          category: editCategory,
          paidBy: editingExpense.paidBy,
          paidById: editingExpense.paidById,
          splitBetween: editSplitBetween,
          splitNames: (trip?.members || [])
            .filter((m: any) => editSplitBetween.includes(m.id))
            .map((m: any) => (m.name || "").split(" ")[0])
            .join(", "),
          perPerson: Math.round(parseFloat(editAmount) / (editSplitBetween.length || 1)),
          date: editingExpense.date,
        } as any;

        setTrip((prev: any) => ({
          ...prev,
          expenses: (prev?.expenses || []).map((e: any) => (e.id === editingExpense.id ? updatedExpense : e)),
        }));

        toast.success("Expense updated successfully!");
        setIsEditExpenseOpen(false);
        // Background refresh to sync totals/balances accurately
        fetchTripDetails();
      } else {
        toast.error(data.message || "Failed to update expense");
      }
    } catch (e) {
      toast.error("Error updating expense");
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  // --- Delete Expense Handler ---
  const handleDeleteExpense = async (expenseId: string) => {
    setIsDeletingExpense(expenseId);
    // Optimistically remove expense from UI for snappy feel
    const previousExpenses = trip?.expenses || [];
    setTrip((prev: any) => ({ ...prev, expenses: previousExpenses.filter((e: any) => e.id !== expenseId) }));

    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Expense deleted successfully!");
        // Background refresh to sync totals/balances accurately
        fetchTripDetails();
      } else {
        // Revert on failure
        setTrip((prev: any) => ({ ...prev, expenses: previousExpenses }));
        toast.error(data.message || "Failed to delete expense");
      }
    } catch (e) {
      // Revert on error
      setTrip((prev: any) => ({ ...prev, expenses: previousExpenses }));
      toast.error("Error deleting expense");
    } finally {
      setIsDeletingExpense(null);
    }
  };

  const toggleSplitMember = (memberId: string) => {
    setEditSplitBetween(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    const allMemberIds = trip?.members.map((m: any) => m.id) || [];
    setEditSplitBetween(allMemberIds);
  };

  const deselectAllMembers = () => {
    setEditSplitBetween([]);
  };

  const CategoryIcon = (category: string) => {
    const key = category ? category.toLowerCase() : "other";
    const Icon = categoryIcons[key] || Receipt;
    const colorClass = categoryColors[key] || "text-gray-500 bg-gray-100";
    return (
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background p-4 space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  if (!trip) return <div className="p-8 text-center">Trip not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>

          {/* Admin End Trip Button */}
          {trip.isCreator && trip.status !== "completed" && (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                        <Flag className="h-4 w-4" /> End Trip
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End this trip?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the trip as completed. You can still view details but it will move to "Past Trips".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEndTrip} disabled={ending}>
                            {ending ? "Ending..." : "End Trip"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
          )}
        </div>
      </header>

      {/* Trip Info Banner */}
      <div className="bg-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{trip.name}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> <span>{trip.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> <span>{trip.startDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> <span>{trip.members.length} members</span>
                </div>
              </div>
            </div>
            <Badge className={trip.status === "completed" ? "bg-gray-500 hover:bg-gray-500" : "bg-green-600 hover:bg-green-600"}>
                {trip.status === "completed" ? "Completed" : "Ongoing"}
            </Badge>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold">₹{trip.totalExpense.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm mb-1">Your Balance</p>
                <p className={`text-2xl font-bold ${trip.yourBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {trip.yourBalance >= 0 ? "+" : ""}₹{Math.abs(trip.yourBalance).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <Card className="cursor-pointer hover:bg-accent/50 border-l-4 border-l-blue-500" onClick={() => router.push(`/trip/${id}/analytics`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Analytics</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 border-l-4 border-l-green-500" onClick={() => router.push(`/trip/${id}/chat`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Chat</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 border-l-4 border-l-orange-500" onClick={() => router.push(`/trip/${id}/itinerary`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Itinerary</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 border-l-4 border-l-purple-500" onClick={() => router.push(`/trip/${id}/packing-list`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Packing</p>
                    </div>
                </CardContent>
             </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settle" onClick={(e) => {
              e.preventDefault();
              router.push(`/trip/${id}/settle-up`);
            }}>Settle Up</TabsTrigger>
          </TabsList>

          {/* --- EXPENSES TAB --- */}
          <TabsContent value="expenses" className="space-y-4 animate-fade-in">
            {trip.expenses.length > 0 ? trip.expenses.map((expense: any) => {
              const canEditDelete = trip.currentUserId === expense.paidById;
              return (
              <Card key={expense.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/trip/${id}/expense/${expense.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">{expense.date}</p>
                        {CategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-base">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {expense.paidBy} paid <span className="font-medium">₹{expense.amount}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          Split among: <span className="italic">{expense.splitNames}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className={`text-xs font-medium mb-1 ${
                          expense.statusLabel === 'You borrowed' ? 'text-orange-500' :
                          expense.statusLabel === 'You lent' ? 'text-green-600' :
                          'text-muted-foreground'
                        }`}>
                          {expense.statusLabel}
                        </p>
                        {expense.rightAmount !== null && expense.rightAmount !== undefined ? (
                          <p className={`font-bold text-lg ${
                            expense.statusLabel === 'You borrowed' ? 'text-orange-500' :
                            expense.statusLabel === 'You lent' ? 'text-green-600' :
                            'text-foreground'
                          }`}>₹{expense.rightAmount}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </div>
                      {canEditDelete && trip.status !== "completed" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditExpense(expense);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isDeletingExpense === expense.id}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isDeletingExpense === expense.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No expenses added yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap the + button to add one!</p>
                </div>
            )}
          </TabsContent>

          {/* --- MEMBERS TAB --- */}
          <TabsContent value="members" className="space-y-4 animate-fade-in">
            
            {/* --- ADD MEMBER BUTTON (With Search) --- */}
            {trip.isCreator && trip.status !== "completed" && (
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed border-2 h-12 gap-2 mb-4 hover:bg-accent">
                            <UserPlus className="h-4 w-4" /> Add New Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Friend</DialogTitle>
                            <DialogDescription>
                                Search for a user by name or enter their email.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4 relative">
                            <div className="space-y-2">
                                <Label>Name or Email</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        ref={searchInputRef}
                                        placeholder="Search user..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        autoComplete="off"
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full bg-popover border border-border rounded-md shadow-md mt-1 overflow-hidden">
                                        {searchResults.map((user) => (
                                            <div 
                                                key={user.email} 
                                                className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                                                onClick={() => selectUser(user)}
                                            >
                                                <Avatar className="h-8 w-8 border">
                                                    <AvatarImage src={user.profileImage} />
                                                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                <Plus className="h-4 w-4 text-primary" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddMember} disabled={addingMember}>
                                {addingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Invite"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Member List */}
            {trip.members.map((member: any) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        {member.status === 'invited' && (
                            <Badge variant="outline" className="mt-1 text-[10px] h-5 bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Invite
                            </Badge>
                        )}
                        {member.status === 'joined' && (
                            <Badge variant="outline" className="mt-1 text-[10px] h-5 bg-green-50 text-green-700 border-green-200">
                                Joined
                            </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                        <p className={`font-bold text-lg ${member.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {member.balance >= 0 ? "+" : ""}₹{Math.abs(member.balance).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {member.balance >= 0 ? "Gets back" : "Owes"}
                        </p>
                    </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* --- SETTLE UP TAB --- */}
          {/* Removed - clicking Settle Up tab now directly navigates to /settle-up page */}
        </Tabs>
      </div>

      {/* 5. Floating Action Button (Add Expense) */}
      {trip.status !== "completed" && (
        <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-opacity z-50 text-white"
            onClick={() => router.push(`/trip/${id}/add-expense`)}
        >
            <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Expense Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Dinner at restaurant"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₹)</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="hotel">Hotel</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Split Between</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={selectAllMembers}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={deselectAllMembers}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              {/* Search member to quickly add a single person */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member by name or email"
                  value={splitSearch}
                  onChange={(e) => setSplitSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border border-input rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {(trip?.members || [])
                  .filter((member: any) => {
                    if (!splitSearch) return true;
                    const q = splitSearch.toLowerCase();
                    return (
                      member.name?.toLowerCase().includes(q) ||
                      member.email?.toLowerCase().includes(q)
                    );
                  })
                  .map((member: any) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edit-split-${member.id}`}
                      checked={editSplitBetween.includes(member.id)}
                      onChange={() => toggleSplitMember(member.id)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`edit-split-${member.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {member.name}
                    </label>
                    {/* Quick add single member action */}
                    {!editSplitBetween.includes(member.id) && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="ml-auto h-7 text-xs"
                        onClick={() => setEditSplitBetween(prev => [...prev, member.id])}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {editSplitBetween.length === 0 && (
                <p className="text-xs text-red-500">Please select at least one member</p>
              )}
              <p className="text-xs text-muted-foreground">
                {editSplitBetween.length} member{editSplitBetween.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpense} disabled={isUpdatingExpense}>
              {isUpdatingExpense ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripOverview;