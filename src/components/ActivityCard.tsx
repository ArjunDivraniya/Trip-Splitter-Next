import { Clock, MapPin, Edit2, Trash2, ThumbsUp, MessageSquare, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  day: number;
  votes: number;
  voters: string[];
  status: "confirmed" | "proposed";
  alternatives?: Array<{
    id: string;
    title: string;
    location: string;
    suggestedBy: string;
    votes: number;
  }>;
}

interface ActivityCardProps {
  activity: Activity;
  isLast: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onVote: (id: string) => void;
  onSuggestAlternative: (activity: Activity) => void;
  dragHandleProps?: any;
}

export const ActivityCard = ({
  activity,
  isLast,
  onEdit,
  onDelete,
  onVote,
  onSuggestAlternative,
  dragHandleProps,
}: ActivityCardProps) => {
  const hasVoted = activity.voters.includes("current-user");
  const topAlternative = activity.alternatives?.sort((a, b) => b.votes - a.votes)[0];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Drag Handle & Timeline */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group">
              <Clock className="h-5 w-5 text-primary" />
              <div
                {...dragHandleProps}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            {!isLast && <div className="w-0.5 h-full bg-border mt-2" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {activity.time}
                  </div>
                  <Badge variant={activity.status === "confirmed" ? "default" : "secondary"}>
                    {activity.status === "confirmed" ? "Confirmed" : "Proposed"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{activity.title}</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(activity)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{activity.location}</span>
            </div>

            {activity.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {activity.description}
              </p>
            )}

            {/* Voting Section */}
            <div className="flex items-center gap-3 pt-3 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={hasVoted ? "default" : "outline"}
                      size="sm"
                      onClick={() => onVote(activity.id)}
                      className="gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {activity.votes}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Voted by:</p>
                      {activity.voters.length > 0 ? (
                        activity.voters.map((voter) => (
                          <p key={voter} className="text-sm">{voter}</p>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No votes yet</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuggestAlternative(activity)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Suggest Alternative
                {activity.alternatives && activity.alternatives.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activity.alternatives.length}
                  </Badge>
                )}
              </Button>

              {activity.voters.length > 0 && (
                <div className="flex -space-x-2 ml-auto">
                  {activity.voters.slice(0, 3).map((voter, i) => (
                    <Avatar key={i} className="h-7 w-7 border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {voter.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {activity.voters.length > 3 && (
                    <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{activity.voters.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Top Alternative */}
            {topAlternative && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alternative: {topAlternative.title}</p>
                    <p className="text-xs text-muted-foreground">{topAlternative.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suggested by {topAlternative.suggestedBy}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <ThumbsUp className="h-3 w-3" />
                    {topAlternative.votes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
