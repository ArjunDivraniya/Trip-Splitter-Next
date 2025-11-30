"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes"; // Fixed: Import from next-themes
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Moon, Globe, DollarSign, Bell } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const router = useRouter();
  const { setTheme, theme } = useTheme(); // Fixed: Use the theme hook
  const [mounted, setMounted] = useState(false); // To avoid hydration mismatch

  // Other preferences
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("INR");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [expenseNotifications, setExpenseNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Load other settings from localStorage
    const storedLanguage = localStorage.getItem("language") || "en";
    const storedCurrency = localStorage.getItem("currency") || "INR";
    
    setLanguage(storedLanguage);
    setCurrency(storedCurrency);
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast.success(checked ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
    toast.success("Language preference updated");
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem("currency", value);
    toast.success("Currency preference updated");
  };

  // Prevent hydration mismatch by not rendering theme-dependent UI until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/profile")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your app preferences and settings</p>
          </div>

          {/* Appearance */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme for better viewing in low light
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"} // Fixed: Check against theme state
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Localization</CardTitle>
                  <CardDescription>Language and regional preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="language" className="text-base font-medium">
                  Language
                </Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="de">Deutsch (German)</SelectItem>
                    <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                    <SelectItem value="zh">中文 (Chinese)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="currency" className="text-base font-medium">
                    Currency
                  </Label>
                </div>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR - Indian Rupee</SelectItem>
                    <SelectItem value="USD">$ USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">€ EUR - Euro</SelectItem>
                    <SelectItem value="GBP">£ GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">¥ JPY - Japanese Yen</SelectItem>
                    <SelectItem value="AUD">A$ AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CAD">C$ CAD - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-float border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notif" className="text-base font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  id="push-notif"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expense-notif" className="text-base font-medium">
                    Expense Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when expenses are added or updated
                  </p>
                </div>
                <Switch
                  id="expense-notif"
                  checked={expenseNotifications}
                  onCheckedChange={setExpenseNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-notif" className="text-base font-medium">
                    Payment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remind me about pending payments
                  </p>
                </div>
                <Switch
                  id="payment-notif"
                  checked={paymentReminders}
                  onCheckedChange={setPaymentReminders}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;