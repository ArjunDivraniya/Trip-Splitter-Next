// placeholder for `dashboard/page.tsx` (migrated from Dashboard.tsx)
// File intentionally left without component code.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Bell, LogOut, User } from "lucide-react";
import TripCard from "@/components/TripCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import travelHeroImg from "@/assets/travel-hero.png";

// Mock data
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
  {
    id: "2",
    name: "Mountain Trek",
    location: "Manali, HP",
    startDate: "Oct 10",
    endDate: "Oct 15",
    members: 4,
    totalExpense: 18000,
    yourBalance: -300,
    status: "completed" as const,
  },
  {
    id: "3",
    name: "City Tour",
    location: "Jaipur, RJ",
    startDate: "Sep 5",
    endDate: "Sep 8",
    members: 6,
    totalExpense: 22000,
    yourBalance: 0,
    status: "completed" as const,
  },
];

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const name = localStorage.getItem("userName") || "User";
    setUserName(name);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const ongoingTrips = mockTrips.filter((trip) => trip.status === "ongoing");
  const pastTrips = mockTrips.filter((trip) => trip.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
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
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={travelHeroImg} 
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
            <TabsTrigger value="ongoing" className="text-base">
              Ongoing Trips ({ongoingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-base">
              Past Trips ({pastTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4 animate-fade-in">
            {ongoingTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ongoingTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    {...trip}
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No ongoing trips</p>
                <Button onClick={() => navigate("/create-trip")}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Trip
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 animate-fade-in">
            {pastTrips.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    {...trip}
                    onClick={() => navigate(`/trip/${trip.id}`)}
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-opacity"
        onClick={() => navigate("/create-trip")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Dashboard;
