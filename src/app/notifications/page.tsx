"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Bell, CheckCheck, Wallet, Calendar, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  _id: string;
  message: string;
  type: "invite" | "expense" | "activity" | "system";
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    profileImage: string;
  };
  trip?: {
    name: string;
  };
}

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Icons Helper
  const getIcon = (type: string) => {
    switch (type) {
      case "invite": return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "expense": return <Wallet className="h-5 w-5 text-orange-500" />;
      case "activity": return <Calendar className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. Mark All as Read
  const handleMarkAllRead = async () => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch("/api/notifications", { method: "PUT" });
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-5 w-5" /> Back
            </Button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleMarkAllRead} title="Mark all as read">
            <CheckCheck className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card 
              key={notif._id} 
              className={`border-l-4 transition-colors ${
                notif.isRead ? "border-l-transparent bg-background" : "border-l-primary bg-primary/5"
              }`}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1">
                    {notif.sender ? (
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={notif.sender.profileImage} />
                            <AvatarFallback>{notif.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            {getIcon(notif.type)}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium leading-none">
                        {notif.sender ? notif.sender.name : "System"}
                        {notif.trip && <span className="text-muted-foreground font-normal"> • {notif.trip.name}</span>}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20">
            <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;