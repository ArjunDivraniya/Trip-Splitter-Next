"use client";

import { useState, useEffect } from "react";
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
  Loader2
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

  // --- Fetch Real Trip Data ---
  const fetchTripDetails = async () => {
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error("Failed to load trip");
      
      const data = await res.json();
      setTrip(data.data);
      
      // Debugging: Check if isCreator is coming through
      console.log("Is Creator?", data.data.isCreator); 
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
    if (!newMemberEmail) return;
    setAddingMember(true);
    try {
        const res = await fetch(`/api/trips/${id}/add-member`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newMemberEmail })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Invitation sent!");
            setNewMemberEmail("");
            setIsAddMemberOpen(false);
            fetchTripDetails(); // Refresh list to show new invited member
        } else {
            toast.error(data.message || "Failed to add member");
        }
    } catch (e) {
        toast.error("Error adding member");
    } finally {
        setAddingMember(false);
    }
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
          {/* Condition: Must be creator AND trip must be active */}
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
             <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-blue-500" onClick={() => router.push(`/trip/${id}/analytics`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Analytics</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-green-500" onClick={() => router.push(`/trip/${id}/chat`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Chat</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-orange-500" onClick={() => router.push(`/trip/${id}/itinerary`)}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Itinerary</p>
                    </div>
                </CardContent>
             </Card>
             <Card className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-purple-500" onClick={() => router.push(`/trip/${id}/packing-list`)}>
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
            {trip.expenses.length > 0 ? trip.expenses.map((expense: any) => (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {CategoryIcon(expense.category)}
                      <div>
                        <h3 className="font-semibold text-foreground text-base">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Paid by <span className="font-medium text-foreground">{expense.paidBy}</span> • ₹{expense.amount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          Split among: <span className="italic">{expense.splitNames}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Per person</p>
                      <p className="font-bold text-lg text-foreground">₹{expense.perPerson}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No expenses added yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap the + button to add one!</p>
                </div>
            )}
          </TabsContent>

          {/* --- MEMBERS TAB --- */}
          <TabsContent value="members" className="space-y-4 animate-fade-in">
            
            {/* --- ADD MEMBER BUTTON (Admin Only & Active Trip) --- */}
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
                                Enter the email address of the person you want to invite.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input 
                                    type="email"
                                    placeholder="friend@example.com" 
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
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
                        {/* Status Badges */}
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
            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">See who owes whom to settle all debts.</p>
                <Button onClick={() => router.push(`/trip/${id}/settle-up`)} className="gradient-primary text-white">
                  View Settlements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
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
    </div>
  );
};

export default TripOverview;