// placeholder for `create-trip/page.tsx` (migrated from CreateTrip.tsx)
// File intentionally left without component code.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");

  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tripName || !location || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    toast.success("Trip created successfully!");
    navigate("/dashboard");
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
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-float border-0 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Trip</CardTitle>
            <CardDescription className="text-base">
              Set up your trip details and invite members to start tracking expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTrip} className="space-y-6">
              {/* Trip Name */}
              <div className="space-y-2">
                <Label htmlFor="tripName" className="text-base">Trip Name *</Label>
                <Input
                  id="tripName"
                  type="text"
                  placeholder="e.g., Goa Beach Trip"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Goa, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-base">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-base">End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Add Members
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter name or email"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
                    className="h-12"
                  />
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    variant="outline"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Members List */}
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {members.map((member, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-2 px-3 gap-2"
                      >
                        {member}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary hover:opacity-90 transition-opacity text-base"
                size="lg"
              >
                Create Trip
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTrip;
