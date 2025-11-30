"use client";
// placeholder for `profile/page.tsx` (migrated from Profile.tsx)
// File intentionally left without component code.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Edit2, Save, TrendingUp, MapPin, QrCode, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "User";
    const storedEmail = localStorage.getItem("userEmail") || "";
    setName(storedName);
    setEmail(storedEmail);
  }, []);

  const handleSave = () => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const stats = [
    { label: "Total Trips", value: "3", icon: MapPin },
    { label: "Total Expenses", value: "₹65,000", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          {/* Profile Header */}
          <Card className="shadow-float border-0">
            <CardContent className="p-8 text-center">
              <Avatar className="h-24 w-24 border-4 border-primary/20 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground mb-1">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="shadow-float border-0">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Edit Profile */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gap-2 gradient-primary hover:opacity-90"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  id="upi"
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card 
            className="shadow-float border-0 bg-gradient-to-br from-primary/5 to-accent/5 cursor-pointer hover:shadow-lg transition-smooth"
            onClick={() => router.push("/settings")}
          >
            <CardContent className="p-6 text-center">
              <SettingsIcon className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage preferences, notifications, and app settings
              </p>
              <Button variant="outline" className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                Open Settings
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="shadow-float border-0 bg-gradient-to-br from-primary/5 to-success/5">
            <CardContent className="p-6 text-center">
              <QrCode className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Payment QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate and share your QR code for quick payments
              </p>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
