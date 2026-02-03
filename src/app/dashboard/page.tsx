"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Bell, LogOut, User, Loader2, CheckCircle2, XCircle } from "lucide-react";
import TripCard from "@/components/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// Interface matching the API response
interface Trip {
  _id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: any[];
  membersCount?: number; // Added optional count
  totalExpense: number;
  yourBalance: number;
  status: string; 
  userStatus: string; 
}

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // --- 1. Fetch Data Function ---
  const fetchData = async () => {
    try {
      // Use session data directly
      if (session?.user?.id) {
        setUserName(session.user.name || "User");
        setUserAvatar(session.user.image || "");
      }

      // Fetch User Trips (Real Data)
      // If cookies are not yet present immediately after redirect from sign-in,
      // the first request may return 401. Retry once after warming session.
      let tripsResponse: Response | null = null;
      let attempts = 0;
      while (attempts < 2) {
        const res = await fetch("/api/trips/user");
        if (res.status === 401) {
          // Warm up NextAuth session endpoint and retry after a short delay
          await fetch("/api/auth/session");
          await new Promise((r) => setTimeout(r, 300));
          attempts += 1;
          continue;
        }
        tripsResponse = res;
        break;
      }

      if (tripsResponse) {
        const tripData = await tripsResponse.json();
        if (tripsResponse.ok) setTrips(tripData.data);
      }

    } catch (error) {
      console.error("Dashboard load failed:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  // --- 2. Handle Invitation Response ---
  const handleResponse = async (tripId: string, action: "accept" | "reject") => {
    try {
        const res = await fetch(`/api/trips/${tripId}/respond`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });
        if (res.ok) {
            toast.success(`Invitation ${action}ed`);
            fetchData(); // Refresh list to move trip to Active
        } else {
            toast.error("Failed to respond");
        }
    } catch (error) {
        toast.error("Action failed");
    }
  };

  // --- 3. Handle Logout ---
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out");
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  // --- 4. Filtering Logic ---
  const invitations = trips.filter(t => t.userStatus === "invited");
  // Trips where user has joined OR created
  const myTrips = trips.filter(t => t.userStatus === "joined" || t.userStatus === undefined); 
  
  const activeTrips = myTrips.filter(t => t.status !== "completed");
  const pastTrips = myTrips.filter(t => t.status === "completed");

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={userAvatar} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Welcome back,</h2>
                <p className="text-sm text-muted-foreground">{userName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")}>
                <Bell className="h-5 w-5" />
                {/* Optional: Add dot if unread notifications */}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}><User className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="/assets/travel-hero.png" 
          alt="Travel destinations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Trips</h1>
          <p className="text-muted-foreground">Manage and track all your travel expenses</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* --- Invitations Section --- */}
        {invitations.length > 0 && (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" /> Pending Invitations
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {invitations.map(trip => (
                        <Card key={trip._id} className="border-l-4 border-l-blue-500 shadow-md">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-foreground">{trip.name}</h4>
                                    <p className="text-sm text-muted-foreground">{trip.destination}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Invited by admin</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleResponse(trip._id, "reject")}>
                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleResponse(trip._id, "accept")}>
                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* --- Tabs: Active vs Past --- */}
        <Tabs defaultValue="ongoing" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ongoing">Active Trips ({activeTrips.length})</TabsTrigger>
            <TabsTrigger value="past">Past Trips ({pastTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4 animate-fade-in">
            {activeTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    id={trip._id}
                    name={trip.name}
                    location={trip.destination}
                    startDate={new Date(trip.startDate).toLocaleDateString()}
                    endDate={new Date(trip.endDate).toLocaleDateString()}
                    members={trip.membersCount || 0} // Use calculated count
                    totalExpense={trip.totalExpense} 
                    yourBalance={trip.yourBalance}   
                    status={"ongoing"}
                    onClick={() => router.push(`/trip/${trip._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No active trips found</p>
                <Button onClick={() => router.push("/create-trip")}>
                  <Plus className="mr-2 h-5 w-5" /> Create Your First Trip
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 animate-fade-in">
            {pastTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    id={trip._id}
                    name={trip.name}
                    location={trip.destination}
                    startDate={new Date(trip.startDate).toLocaleDateString()}
                    endDate={new Date(trip.endDate).toLocaleDateString()}
                    members={trip.membersCount || 0} // Use calculated count
                    totalExpense={trip.totalExpense}
                    yourBalance={trip.yourBalance}
                    status={"completed"}
                    onClick={() => router.push(`/trip/${trip._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No past trips yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-opacity z-50 text-white"
        onClick={() => router.push("/create-trip")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Dashboard;