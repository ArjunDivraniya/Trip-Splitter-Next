"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, Plus, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateRange } from "react-day-picker";

// Interface for members
interface Member {
  email: string;
  name?: string;
  userId?: string; // Optional, if they are a registered user
  profileImage?: string;
}

const CreateTrip = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Trip Form State
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  
  // Explicitly type DateRange or undefined
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Member Search State
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      // Handle both { success: true, data: [...] } and direct array/object responses
      const users = data.success ? data.data : (Array.isArray(data) ? data : []);

      if (Array.isArray(users)) {
        // Map backend users to Member format
        const results = users.map((u: any) => ({
            email: u.email,
            name: u.name,
            userId: u._id,
            profileImage: u.profileImage
        }));
        
        // Filter out people already added
        const filtered = results.filter((r: Member) => 
            !members.some(m => m.email === r.email)
        );
        
        setSearchResults(filtered);
      } else {
          setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add Member (either from search result or manual email)
  const addMember = (member?: Member) => {
    let newMember: Member;

    if (member) {
        // Adding from search result
        newMember = member;
    } else {
        // Manual email entry
        if (!searchQuery.trim()) return;
        
        // Basic email validation
        if (!/^\S+@\S+\.\S+$/.test(searchQuery)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Check duplicate
        if (members.some(m => m.email === searchQuery)) {
            toast.error("Member already added");
            return;
        }

        newMember = { 
            email: searchQuery, 
            name: searchQuery.split('@')[0] // Default name from email
        };
    }

    setMembers([...members, newMember]);
    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const removeMember = (emailToRemove: string) => {
    setMembers(members.filter((m) => m.email !== emailToRemove));
  };

  const handleCreateTrip = async () => {
    // Validation
    let finalStartDate = dateRange?.from;
    let finalEndDate = dateRange?.to;

    // Handle single day selection
    if (finalStartDate && !finalEndDate) {
        finalEndDate = finalStartDate;
    }

    if (!tripName || !destination || !finalStartDate || !finalEndDate) {
      toast.error("Please fill in trip name, location, and dates.");
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
          endDate: finalEndDate,
          members: members, // Send full member objects
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create trip");
      }

      toast.success("Trip created successfully!");
      router.push(`/trip/${data.tripId}`); // Redirect to new trip

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
                            onSelect={setDateRange} 
                            numberOfMonths={2} 
                        />
                    </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* SEARCH & ADD MEMBERS */}
          <Card className="shadow-float border-0 overflow-visible z-20"> {/* Ensure z-index here */}
            <CardHeader>
              <CardTitle>Travel Companions</CardTitle>
              <CardDescription>Search for friends to add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              
              <div className="space-y-2 relative">
                <Label htmlFor="members">Add Members</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      id="members"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMember()}
                      className="pl-10 h-12"
                      autoComplete="off" // Prevent browser history blocking view
                    />
                  </div>
                  <Button onClick={() => addMember()} type="button" className="h-12 w-12 p-0">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Suggestions Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 z-50 w-full bg-background border border-border rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {searchResults.map((user) => (
                            <div 
                                key={user.email} 
                                className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors border-b last:border-0"
                                onClick={() => addMember(user)}
                            >
                                <Avatar className="h-8 w-8 border border-border">
                                    <AvatarImage src={user.profileImage} />
                                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Plus className="h-4 w-4 text-primary" />
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Selected Members List */}
              {members.length > 0 && (
                <div className="space-y-3 pt-4">
                  <Label>Added Members</Label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div key={m.email} className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-3 py-1.5 rounded-full text-sm border border-border shadow-sm animate-in fade-in zoom-in-95">
                        <Avatar className="h-6 w-6 border border-white/20">
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
            <Button 
                className="w-full h-14 text-lg gradient-primary shadow-lg hover:opacity-90 transition-opacity" 
                onClick={handleCreateTrip} 
                disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Trip...</> : "Create Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;