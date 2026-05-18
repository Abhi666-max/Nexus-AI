"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Edit2, Trash2, UserPlus, X, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, Customer, upsertConversation } from "@/lib/db";

const statusStyle: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  churned: "bg-red-500/15 text-red-400 border-red-500/20",
  trial: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function CustomersTab() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [chatCustomer, setChatCustomer] = useState<Customer | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", status: "active", ltv: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: "user"|"assistant", content: string, time: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadCustomers = async () => {
    if (!user) return;
    try {
      const data = await getCustomers(user.uid);
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.email.toLowerCase().includes(q.toLowerCase()) ||
    c.status.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", status: "active", ltv: "" });
    setIsFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id || null);
    setFormData({ name: c.name, email: c.email, status: c.status, ltv: c.ltv });
    setIsFormOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.name || !formData.email || !formData.ltv) {
      return toast.error("Please fill in all fields.");
    }
    
    setSaving(true);
    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
        toast.success("Customer updated successfully");
      } else {
        await addCustomer(user.uid, { ...formData, joined: new Date().toISOString().split("T")[0] } as any);
        toast.success("Customer added successfully");
      }
      setIsFormOpen(false);
      await loadCustomers();
    } catch (err: any) {
      toast.error("An error occurred", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteCustomer(deletingId);
      toast.success("Customer deleted permanently.");
      setIsDeleteOpen(false);
      await loadCustomers();
    } catch (err: any) {
      toast.error("Failed to delete customer", { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || !chatCustomer) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: "user" as const, content: chatInput.trim(), time };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      
      if (data.escalated) {
        // UPSERT: Append only user message
        if (chatCustomer.id) {
          upsertConversation(user.uid, chatCustomer.id, chatCustomer.name, [userMsg])
            .catch(err => console.error("[upsert]", err));
        }
      } else {
        const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMsg = { role: "assistant" as const, content: data.message || "Error", time: aiTime };
        const finalMsgs = [...newMsgs, aiMsg];
        setChatMessages(finalMsgs);
        
        // UPSERT: Append to existing thread or create new one — no duplicate docs
        if (chatCustomer.id) {
          upsertConversation(
            user.uid,
            chatCustomer.id,
            chatCustomer.name,
            [userMsg, aiMsg]  // Only append the NEW messages, not the full history
          ).catch(err => console.error("[upsert]", err));
        }
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch AI response");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const openChat = async (c: Customer) => {
    setChatCustomer(c);
    setChatMessages([]);
    setIsChatOpen(true);
    setChatLoading(true);
    
    try {
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const q = query(collection(db, "conversations"), where("userId", "==", user!.uid), where("customerId", "==", c.id));
      const snap = await getDocs(q);
      
      if (!snap.empty && snap.docs[0].data().messages?.length > 0) {
        setChatMessages(snap.docs[0].data().messages);
      } else {
        setChatMessages([{ 
          role: "assistant", 
          content: "Hi, I'm Nexus. How can I help you today?", 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setChatLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(q.toLowerCase()) || 
    c.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">Customers</h2>
        <button onClick={openAdd} className="bg-white text-black px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-neutral-200 transition-colors">
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 max-w-sm focus-within:border-white/20 transition-colors">
        <Search size={16} className="text-neutral-500" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..." className="bg-transparent text-[13px] text-white placeholder-neutral-600 outline-none flex-1" />
      </div>

      <div className="border border-white/8 bg-[#0d0d0d] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-neutral-500">
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">LTV</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-white">
            {loading ? (
              [1,2,3].map(i => (
                <tr key={i} className="border-b border-white/5 animate-pulse">
                  <td className="px-6 py-4"><div className="w-24 h-4 bg-white/10 rounded mb-1"/><div className="w-32 h-3 bg-white/5 rounded"/></td>
                  <td className="px-6 py-4"><div className="w-16 h-5 bg-white/10 rounded-full"/></td>
                  <td className="px-6 py-4"><div className="w-12 h-4 bg-white/10 rounded"/></td>
                  <td className="px-6 py-4"><div className="w-16 h-4 bg-white/10 rounded"/></td>
                  <td className="px-6 py-4 text-right"><div className="w-16 h-6 bg-white/10 rounded ml-auto"/></td>
                </tr>
              ))
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 text-[13px]">
                  No customers found. Click 'Add Customer' to get started.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-[12px] text-neutral-500">{c.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border rounded-full ${statusStyle[c.status] || statusStyle.active}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[12px]">{c.ltv}</td>
                  <td className="px-6 py-4 text-neutral-400">{c.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openChat(c)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all" title="Simulate AI Chat"><MessageSquare size={13}/></button>
                      <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-neutral-400 hover:text-white hover:bg-white/20 transition-all" title="Edit"><Edit2 size={13}/></button>
                      <button onClick={() => openDelete(c.id!)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all" title="Delete"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setIsFormOpen(false)} />
            <motion.div initial={{opacity:0, scale:0.95, y:10}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:10}} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6">
              <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X size={18}/></button>
              <h3 className="text-lg font-semibold text-white mb-6">{editingId ? "Edit Customer" : "Add Customer"}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Full Name</label>
                  <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20" required />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Email Address</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Status</label>
                    <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20 appearance-none">
                      <option value="active" className="bg-[#111]">Active</option>
                      <option value="trial" className="bg-[#111]">Trial</option>
                      <option value="churned" className="bg-[#111]">Churned</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Lifetime Value (LTV)</label>
                    <input value={formData.ltv} onChange={e=>setFormData({...formData, ltv: e.target.value})} placeholder="$1,500" className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20" required />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={()=>setIsFormOpen(false)} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-neutral-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="bg-white text-black px-6 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin"/> : editingId ? "Save Changes" : "Add Customer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setIsDeleteOpen(false)} />
            <motion.div initial={{opacity:0, scale:0.95, y:10}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:10}} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Are you sure?</h3>
              <p className="text-[13px] text-neutral-400 mb-6">This action cannot be undone. This will permanently delete the customer from your database.</p>
              <div className="flex gap-3">
                <button onClick={()=>setIsDeleteOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? <Loader2 size={16} className="animate-spin"/> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Simulation Modal */}
      <AnimatePresence>
        {isChatOpen && chatCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !chatLoading && setIsChatOpen(false)} />
            <motion.div initial={{opacity:0, scale:0.95, y:10}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:10}} className="relative w-full max-w-lg h-[600px] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                    {chatCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">Simulating: {chatCustomer.name}</h3>
                    <p className="text-[11px] text-neutral-500">Transcripts are auto-saved to DB</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={18}/></button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center px-4">
                    <p className="text-[13px] text-neutral-500">Send a message to simulate what {chatCustomer.name} would say. The AI will respond as Nexus.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                       <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${isUser ? "rounded-tr-sm bg-white text-black" : "rounded-tl-sm bg-[#1a1a1a] border border-white/10 text-white"}`}>
                         {msg.content}
                       </div>
                       <span className="text-[10px] text-neutral-600 mt-1">{msg.time}</span>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex flex-col items-start">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#1a1a1a] border border-white/10 text-white flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{animationDelay:"0ms"}}/>
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{animationDelay:"150ms"}}/>
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{animationDelay:"300ms"}}/>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5 bg-[#0a0a0a] shrink-0 flex items-center gap-2">
                <input 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Type a simulated message..." 
                  disabled={chatLoading}
                  className="flex-1 bg-white/5 border border-white/10 text-white text-[13px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors disabled:opacity-50"
                />
                <button type="submit" disabled={!chatInput.trim() || chatLoading} className="bg-white text-black px-5 py-3 rounded-xl text-[13px] font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50">Send</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
