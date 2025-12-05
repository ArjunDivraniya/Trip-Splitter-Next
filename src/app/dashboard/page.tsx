"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Bell, LogOut, User } from "lucide-react";
import TripCard from "@/components/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock trip data (You can replace this with a real API call later)
const mockTrips = [
  {
    id: "1",
    name: "Goa Beach Trip",
    location: "Goa, India",
    startDate: "Nov 15",
    endDate: "Nov 20",
    members: 5,
    totalExpense: 25000,
    yourBalance: 500,
    status: "ongoing" as const,
  },
];

const Dashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }
        
        setUserName(data.data.name);
        setUserAvatar(data.data.profileImage);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login"); // Redirect if token invalid/missing
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    // Ideally call a logout API to clear cookie
    // For now, redirecting helps, but clearing cookie is best practice
    document.cookie = "token=; Max-Age=0; path=/;"; // Simple client-side clear
    router.push("/login");
    toast.success("Logged out");
  };

  const ongoingTrips = mockTrips.filter((trip) => trip.status === "ongoing");
  const pastTrips = mockTrips.filter((trip) => trip.status === "completed");

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
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
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/notifications")}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
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
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="ongoing" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ongoing" className="text-base">Ongoing Trips ({ongoingTrips.length})</TabsTrigger>
            <TabsTrigger value="past" className="text-base">Past Trips ({pastTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4 animate-fade-in">
            {ongoingTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    {...trip}
                    onClick={() => router.push(`/trip/${trip.id}`)}
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
             <div className="text-center py-12">
                <p className="text-muted-foreground">No past trips yet</p>
              </div>
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