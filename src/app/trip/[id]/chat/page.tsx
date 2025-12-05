"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Chat = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // 1. Fetch User ID (to distinguish own messages)
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      if (res.ok) setCurrentUserId(data.data._id);
    };
    fetchUser();
  }, []);

  // 2. Fetch Messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/trips/${id}/chat`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMessages();
      // Simple polling every 5 seconds for updates
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/trips/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 flex-none">
        <div className="container mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Group Chat</h1>
            <p className="text-xs text-muted-foreground">Discuss plans & expenses</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">No messages yet. Say hi! 👋</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === currentUserId;
            return (
              <div key={msg._id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={msg.sender.profileImage} />
                  <AvatarFallback>{msg.sender.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none"
                }`}>
                  {!isMe && <p className="text-[10px] opacity-70 mb-1 font-semibold">{msg.sender.name}</p>}
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t flex-none">
        <form 
          className="flex gap-2 container mx-auto max-w-2xl"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;