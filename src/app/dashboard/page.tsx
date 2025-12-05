"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Bell, LogOut, User, Loader2 } from "lucide-react";
import TripCard from "@/components/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Updated Interface with Financial Data
interface Trip {
  _id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: any[];
  totalExpense: number; // Added
  yourBalance: number;  // Added
}

const Dashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Profile
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) throw new Error("Auth failed");
        const userData = await userRes.json();
        setUserName(userData.data.name);
        setUserAvatar(userData.data.profileImage);

        // 2. Fetch User Trips (With Totals)
        const tripRes = await fetch("/api/trips/user");
        const tripData = await tripRes.json();
        
        if (tripRes.ok) {
          setTrips(tripData.data);
        }

      } catch (error) {
        console.error("Dashboard load failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
        await fetch("/api/auth/logout");
        router.push("/login");
        toast.success("Logged out");
    } catch (e) { router.push("/login"); }
  };

  const ongoingTrips = trips.filter((trip) => new Date(trip.endDate) >= new Date());
  const pastTrips = trips.filter((trip) => new Date(trip.endDate) < new Date());

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
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
              <Button variant="ghost" size="icon" onClick={() => router.push("/notifications")}><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}><User className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img src="/assets/travel-hero.png" alt="Travel destinations" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Trips</h1>
          <p className="text-muted-foreground">Manage and track all your travel expenses</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="ongoing" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ongoing">Ongoing Trips ({ongoingTrips.length})</TabsTrigger>
            <TabsTrigger value="past">Past Trips ({pastTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4 animate-fade-in">
            {ongoingTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    id={trip._id}
                    name={trip.name}
                    location={trip.destination}
                    startDate={new Date(trip.startDate).toLocaleDateString()}
                    endDate={new Date(trip.endDate).toLocaleDateString()}
                    members={trip.members.length}
                    totalExpense={trip.totalExpense} // REAL VALUE
                    yourBalance={trip.yourBalance}   // REAL VALUE
                    status={"ongoing"}
                    onClick={() => router.push(`/trip/${trip._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No ongoing trips</p>
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
                    members={trip.members.length}
                    totalExpense={trip.totalExpense} // REAL VALUE
                    yourBalance={trip.yourBalance}   // REAL VALUE
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

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-opacity"
        onClick={() => router.push("/create-trip")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Dashboard;