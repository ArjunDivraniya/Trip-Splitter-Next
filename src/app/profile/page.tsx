"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Edit2, Save, TrendingUp, MapPin, QrCode, Settings as SettingsIcon, Camera, Phone, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  qrCode: string;
  upiId?: string;
}

const Profile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [user, setUser] = useState<UserData>({
    _id: "",
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    qrCode: "",
    upiId: ""
  });

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        
        // If 401/404, it means the cookie is missing or invalid
        if (!res.ok) {
           const data = await res.json();
           throw new Error(data.message || "Failed to fetch");
        }

        const data = await res.json();
        setUser(data.data);
      } catch (error) {
        console.error("Profile Error:", error);
        toast.error("Session expired. Please log in.");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  // Handle Save (Update Text Data)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          upiId: user.upiId
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "profile" | "qr") => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = type === "profile" ? "/api/user/upload-profile" : "/api/user/upload-qr";

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({
        ...prev,
        [type === "profile" ? "profileImage" : "qrCode"]: type === "profile" ? data.data.profileImage : data.data.qrCode
      }));

      toast.success("Upload successful!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          
          {/* Profile Header */}
          <Card className="shadow-float border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5"></div>
            <CardContent className="p-8 pt-12 text-center relative">
              <div className="relative inline-block mb-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={user.profileImage} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-4xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "profile")} />
                
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
                </Button>
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-1">{user.name}</h2>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Manage your contact info</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>Save</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user.name} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={user.phone} onChange={handleChange} disabled={!isEditing} placeholder="+91..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" value={user.upiId || ""} onChange={handleChange} disabled={!isEditing} placeholder="user@upi" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <Dialog>
                <DialogTrigger asChild>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-success">
                        <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                                <QrCode className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-semibold">My QR Code</h3>
                                <p className="text-xs text-muted-foreground">Receive payments</p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Payment QR</DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-inner border w-full max-w-[250px] aspect-square flex items-center justify-center overflow-hidden">
                            {user.qrCode ? (
                                <img src={user.qrCode} alt="Payment QR" className="w-full h-full object-contain" />
                            ) : (
                                <p className="text-sm text-muted-foreground">No QR Uploaded</p>
                            )}
                        </div>

                        <div className="flex gap-2 w-full justify-center">
                            <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "qr")} />
                            <Button className="w-full" onClick={() => qrInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                {user.qrCode ? "Change QR Code" : "Upload QR Code"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
      </div>
    </div>
  );
};

export default Profile;