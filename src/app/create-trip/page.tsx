"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Plus, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateRange } from "react-day-picker";

interface Member {
  email: string;
  name?: string;
  userId?: string;
  profileImage?: string;
}

const CreateTrip = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Trip Form State
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  
  // Use explicit DateRange type
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Member Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        const results = data.data.map((u: any) => ({
            email: u.email,
            name: u.name,
            userId: u._id,
            profileImage: u.profileImage
        }));
        
        const filtered = results.filter((r: Member) => 
            !members.some(m => m.email === r.email)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (member?: Member) => {
    let newMember: Member;
    if (member) {
        newMember = member;
    } else {
        if (!searchQuery) return;
        if (!/^\S+@\S+\.\S+$/.test(searchQuery)) {
            toast.error("Please enter a valid email");
            return;
        }
        if (members.some(m => m.email === searchQuery)) {
            toast.error("Member already added");
            return;
        }
        newMember = { email: searchQuery, name: searchQuery.split('@')[0] };
    }
    setMembers([...members, newMember]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeMember = (emailToRemove: string) => {
    setMembers(members.filter((m) => m.email !== emailToRemove));
  };

  const handleCreateTrip = async () => {
    // 1. Handle Single Day Selection automatically
    let finalStartDate = dateRange?.from;
    let finalEndDate = dateRange?.to;

    // If only one day selected, make start = end
    if (finalStartDate && !finalEndDate) {
        finalEndDate = finalStartDate;
    }

    if (!tripName || !destination || !finalStartDate) {
      toast.error("Please fill in all trip details (Name, Location, Dates)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tripName,
          destination: destination,
          startDate: finalStartDate,
          endDate: finalEndDate, // Send the corrected end date
          members: members,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success("Trip created successfully!");
      router.push(`/trip/${data.tripId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Trip</h1>
            <p className="text-muted-foreground">Start planning your next adventure</p>
          </div>

          <Card className="shadow-float border-0">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Enter the basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input id="name" placeholder="e.g., Goa Summer Vacation" value={tripName} onChange={(e) => setTripName(e.target.value)} className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input id="destination" placeholder="e.g., Goa, India" value={destination} onChange={(e) => setDestination(e.target.value)} className="pl-10 h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dates</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal h-12", !dateRange?.from && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</> : format(dateRange.from, "LLL dd, y")
                            ) : <span>Pick a date range</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                            initialFocus 
                            mode="range" 
                            defaultMonth={dateRange?.from} 
                            selected={dateRange} 
                            onSelect={setDateRange} // simplified handler
                            numberOfMonths={2} 
                        />
                    </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Member Search Section */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <CardTitle>Travel Companions</CardTitle>
              <CardDescription>Search for friends to add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2 relative">
                <Label htmlFor="members">Add Members</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="members"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMember()}
                      className="pl-10 h-12"
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={() => addMember()} type="button" className="h-12 w-12 p-0">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                    <div className="absolute z-20 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {searchResults.map((user) => (
                            <div 
                                key={user.email} 
                                className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                                onClick={() => addMember(user)}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.profileImage} />
                                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Selected Members List */}
              {members.length > 0 && (
                <div className="space-y-3">
                  <Label>Added Members</Label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div key={m.email} className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-3 py-1.5 rounded-full text-sm border border-border">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={m.profileImage} />
                            <AvatarFallback className="text-[10px]">{m.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{m.name || m.email}</span>
                        <button onClick={() => removeMember(m.email)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button className="w-full h-14 text-lg gradient-primary shadow-lg hover:opacity-90 transition-opacity" onClick={handleCreateTrip} disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Trip...</> : "Create Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;