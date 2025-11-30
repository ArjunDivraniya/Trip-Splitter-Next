"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus, MapPin } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (isLoggedIn) {
      // If logged in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // If not logged in, stop loading and show the landing page
      setIsLoading(false);
    }
  }, [router]);

  // Show nothing (or a spinner) while checking authentication state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header / Nav */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <MapPin className="h-6 w-6" />
            <span>TripSplit</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Split Trip Expenses <span className="text-primary">Effortlessly</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Keep track of shared expenses, settle debts, and focus on enjoying your trip. 
                  No more awkward math at the end of the vacation.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto gap-2">
                    I have an account <LogIn className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image / Illustration */}
            <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
              <img
                alt="Travel Friends"
                className="mx-auto h-full w-full object-cover rounded-xl shadow-2xl"
                src="/assets/travel-hero.png" // Uses the image from your public/assets folder
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 TripSplit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}