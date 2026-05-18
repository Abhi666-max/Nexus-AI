"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Minimize2 } from "lucide-react";

interface Message { id: string; role: "user"|"assistant"; content: string; }

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><Bot size={12} className="text-black"/></div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#111] border border-white/8">
        <div className="flex gap-1">
          {[0,1,2].map(i=>(
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-500"
              animate={{opacity:[0.3,1,0.3],scale:[0.8,1,0.8]}}
              transition={{duration:1,repeat:Infinity,delay:i*0.2,ease:"easeInOut"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({msg}:{msg:Message}) {
  const isUser = msg.role==="user";
  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser?"flex-row-reverse":""}`}>
      {!isUser&&<div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0"><Bot size={12} className="text-black"/></div>}
      <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${isUser?"rounded-br-sm bg-white text-black font-medium":"rounded-bl-sm bg-[#111] text-neutral-200 border border-white/8"}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function NexusWidget() {
  const [open,setOpen]=useState(false);
  const [messages,setMessages]=useState<Message[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);
  
  useEffect(()=>{
    if(open) {
      setTimeout(()=>inputRef.current?.focus(),100);
      if(messages.length === 0) {
        setMessages([{id:"greeting",role:"assistant",content:"Hi, I'm Nexus. How can I help you today?"}]);
      }
    }
  },[open, messages.length]);

  const send=async()=>{
    const text=input.trim();
    if(!text||loading)return;
    const userMsg:Message={id:Date.now().toString(),role:"user",content:text};
    setMessages(p=>[...p,userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...messages,userMsg].map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json();
      setMessages(p=>[...p,{id:Date.now()+"_ai",role:"assistant",content:data.message??data.error??"Something went wrong."}]);
    } catch {
      setMessages(p=>[...p,{id:Date.now()+"_err",role:"assistant",content:"Connection error. Please try again."}]);
    } finally {setLoading(false);}
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,scale:0.94,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:12}}
            transition={{duration:0.28,ease:[0.16,1,0.3,1] as any}}
            className="w-[370px] sm:w-[400px] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
            style={{height:"560px",background:"#0A0A0A"}}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-white/8 bg-[#0d0d0d]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><Bot size={15} className="text-black"/></div>
                <div>
                  <p className="text-[13px] font-semibold text-white tracking-tight">Nexus</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    <span className="text-[11px] text-neutral-500">Online · replies instantly</span>
                  </div>
                </div>
              </div>
              <button onClick={()=>setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/8 transition-colors"><Minimize2 size={15}/></button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 bg-[#080808]">
              {messages.map(m=><Bubble key={m.id} msg={m}/>)}
              {loading&&<TypingDots/>}
              <div ref={bottomRef}/>
            </div>
            {/* Input */}
            <div className="p-4 shrink-0 bg-[#0d0d0d] border-t border-white/8">
              <div className="flex items-end gap-2 bg-[#111] border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                  placeholder="Send a message..." disabled={loading} rows={1}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-neutral-600 outline-none disabled:opacity-40 resize-none py-1.5 px-1 max-h-28 min-h-[36px] leading-relaxed"/>
                <button onClick={send} disabled={!input.trim()||loading}
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 bg-white hover:bg-neutral-200 text-black mb-0.5">
                  <Send size={14} className="ml-0.5"/>
                </button>
              </div>
              <p className="text-center text-[11px] text-neutral-600 mt-2.5 font-medium">Powered by Nexus AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button onClick={()=>setOpen(v=>!v)} whileTap={{scale:0.93}}
        className="w-13 h-13 rounded-full flex items-center justify-center shadow-2xl bg-white text-black hover:bg-neutral-100 transition-colors"
        style={{width:52,height:52}}>
        <AnimatePresence mode="wait">
          {open?(
            <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.18}}><X size={22}/></motion.div>
          ):(
            <motion.div key="msg" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.18}}><MessageSquare size={22}/></motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
