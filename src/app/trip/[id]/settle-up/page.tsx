"use client";
// placeholder for `trip/[id]/settle-up/page.tsx` (migrated from SettleUp.tsx)
// File intentionally left without component code.
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";

const settlements = [
  { from: "Krish", to: "You", amount: 400 },
  { from: "Arjun", to: "Priya", amount: 200 },
  { from: "Neha", to: "Priya", amount: 100 },
];

const SettleUp = () => {
  const router = useRouter();
  const { id } = useParams();

  const handleMarkPaid = (from: string, to: string, amount: number) => {
    toast.success(`₹${amount} payment from ${from} to ${to} marked as settled!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/trip/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Trip
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Settle Up</h1>
            <p className="text-muted-foreground">Simplified settlements for your trip</p>
          </div>

          {/* QR Code Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <QrCode className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Share Your Payment QR</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate and share your UPI QR code for quick payments
              </p>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                View My QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Settlements List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-success" />
              Who Owes Whom
            </h2>

            {settlements.map((settlement, index) => (
              <Card key={index} className="hover:shadow-float transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    {/* From */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-destructive/20">
                        <AvatarFallback className="bg-destructive/10 text-destructive font-semibold">
                          {settlement.from.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{settlement.from}</p>
                        <p className="text-sm text-muted-foreground">Owes</p>
                      </div>
                    </div>

                    {/* Arrow & Amount */}
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="h-6 w-6 text-primary" />
                      <p className="text-2xl font-bold text-foreground">₹{settlement.amount}</p>
                    </div>

                    {/* To */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{settlement.to}</p>
                        <p className="text-sm text-muted-foreground">Gets back</p>
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-success/20">
                        <AvatarFallback className="bg-success/10 text-success font-semibold">
                          {settlement.to.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      className="w-full gradient-success hover:opacity-90"
                      onClick={() => handleMarkPaid(settlement.from, settlement.to, settlement.amount)}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Mark as Settled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="bg-muted/30 border-0">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Tip:</strong> These are simplified settlements. Instead of everyone paying everyone,
                we've calculated the minimum number of transactions needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettleUp;
