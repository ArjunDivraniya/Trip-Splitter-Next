// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ArrowLeft, Send, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// interface Message {
//   _id: string;
//   content: string;
//   sender: {
//     _id: string;
//     name: string;
//     profileImage?: string;
//   };
//   createdAt: string;
// }

// const Chat = () => {
//   const router = useRouter();
//   const params = useParams();
//   const id = params.id;
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string>("");

//   // 1. Fetch User ID (to distinguish own messages)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await fetch("/api/user/me");
//         const data = await res.json();
//         if (res.ok) setCurrentUserId(data.data._id);
//       } catch (e) {
//         console.error("Failed to fetch user");
//       }
//     };
//     fetchUser();
//   }, []);

//   // 2. Fetch Messages
//   const fetchMessages = async () => {
//     try {
//       const res = await fetch(`/api/trips/${id}/chat`);
//       const data = await res.json();
//       if (data.success) {
//         setMessages(data.data);
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       fetchMessages();
//       // Simple polling every 3 seconds for updates
//       const interval = setInterval(fetchMessages, 3000);
//       return () => clearInterval(interval);
//     }
//   }, [id]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async () => {
//     if (!newMessage.trim()) return;
//     setSending(true);
//     try {
//       const res = await fetch(`/api/trips/${id}/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: newMessage }),
//       });
      
//       const data = await res.json();
//       if (data.success) {
//         setMessages((prev) => [...prev, data.data]);
//         setNewMessage("");
//       }
//     } catch (error) {
//       toast.error("Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-background">
//       {/* Header */}
//       <header className="bg-card border-b p-4 flex-none sticky top-0 z-10">
//         <div className="container mx-auto flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <h1 className="font-bold text-lg">Group Chat</h1>
//             <p className="text-xs text-muted-foreground">Discuss plans & expenses</p>
//           </div>
//         </div>
//       </header>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
//         {loading ? (
//           <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
//         ) : messages.length === 0 ? (
//           <div className="text-center text-muted-foreground py-10">No messages yet. Say hi! 👋</div>
//         ) : (
//           messages.map((msg) => {
//             // Safe access to sender properties
//             const sender = msg.sender || {};
//             const senderId = sender._id || "unknown";
//             const senderName = sender.name || "Unknown";
//             const senderImage = sender.profileImage || "";
//             const isMe = senderId === currentUserId;

//             return (
//               <div key={msg._id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
//                 <Avatar className="h-8 w-8 mt-1 border border-border">
//                   <AvatarImage src={senderImage} />
//                   <AvatarFallback>{senderName.charAt(0).toUpperCase()}</AvatarFallback>
//                 </Avatar>
//                 <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
//                   isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none"
//                 }`}>
//                   {!isMe && <p className="text-[10px] opacity-70 mb-1 font-semibold">{senderName}</p>}
//                   <p className="break-words">{msg.content}</p>
//                   <p className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
//                     {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </p>
//                 </div>
//               </div>
//             );
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-4 bg-card border-t flex-none">
//         <form 
//           className="flex gap-2 container mx-auto max-w-2xl"
//           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
//         >
//           <Input 
//             placeholder="Type a message..." 
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             className="flex-1"
//           />
//           <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Chat;

"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Zap, Loader2 } from "lucide-react";

const ChatPage = () => {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid rendering on the server to prevent hydration mismatches
    return null;
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

      {/* Coming Soon Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Icon */}
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
            <MessageCircle className="h-10 w-10 text-blue-600" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Trip Chat</h1>
            <p className="text-muted-foreground text-lg">Coming Soon</p>
          </div>

          {/* Description */}
          <Card className="bg-primary/5 border-primary/20 w-full">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Stay tuned! We're working on a real-time chat feature that will let you communicate with your trip members right here.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm">Share trip updates and coordinates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm">Discuss expenses and plans in one place</span>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm">Real-time notifications for all members</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button variant="outline" onClick={() => router.back()}>
            Go Back to Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
