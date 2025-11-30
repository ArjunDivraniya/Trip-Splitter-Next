import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TripCardProps {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  members: number;
  totalExpense: number;
  yourBalance: number;
  status: "ongoing" | "completed";
  onClick: () => void;
}

const TripCard = ({
  name,
  location,
  startDate,
  endDate,
  members,
  totalExpense,
  yourBalance,
  status,
  onClick,
}: TripCardProps) => {
  const isPositive = yourBalance >= 0;

  return (
    <Card 
      className="hover:shadow-float transition-smooth cursor-pointer border-border/50 overflow-hidden group"
      onClick={onClick}
    >
      <div className="h-32 gradient-primary relative">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="absolute top-4 right-4">
          <Badge 
            variant={status === "ongoing" ? "default" : "secondary"}
            className={status === "ongoing" ? "bg-success/90 hover:bg-success" : ""}
          >
            {status === "ongoing" ? "Ongoing" : "Completed"}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
          <div className="flex items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{members} members</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{startDate} - {endDate}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-lg font-semibold text-foreground">₹{totalExpense.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${isPositive ? "text-success" : "text-destructive"}`} />
              <p className={`text-lg font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
                {isPositive ? "+" : ""}₹{Math.abs(yourBalance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
