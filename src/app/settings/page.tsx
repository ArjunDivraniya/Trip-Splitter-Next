"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Theme preference can still live in local storage
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "GET" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      } else {
        // Fallback if API fails
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/login");
    } finally {
        setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sun className="h-5 w-5 text-orange-500" /> Appearance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Adjust the appearance for low light</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={toggleTheme} />
                </div>
            </CardContent>
        </Card>

        <Button 
            variant="destructive" 
            className="w-full mt-8 gap-2" 
            onClick={handleLogout}
            disabled={loggingOut}
        >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} 
            Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;