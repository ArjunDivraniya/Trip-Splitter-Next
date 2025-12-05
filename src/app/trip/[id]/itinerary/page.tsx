"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, MapPin, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

const TripItinerary = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    notes: ""
  });

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/trips/${id}/itinerary`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchActivities();
  }, [id]);

  const handleAddActivity = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Title and Date are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${id}/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Activity added!");
        setIsDialogOpen(false);
        setFormData({ title: "", date: "", time: "", location: "", notes: "" });
        fetchActivities();
      }
    } catch (error) {
      toast.error("Failed to add activity");
    } finally {
      setSubmitting(false);
    }
  };

  // Group activities by Date
  const groupedActivities = activities.reduce((acc: any, curr: any) => {
    const dateKey = new Date(curr.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {});

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="font-bold text-lg">Itinerary</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Activity</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Activity Name</Label>
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Visit Museum" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Location" />
                    </div>
                    <Button className="w-full" onClick={handleAddActivity} disabled={submitting}>
                        {submitting ? "Saving..." : "Add Activity"}
                    </Button>
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {Object.keys(groupedActivities).length > 0 ? Object.entries(groupedActivities).map(([date, items]: any) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4 sticky top-16 bg-background/95 p-2 rounded-lg backdrop-blur z-0">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">{format(new Date(date), "EEEE, MMMM do")}</h2>
            </div>
            <div className="space-y-4 pl-4 border-l-2 border-primary/20 ml-2">
                {items.map((item: any) => (
                    <Card key={item._id} className="relative">
                        <div className="absolute -left-[21px] top-4 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                    {item.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {item.location}</p>}
                                </div>
                                {item.time && <div className="flex items-center gap-1 text-sm font-medium bg-secondary px-2 py-1 rounded"><Clock className="h-3 w-3" /> {item.time}</div>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        )) : (
            <div className="text-center py-20 text-muted-foreground">
                <p>No plans yet.</p>
                <Button variant="link" onClick={() => setIsDialogOpen(true)}>Start planning</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TripItinerary;