"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setLoading(false);
      if (error === "OAuthSignin") {
        toast.error("Google sign-in failed. Check Google OAuth settings.");
      } else if (error === "CredentialsSignin") {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        return;
      }

      toast.error("Login failed. Please try again.");
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
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
           <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
           <p className="text-muted-foreground">Enter your credentials to access your trips</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
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

              <Button className="w-full h-11 text-base gradient-primary hover:opacity-90" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 flex items-center justify-center gap-3"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signIn("google", { 
                      redirect: true,
                      callbackUrl: "/dashboard" 
                    });
                  } catch (error) {
                    toast.error("Google sign-in failed. Please try again.");
                    setLoading(false);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="h-4 w-4">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h146.9c-6.3 34-25 62.8-53.4 82v68.1h86.4c50.4-46.5 81.6-114.8 81.6-195.1z" />
                  <path fill="#34A853" d="M272 544.3c71.2 0 131-23.6 174.6-64.1l-86.4-68.1c-24.1 16.2-54.9 25.7-88.2 25.7-67.8 0-125.2-45.8-145.7-107.6H37.3v67.6C80.7 487.3 169.4 544.3 272 544.3z" />
                  <path fill="#FBBC05" d="M126.3 327.8c-6-17.5-9.4-36.1-9.4-55s3.4-37.5 9.4-55V150.2H37.3C13.3 192.3 0 236.4 0 272.8s13.3 80.5 37.3 122.6l89-67.6z" />
                  <path fill="#EA4335" d="M272 109.7c37.9-.6 72 14.6 98.9 42.7l74.1-74C403 25 343.4 0 272 0 169.4 0 80.7 57 37.3 150.2l89 67.6C146.8 155.5 204.2 109.7 272 109.7z" />
                </svg>
                <span>Continue with Google</span>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
            <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}