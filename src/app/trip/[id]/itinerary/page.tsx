"use client";
// placeholder for `trip/[id]/itinerary/page.tsx` (migrated from TripItinerary.tsx)
// File intentionally left without component code.
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, MapPin, Clock, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  day: number;
}


const TripItinerary = () => {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDay, setSelectedDay] = useState("1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    day: 1,
    time: "",
    title: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchActivities();
    setupRealtimeSubscription();
  }, [id]);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("trip_id", id || "")
      .order("day", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } else {
      setActivities(data || []);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `trip_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setActivities((prev) => [...prev, payload.new as Activity]);
          } else if (payload.eventType === "UPDATE") {
            setActivities((prev) =>
              prev.map((activity) =>
                activity.id === payload.new.id
                  ? (payload.new as Activity)
                  : activity
              )
            );
          } else if (payload.eventType === "DELETE") {
            setActivities((prev) =>
              prev.filter((activity) => activity.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.location.trim() || !newActivity.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("activities").insert({
      trip_id: id || "",
      day: newActivity.day,
      time: newActivity.time,
      title: newActivity.title,
      location: newActivity.location,
      description: newActivity.description || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    } else {
      setNewActivity({
        day: 1,
        time: "",
        title: "",
        location: "",
        description: "",
      });
      setIsDialogOpen(false);
    }
  };

  const deleteActivity = async (activityId: string) => {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const tripDays = Array.from(
    new Set(activities.map((activity) => activity.day))
  ).sort();

  const getActivitiesForDay = (day: number) => {
    return activities
      .filter((activity) => activity.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/trip/${id}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Trip Itinerary</h1>
                <p className="text-sm text-muted-foreground">
                  Plan your daily activities
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Activity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Input id="day" type="number" min="1" placeholder="1" />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
                  <div>
                    <Label htmlFor="title">Activity Title</Label>
                    <Input id="title" placeholder="Beach visit" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Sunset Beach" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional details..."
                    />
                  </div>
                  <Button className="w-full">Add Activity</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="mb-6">
            {tripDays.map((day) => (
              <TabsTrigger key={day} value={day.toString()}>
                Day {day}
              </TabsTrigger>
            ))}
          </TabsList>

          {tripDays.map((day) => (
            <TabsContent key={day} value={day.toString()} className="space-y-4">
              {getActivitiesForDay(day).map((activity, index) => (
                <Card
                  key={activity.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        {index <
                          getActivitiesForDay(day).length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              {activity.time}
                            </div>
                            <h3 className="text-lg font-semibold">
                              {activity.title}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteActivity(activity.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{activity.location}</span>
                        </div>

                        {activity.description && (
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getActivitiesForDay(day).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No activities planned for this day yet
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Activity
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default TripItinerary;
