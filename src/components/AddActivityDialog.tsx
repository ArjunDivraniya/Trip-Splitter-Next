import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity } from "./ActivityCard";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (activity: Omit<Activity, "id" | "votes" | "voters" | "alternatives">) => void;
  editActivity?: Activity;
}

export const AddActivityDialog = ({
  open,
  onOpenChange,
  onAdd,
  editActivity,
}: AddActivityDialogProps) => {
  const [formData, setFormData] = useState({
    day: editActivity?.day.toString() || "1",
    time: editActivity?.time || "",
    title: editActivity?.title || "",
    location: editActivity?.location || "",
    description: editActivity?.description || "",
    status: editActivity?.status || "proposed" as "confirmed" | "proposed",
  });

  const handleSubmit = () => {
    onAdd({
      day: parseInt(formData.day),
      time: formData.time,
      title: formData.title,
      location: formData.location,
      description: formData.description,
      status: formData.status,
    });
    setFormData({
      day: "1",
      time: "",
      title: "",
      location: "",
      description: "",
      status: "proposed",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editActivity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="day">Day</Label>
            <Input
              id="day"
              type="number"
              min="1"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="title">Activity Title</Label>
            <Input
              id="title"
              placeholder="Beach visit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Sunset Beach"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "confirmed" | "proposed") => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            {editActivity ? "Update Activity" : "Add Activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
