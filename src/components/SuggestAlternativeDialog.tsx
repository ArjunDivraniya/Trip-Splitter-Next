import { useState } from "react";
import { ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "./ActivityCard";

interface SuggestAlternativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onSuggest: (activityId: string, alternative: {
    title: string;
    location: string;
    description: string;
  }) => void;
  onVoteAlternative: (activityId: string, alternativeId: string) => void;
}

export const SuggestAlternativeDialog = ({
  open,
  onOpenChange,
  activity,
  onSuggest,
  onVoteAlternative,
}: SuggestAlternativeDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
  });

  const handleSubmit = () => {
    if (!activity) return;
    onSuggest(activity.id, formData);
    setFormData({ title: "", location: "", description: "" });
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Suggest Alternative for: {activity.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Existing Alternatives */}
            {activity.alternatives && activity.alternatives.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Suggested Alternatives</h3>
                <div className="space-y-3">
                  {activity.alternatives.map((alt) => (
                    <Card key={alt.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{alt.title}</h4>
                            <p className="text-sm text-muted-foreground">{alt.location}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>Suggested by {alt.suggestedBy}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onVoteAlternative(activity.id, alt.id)}
                            className="gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {alt.votes}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* New Alternative Form */}
            <div>
              <h3 className="font-semibold mb-3">Suggest New Alternative</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alt-title">Alternative Activity</Label>
                  <Input
                    id="alt-title"
                    placeholder="Museum visit instead"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="alt-location">Location</Label>
                  <Input
                    id="alt-location"
                    placeholder="National Art Museum"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="alt-description">Why this alternative?</Label>
                  <Textarea
                    id="alt-description"
                    placeholder="Explain why this would be a good alternative..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmit}>
                  Suggest Alternative
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

