"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, Edit2, Save, MapPin, QrCode, Settings as SettingsIcon, Upload, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  qrCode: string;
}

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  
  // Refs for file inputs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch User Data on Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Profile Info
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated!");
        setUser(data.data);
        setIsEditing(false);
        // Update local storage for immediate UI consistency elsewhere
        localStorage.setItem("userName", data.data.name);
        localStorage.setItem("userEmail", data.data.email);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // 3. Upload Helper
  const handleFileUpload = async (file: File, endpoint: string) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading...");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Upload successful!", { id: toastId });
        setUser(data.data); // Update local state with new image URLs
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async () => {
    if(!confirm("Are you sure? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Account deleted");
        localStorage.clear();
        router.push("/login");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        
        {/* Profile Card */}
        <Card className="shadow-float border-0">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4 cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                <AvatarImage src={user?.profileImage} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-0 bg-primary rounded-full p-1 cursor-pointer hover:scale-110 transition" onClick={() => profileInputRef.current?.click()}>
                <Edit2 className="h-4 w-4 text-white" />
              </div>
              <input 
                type="file" 
                ref={profileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "/api/user/upload-profile")} 
              />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-1">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>

        {/* Edit Info Form */}
        <Card className="shadow-float border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
              ) : (
                <Button size="sm" onClick={handleUpdateProfile} className="gap-2 gradient-primary">
                  <Save className="h-4 w-4" /> Save
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  disabled={!isEditing} 
                  className="pl-10 h-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  disabled={!isEditing} 
                  className="pl-10 h-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  disabled={!isEditing} 
                  className="pl-10 h-12" 
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="shadow-float border-0 bg-gradient-to-br from-primary/5 to-success/5">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <QrCode className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Payment QR Code</h3>
            
            {user?.qrCode ? (
              <div className="mb-4">
                <img src={user.qrCode} alt="My QR" className="h-40 w-40 object-contain border-4 border-white rounded-lg shadow-sm" />
                <Button variant="ghost" size="sm" onClick={() => qrInputRef.current?.click()} className="mt-2 text-xs">Change QR</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Upload your UPI QR code for easier settlements.</p>
            )}

            <input 
              type="file" 
              ref={qrInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "/api/user/upload-qr")} 
            />
            
            {!user?.qrCode && (
              <Button variant="outline" className="gap-2" onClick={() => qrInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Upload QR Code
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <div className="pt-4 border-t">
          <Button variant="destructive" className="w-full gap-2" onClick={handleDeleteAccount}>
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Profile;