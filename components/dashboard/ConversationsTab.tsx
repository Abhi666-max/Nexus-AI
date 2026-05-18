"use client";
import { useState, useEffect } from "react";
import { Search, Bot, User, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/AuthContext";
import { getConversations, Conversation } from "@/lib/db";
import { toast } from "sonner";

export default function ConversationsTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchConvos = async () => {
      try {
        const data = await getConversations(user.uid);
        setConversations(data);
        if (data.length > 0) setActiveId(data[0].id || null);
      } catch (err: any) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, [user]);

  const filtered = conversations.filter(c =>
    c.user.toLowerCase().includes(q.toLowerCase()) ||
    c.preview.toLowerCase().includes(q.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConv.id) {
        return {
          ...conv,
          messages: [...conv.messages, { role: "assistant", content: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
          preview: newMessage
        };
      }
      return conv;
    }));
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Left List */}
      <div className="w-80 flex flex-col border border-white/8 bg-[#0d0d0d] rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
            <Search size={14} className="text-neutral-500 shrink-0" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search conversations..." className="bg-transparent text-[13px] text-white placeholder-neutral-600 outline-none flex-1 min-w-0" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-center text-neutral-500 text-[12px]">Loading conversations...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-[12px]">No conversations found.</div>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id || null)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${activeId === c.id ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-white">{c.user}</span>
                  <span className="text-[11px] text-neutral-500">{c.createdAt ? "recent" : ""}</span>
                </div>
                <p className="text-[12px] text-neutral-400 line-clamp-1 mb-2">{c.preview}</p>
                <div className="flex items-center gap-2">
                  {c.status === "resolved" && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400"><CheckCircle2 size={10} /> Resolved</span>}
                  {c.status === "active" && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400"><Bot size={10} /> AI Active</span>}
                  {c.status === "escalated" && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400"><AlertCircle size={10} /> Escalated</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Transcript Viewer */}
      <div className="flex-1 flex flex-col border border-white/8 bg-[#0d0d0d] rounded-2xl overflow-hidden relative">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0d0d0d]/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                  {activeConv.user.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white">{activeConv.user}</h3>
                  <p className="text-[11px] text-neutral-500">{activeConv.id?.slice(0,8)}</p>
                </div>
              </div>
              <button className="text-[12px] font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/10">Takeover</button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 pb-4">
               {activeConv.messages.map((msg, i) => {
                 const isUser = msg.role === "user";
                 return (
                   <div key={i} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-white/10 text-white" : "bg-white text-black"}`}>
                       {isUser ? <User size={14} /> : <Bot size={14} />}
                     </div>
                     <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                       <div className={`max-w-md px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${isUser ? "rounded-tr-sm bg-[#1a1a1a] border border-white/10 text-white" : "rounded-tl-sm bg-[#111] border border-white/8 text-neutral-200"}`}>
                         {msg.content}
                       </div>
                       <span className="text-[10px] text-neutral-500 mt-1.5 px-1">{msg.time}</span>
                     </div>
                   </div>
                 );
               })}
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0d0d0d] shrink-0 flex items-center gap-2">
              <input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type your message..." 
                className="flex-1 bg-white/5 border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors"
              />
              <button type="submit" disabled={!newMessage.trim()} className="bg-white text-black px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50">Send</button>
            </form>
          </>
        ) : (
           <div className="flex-1 flex items-center justify-center text-[13px] text-neutral-500">
              Select a conversation to view transcript
           </div>
        )}
      </div>
    </div>
  );
}
