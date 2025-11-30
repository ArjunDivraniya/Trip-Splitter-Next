"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-6 animate-fade-in">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Oops! We couldn't find the page you were looking for.
        {pathname && (
          <span className="block mt-2 font-mono text-sm bg-muted p-1 rounded">
            Path: {pathname}
          </span>
        )}
      </p>

      <div className="flex gap-4 justify-center">
        <Button asChild variant="default">
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button asChild variant="outline">
          <Link href="/">
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}