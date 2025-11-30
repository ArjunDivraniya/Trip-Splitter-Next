// placeholder for `trip/[id]/chat/page.tsx` (migrated from Chat.tsx)
// File intentionally left without component code.
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text?: string;
  expenseData?: {
    title: string;
    amount: number;
    category: string;
  };
  timestamp: Date;
  isSelf: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userId: "1",
      userName: "Arjun",
      userAvatar: "",
      text: "Hey everyone! Excited for the trip!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isSelf: false,
    },
    {
      id: "2",
      userId: "2",
      userName: "Priya",
      userAvatar: "",
      text: "Can't wait! Should we book the hotel?",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      isSelf: false,
    },
    {
      id: "3",
      userId: "current",
      userName: "You",
      userAvatar: "",
      expenseData: {
        title: "Hotel Booking",
        amount: 5000,
        category: "hotel",
      },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isSelf: true,
    },
    {
      id: "4",
      userId: "3",
      userName: "Krish",
      userAvatar: "",
      text: "Thanks for booking! I'll transfer my share",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isSelf: false,
    },
    {
      id: "5",
      userId: "current",
      userName: "You",
      userAvatar: "",
      text: "No worries! We can settle up at the end",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isSelf: true,
    },
  ]);

  const tripMembers = [
    { id: "1", name: "Arjun", avatar: "" },
    { id: "2", name: "Priya", avatar: "" },
    { id: "3", name: "Krish", avatar: "" },
    { id: "current", name: "You", avatar: "" },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: "current",
      userName: "You",
      userAvatar: "",
      text: message,
      timestamp: new Date(),
      isSelf: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "🍽️",
      travel: "✈️",
      hotel: "🏨",
      shopping: "🛍️",
      other: "📝",
    };
    return icons[category] || "💰";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/trip/${id}`)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex -space-x-2">
                {tripMembers.slice(0, 3).map((member, idx) => (
                  <Avatar key={member.id} className="h-10 w-10 border-2 border-card">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Goa Beach Trip</h1>
                <p className="text-xs text-muted-foreground">
                  {tripMembers.length} members
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="container max-w-4xl mx-auto px-4 pb-24">
        <ScrollArea className="h-[calc(100vh-180px)] py-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : "flex-row"}`}
              >
                {!msg.isSelf && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.userAvatar} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {msg.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"} max-w-[75%]`}>
                  {!msg.isSelf && (
                    <span className="text-xs font-medium text-muted-foreground mb-1 px-2">
                      {msg.userName}
                    </span>
                  )}

                  {msg.expenseData ? (
                    <Card className="p-3 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getCategoryIcon(msg.expenseData.category)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            Expense Added
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {msg.expenseData.title}
                          </p>
                          <p className="text-lg font-bold text-success mt-1">
                            ₹{msg.expenseData.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 text-right">
                        {formatTime(msg.timestamp)}
                      </div>
                    </Card>
                  ) : (
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${
                        msg.isSelf
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card text-card-foreground rounded-tl-sm border border-border"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          msg.isSelf ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  )}
                </div>

                {msg.isSelf && <div className="w-8" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-primary"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <div className="flex-1 bg-background rounded-full border border-input px-4 py-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-auto bg-transparent"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="shrink-0 rounded-full h-10 w-10"
              disabled={!message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;