// placeholder for `login/page.tsx` (migrated from Login.tsx)
// File intentionally left without component code.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import welcomeImg from "@/assets/onboarding-welcome.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Simulate login
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", email.split("@")[0]);
    
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <img 
            src={welcomeImg} 
            alt="Travel together"
            className="w-full max-w-md rounded-2xl shadow-float"
          />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
            <p className="text-muted-foreground">Continue managing your trip expenses</p>
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full shadow-float border-0 animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link to="/register" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary hover:opacity-90 transition-opacity text-base"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
