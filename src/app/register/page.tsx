"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";

const Register = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      toast.success("Account created! Signing in...");
      
      // Automatically sign in after registration
      const signInResult = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error) {
        toast.error("Created account, but please login manually");
        router.push("/login");
        return;
      }

      if (signInResult?.ok) {
        router.push("/dashboard");
        return;
      }

      toast.error("Sign-in failed. Please login manually.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signIn("google", {
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (error: any) {
      toast.error("Google signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-primary rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <span className="text-primary-foreground font-bold text-xl">TS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">Join TripSplit and manage your trips</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                className="w-full h-11 text-base gradient-primary hover:opacity-90"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 flex items-center justify-center gap-3" onClick={handleGoogleSignup}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-4 w-4">
                <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h146.9c-6.3 34-25 62.8-53.4 82v68.1h86.4c50.4-46.5 81.6-114.8 81.6-195.1z" />
                <path fill="#34A853" d="M272 544.3c71.2 0 131-23.6 174.6-64.1l-86.4-68.1c-24.1 16.2-54.9 25.7-88.2 25.7-67.8 0-125.2-45.8-145.7-107.6H37.3v67.6C80.7 487.3 169.4 544.3 272 544.3z" />
                <path fill="#FBBC05" d="M126.3 327.8c-6-17.5-9.4-36.1-9.4-55s3.4-37.5 9.4-55V150.2H37.3C13.3 192.3 0 236.4 0 272.8s13.3 80.5 37.3 122.6l89-67.6z" />
                <path fill="#EA4335" d="M272 109.7c37.9-.6 72 14.6 98.9 42.7l74.1-74C403 25 343.4 0 272 0 169.4 0 80.7 57 37.3 150.2l89 67.6C146.8 155.5 204.2 109.7 272 109.7z" />
              </svg>
              <span>Sign up with Google</span>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;