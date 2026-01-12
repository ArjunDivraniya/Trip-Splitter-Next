"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trash2,
  ArrowRight,
  CheckCircle2
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const id = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Settle Up State
  const [settlements, setSettlements] = useState<any[]>([]);

  // Expense Detail Drawer State
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState<string | null>(null);

  // Ensure client-side hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, mounted]);

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
    if (!id) return;
    
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
    if (mounted && id) fetchTripDetails();
  }, [mounted, id]);

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

  // Fetch Settlements
  // Fetch Settlements
  const fetchSettlements = async () => {
    if (!id) return;
    
    try {
      const res = await fetch(`/api/trips/${id}/settlements`);
      if (!res.ok) throw new Error("Failed to load settlements");
      
      const data = await res.json();
      setSettlements(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not calculate settlements");
    }
  };

  useEffect(() => {
    if (mounted && id) fetchSettlements();
  }, [mounted, id]);

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
    router.push(`/trip/${id}/edit-expense/${expense.id}`);
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
        if (selectedExpense?.id === expenseId) {
          handleCloseExpense();
        }
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

  const formatDateParts = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return { month: "", day: "" };
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      day: date.toLocaleString("en-US", { day: "2-digit" }),
    };
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
    return Number(value).toLocaleString();
  };

  const getStatusTone = (label?: string) => {
    const lower = label?.toLowerCase() || "";
    if (lower.includes("borrow")) return { text: "text-orange-500", pill: "bg-orange-500/10 text-orange-700" };
    if (lower.includes("lent")) return { text: "text-green-600", pill: "bg-green-500/10 text-green-700" };
    if (lower.includes("not involved")) return { text: "text-muted-foreground", pill: "bg-muted text-muted-foreground" };
    return { text: "text-muted-foreground", pill: "bg-muted text-muted-foreground" };
  };

  const handleOpenExpense = (expense: any) => {
    setSelectedExpense(expense);
    setIsExpenseSheetOpen(true);
  };

  const handleCloseExpense = () => {
    setIsExpenseSheetOpen(false);
    setSelectedExpense(null);
  };

  const selectedExpenseCategory = selectedExpense?.category?.toLowerCase() || "other";
  const SelectedExpenseIcon = categoryIcons[selectedExpenseCategory] || Receipt;
  const selectedExpenseTone = getStatusTone(selectedExpense?.statusLabel);

  if (!mounted || loading) {
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
            <TabsTrigger value="settle">Settle Up</TabsTrigger>
          </TabsList>

          {/* --- EXPENSES TAB --- */}
          <TabsContent value="expenses" className="space-y-4 animate-fade-in">
            {trip.expenses.length > 0 ? trip.expenses.map((expense: any) => {
              const canEditDelete = trip.currentUserId === expense.paidById && trip.status !== "completed";
              const { month, day } = formatDateParts(expense.date);
              const statusTone = getStatusTone(expense.statusLabel);
              const categoryKey = expense.category ? expense.category.toLowerCase() : "other";
              const Icon = categoryIcons[categoryKey] || Receipt;
              const categoryClass = categoryColors[categoryKey] || categoryColors.other;

              return (
                <Card
                  key={expense.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenExpense(expense)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12">
                        <span className="text-xs text-muted-foreground">{month}</span>
                        <span className="text-2xl font-semibold leading-none">{day}</span>
                      </div>

                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${categoryClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold truncate">{expense.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {expense.paidBy} paid ₹{formatCurrency(expense.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {expense.splitNames ? expense.splitNames : "Split details not available"}
                            </p>
                          </div>

                          <div className="text-right min-w-[110px]">
                            <p className={`text-sm font-semibold ${statusTone.text}`}>{expense.statusLabel}</p>
                            <p className={`text-xl font-bold leading-tight ${statusTone.text}`}>
                              {expense.rightAmount !== null && expense.rightAmount !== undefined
                                ? `₹${formatCurrency(expense.rightAmount)}`
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {canEditDelete && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExpense(expense);
                              }}
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-600 hover:text-red-700"
                                  disabled={isDeletingExpense === expense.id}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isDeletingExpense === expense.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <Trash2 className="h-4 w-4" />
                                      <span>Delete</span>
                                    </div>
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
              );
            }) : (
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
          <TabsContent value="settle" className="space-y-4 animate-fade-in">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Settle Up</h2>
              <p className="text-muted-foreground text-sm">Most efficient way to settle all debts in your group.</p>
            </div>

            {settlements.length > 0 ? (
              settlements.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                    
                    {/* Debtor (Pays) */}
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Avatar className="h-12 w-12 border-2 border-red-100">
                        <AvatarImage src={item.from.avatar} />
                        <AvatarFallback className="bg-red-50 text-red-600 font-bold">
                          {item.from.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{item.from.name.split(" ")[0]}</p>
                        <p className="text-xs text-red-500 font-medium">Pays</p>
                      </div>
                    </div>

                    {/* Amount & Arrow */}
                    <div className="flex flex-col items-center justify-center flex-1 min-w-[100px]">
                      <p className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2">
                        ₹{item.amount.toLocaleString()}
                      </p>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                    </div>

                    {/* Creditor (Receives) */}
                    <div className="flex items-center gap-3 min-w-[120px] justify-end">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{item.to.name.split(" ")[0]}</p>
                        <p className="text-xs text-green-500 font-medium">Receives</p>
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-green-100">
                        <AvatarImage src={item.to.avatar} />
                        <AvatarFallback className="bg-green-50 text-green-600 font-bold">
                          {item.to.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-muted/30 border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">All Settled Up!</h3>
                  <p className="text-muted-foreground">No pending debts. Everyone is square.</p>
                </CardContent>
              </Card>
            )}

            {settlements.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-xs text-muted-foreground">
                  Note: Payments must be made externally (UPI, Cash, etc.). This app only tracks the balances.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Expense Detail Drawer */}
      <Sheet
        open={isExpenseSheetOpen}
        onOpenChange={(open) => {
          setIsExpenseSheetOpen(open);
          if (!open) setSelectedExpense(null);
        }}
      >
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto sm:max-w-3xl sm:mx-auto">
          {selectedExpense ? (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${categoryColors[selectedExpenseCategory] || categoryColors.other}`}>
                    <SelectedExpenseIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-xl font-bold truncate">{selectedExpense.title}</SheetTitle>
                    <SheetDescription className="text-sm flex flex-wrap items-center gap-3 mt-2">
                      <span>{selectedExpense.date}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{selectedExpense.paidBy} paid ₹{formatCurrency(selectedExpense.amount)}</span>
                    </SheetDescription>
                  </div>
                  <Badge className={`${selectedExpenseTone.pill} capitalize`}>
                    {selectedExpense.statusLabel}
                  </Badge>
                </div>
              </SheetHeader>

              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">₹{formatCurrency(selectedExpense.amount)}</p>
                    {selectedExpense.yourShare !== undefined && (
                      <p className={`text-sm mt-1 ${selectedExpenseTone.text}`}>
                        Your share: ₹{formatCurrency(selectedExpense.yourShare)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold capitalize">{selectedExpense.category || "other"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Paid By</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const payer = trip?.members?.find((m: any) => m.id === selectedExpense.paidById);
                    return (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={payer?.avatar} />
                          <AvatarFallback>{payer?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{payer?.name || selectedExpense.paidBy}</p>
                          <p className="text-xs text-muted-foreground">{payer?.email}</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Split Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedExpense.breakdown?.length ? (
                    selectedExpense.breakdown.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="font-semibold">₹{formatCurrency(member.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No breakdown available.</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Split Type</p>
                    <p className="font-semibold capitalize">{selectedExpense.splitType || "equally"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold">{selectedExpense.date}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCloseExpense();
                    router.push(`/trip/${id}/expense/${selectedExpense.id}`);
                  }}
                >
                  Open full details
                </Button>

                {trip.currentUserId === selectedExpense.paidById && trip.status !== "completed" && (
                  <>
                    <Button onClick={() => {
                      handleCloseExpense();
                      handleEditExpense(selectedExpense);
                    }}>
                      Edit expense
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isDeletingExpense === selectedExpense.id}
                        >
                          {isDeletingExpense === selectedExpense.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete expense"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{selectedExpense.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExpense(selectedExpense.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an expense card to view details.</p>
          )}
        </SheetContent>
      </Sheet>

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
    </div>
  );
};

export default TripOverview;