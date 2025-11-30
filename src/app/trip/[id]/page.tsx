// placeholder for `trip/[id]/page.tsx` (migrated from TripOverview.tsx)
// File intentionally left without component code.
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MapPin, Calendar, Users, Receipt, DollarSign, ShoppingBag, Utensils, Hotel, Plane, BarChart3, MessageCircle, ClipboardList } from "lucide-react";

// Mock data
const tripData = {
  id: "1",
  name: "Goa Beach Trip",
  location: "Goa, India",
  startDate: "Nov 15, 2024",
  endDate: "Nov 20, 2024",
  totalExpense: 25000,
  yourBalance: 500,
  status: "ongoing",
  members: [
    { id: "1", name: "You", balance: 500 },
    { id: "2", name: "Arjun", balance: -200 },
    { id: "3", name: "Priya", balance: 300 },
    { id: "4", name: "Krish", balance: -400 },
    { id: "5", name: "Neha", balance: -200 },
  ],
  expenses: [
    { id: "1", title: "Beach Restaurant", amount: 2500, category: "food", paidBy: "You", date: "Nov 15", splitWith: 5 },
    { id: "2", title: "Hotel Booking", amount: 15000, category: "hotel", paidBy: "Arjun", date: "Nov 15", splitWith: 5 },
    { id: "3", title: "Taxi to Beach", amount: 800, category: "travel", paidBy: "Priya", date: "Nov 16", splitWith: 5 },
    { id: "4", title: "Shopping", amount: 3200, category: "shopping", paidBy: "You", date: "Nov 16", splitWith: 4 },
    { id: "5", title: "Dinner", amount: 3500, category: "food", paidBy: "Krish", date: "Nov 17", splitWith: 5 },
  ],
};

const categoryIcons: Record<string, any> = {
  food: Utensils,
  travel: Plane,
  hotel: Hotel,
  shopping: ShoppingBag,
};

const categoryColors: Record<string, string> = {
  food: "text-success",
  travel: "text-primary",
  hotel: "text-warning",
  shopping: "text-destructive",
};

const TripOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const CategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Receipt;
    return <Icon className={`h-5 w-5 ${categoryColors[category]}`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
        </div>
      </header>

      {/* Trip Header */}
      <div className="gradient-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{tripData.name}</h1>
              <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{tripData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{tripData.startDate} - {tripData.endDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{tripData.members.length} members</span>
                </div>
              </div>
            </div>
            <Badge className="bg-success/90 text-white border-0">Ongoing</Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <p className="text-white/80 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-white">₹{tripData.totalExpense.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <p className="text-white/80 text-sm mb-1">Your Balance</p>
                <p className={`text-2xl font-bold ${tripData.yourBalance >= 0 ? "text-white" : "text-white"}`}>
                  {tripData.yourBalance >= 0 ? "+" : ""}₹{Math.abs(tripData.yourBalance).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Analytics Card */}
          <Card 
            className="hover:shadow-float transition-smooth cursor-pointer bg-gradient-to-r from-primary/5 to-success/5 border-primary/20"
            onClick={() => navigate(`/trip/${id}/analytics`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Charts & spending insights</p>
                </div>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground rotate-45" />
            </CardContent>
          </Card>

          {/* Group Chat Card */}
          <Card 
            className="hover:shadow-float transition-smooth cursor-pointer bg-gradient-to-r from-success/5 to-primary/5 border-success/20"
            onClick={() => navigate(`/trip/${id}/chat`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Group Chat</p>
                  <p className="text-sm text-muted-foreground">Communicate with members</p>
                </div>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground rotate-45" />
            </CardContent>
          </Card>

          {/* Trip Itinerary Card */}
          <Card 
            className="hover:shadow-float transition-smooth cursor-pointer bg-gradient-to-r from-warning/5 to-primary/5 border-warning/20"
            onClick={() => navigate(`/trip/${id}/itinerary`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Trip Itinerary</p>
                  <p className="text-sm text-muted-foreground">Plan daily activities</p>
                </div>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground rotate-45" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settle">Settle Up</TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4 animate-fade-in">
            {tripData.expenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-float transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {CategoryIcon(expense.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid by {expense.paidBy} • Split {expense.splitWith} ways
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">₹{expense.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{expense.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4 animate-fade-in">
            {tripData.members.map((member) => (
              <Card key={member.id} className="hover:shadow-float transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-foreground">{member.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${member.balance >= 0 ? "text-success" : "text-destructive"}`}>
                        {member.balance >= 0 ? "+" : ""}₹{Math.abs(member.balance)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.balance >= 0 ? "Gets back" : "Owes"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Settle Up Tab */}
          <TabsContent value="settle" className="space-y-4 animate-fade-in">
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Simplify settlements and see who owes whom</p>
                <Button 
                  onClick={() => navigate(`/trip/${id}/settle-up`)}
                  className="gradient-primary hover:opacity-90"
                >
                  View Settlements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-opacity"
        onClick={() => navigate(`/trip/${id}/add-expense`)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default TripOverview;
