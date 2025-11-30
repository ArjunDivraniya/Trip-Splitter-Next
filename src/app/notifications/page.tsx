// placeholder for `notifications/page.tsx` (migrated from Notifications.tsx)
// File intentionally left without component code.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Bell, Users, TrendingUp, CheckCircle } from "lucide-react";

interface Notification {
  id: string;
  type: "expense" | "payment" | "activity";
  title: string;
  description: string;
  time: string;
  read: boolean;
  tripName?: string;
  amount?: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "expense",
      title: "New Expense Added",
      description: "Arjun added ₹300 for Lunch at Cafe Delhi",
      time: "2 hours ago",
      read: false,
      tripName: "Goa Trip 2024",
      amount: "₹300",
    },
    {
      id: "2",
      type: "payment",
      title: "Payment Reminder",
      description: "You owe ₹500 to Neha for Hotel Booking",
      time: "5 hours ago",
      read: false,
      tripName: "Manali Adventure",
      amount: "₹500",
    },
    {
      id: "3",
      type: "activity",
      title: "Trip Member Added",
      description: "Priya joined 'Goa Trip 2024'",
      time: "1 day ago",
      read: true,
      tripName: "Goa Trip 2024",
    },
    {
      id: "4",
      type: "payment",
      title: "Payment Received",
      description: "Krish paid you ₹200 for Transportation",
      time: "1 day ago",
      read: true,
      tripName: "Weekend Gateway",
      amount: "₹200",
    },
    {
      id: "5",
      type: "expense",
      title: "Expense Updated",
      description: "Neha updated the amount for Dinner (₹400 → ₹450)",
      time: "2 days ago",
      read: true,
      tripName: "Goa Trip 2024",
      amount: "₹450",
    },
    {
      id: "6",
      type: "activity",
      title: "Trip Settled",
      description: "All payments completed for 'Weekend Gateway'",
      time: "3 days ago",
      read: true,
      tripName: "Weekend Gateway",
    },
    {
      id: "7",
      type: "payment",
      title: "Settlement Request",
      description: "Arjun requested settlement for ₹350",
      time: "3 days ago",
      read: true,
      tripName: "Manali Adventure",
      amount: "₹350",
    },
    {
      id: "8",
      type: "expense",
      title: "Receipt Uploaded",
      description: "Priya uploaded receipt for Shopping",
      time: "4 days ago",
      read: true,
      tripName: "Goa Trip 2024",
    },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <DollarSign className="h-5 w-5 text-primary" />;
      case "payment":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "activity":
        return <Users className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6 shadow-elegant">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-white hover:bg-white/20 text-xs"
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white">
              {unreadCount} unread
            </Badge>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 bg-card shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <div className="px-6 py-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  No {activeTab !== "all" ? activeTab : ""} notifications at the moment
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                !notification.read ? "bg-primary/5 border-primary/20" : ""
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        notification.type === "expense"
                          ? "bg-primary/10"
                          : notification.type === "payment"
                          ? "bg-success/10"
                          : "bg-warning/10"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.tripName && (
                        <Badge variant="secondary" className="text-xs">
                          {notification.tripName}
                        </Badge>
                      )}
                      {notification.amount && (
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold text-primary"
                        >
                          {notification.amount}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
