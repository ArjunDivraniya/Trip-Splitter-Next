"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, CheckCircle2, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settlement {
  from: {
    name: string;
    avatar?: string;
    email?: string;
  };
  to: {
    name: string;
    avatar?: string;
    email?: string;
  };
  amount: number;
}

const SettleUp = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await fetch(`/api/trips/${id}/settlements`);
        if (!res.ok) throw new Error("Failed to load settlements");
        
        const data = await res.json();
        setSettlements(data.data);
      } catch (error) {
        console.error(error);
        toast.error("Could not calculate settlements");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSettlements();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settle Up</h1>
            <p className="text-muted-foreground">Here is the most efficient way to settle all debts in your group.</p>
        </div>

        <div className="space-y-4 animate-fade-in">
          {settlements.length > 0 ? (
            settlements.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                  
                  {/* Debtor (Pays) */}
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <Avatar className="h-12 w-12 border-2 border-red-100">
                      <AvatarImage src={item.from.avatar} />
                      <AvatarFallback className="bg-red-50 text-red-600 font-bold">
                        {item.from.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{item.from.name.split(" ")[0]}</p>
                        <p className="text-xs text-red-500 font-medium">Pays</p>
                    </div>
                  </div>

                  {/* Amount & Arrow */}
                  <div className="flex flex-col items-center justify-center flex-1 min-w-[100px]">
                    <p className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-2">
                        ₹{item.amount.toLocaleString()}
                    </p>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                  </div>

                  {/* Creditor (Receives) */}
                  <div className="flex items-center gap-3 min-w-[120px] justify-end">
                    <div className="text-right">
                        <p className="font-semibold text-foreground">{item.to.name.split(" ")[0]}</p>
                        <p className="text-xs text-green-500 font-medium">Receives</p>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-green-100">
                      <AvatarImage src={item.to.avatar} />
                      <AvatarFallback className="bg-green-50 text-green-600 font-bold">
                        {item.to.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/30 border-dashed border-2">
                <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Settled Up!</h3>
                    <p className="text-muted-foreground">No pending debts. Everyone is square.</p>
                </CardContent>
            </Card>
          )}
        </div>

        {settlements.length > 0 && (
            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    Note: Payments must be made externally (UPI, Cash, etc.). This app only tracks the balances.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SettleUp;