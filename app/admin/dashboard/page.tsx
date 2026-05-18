"use client";
import { useEffect, useState } from "react";
import { getAllUsers, getAllConversations } from "@/lib/db";
import { Users, MessageSquare, ShieldAlert, LogOut, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, c] = await Promise.all([
          getAllUsers(),
          getAllConversations()
        ]);
        setUsers(u);
        setConversations(c);
      } catch (error) {
        console.error("Admin fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans selection:bg-purple-500/30">
      <header className="h-16 flex items-center justify-between px-8 border-b border-purple-500/10 bg-[#0a0a0a] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-tight text-white uppercase tracking-widest">God Mode</h1>
            <p className="text-[10px] text-purple-400 font-medium">Super Admin Console</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-[12px] font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
          <LogOut size={14} /> Exit God Mode
        </Link>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-8">
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0a] border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80}/></div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><Users size={14}/></div>
                  <h3 className="text-[13px] font-medium text-neutral-400">Total Registered Users</h3>
                </div>
                <p className="text-4xl font-bold tracking-tighter text-white">{users.length}</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={80}/></div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><MessageSquare size={14}/></div>
                  <h3 className="text-[13px] font-medium text-neutral-400">Global AI Conversations</h3>
                </div>
                <p className="text-4xl font-bold tracking-tighter text-white">{conversations.length}</p>
              </div>

              <div className="bg-[#0a0a0a] border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Database size={80}/></div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><Database size={14}/></div>
                  <h3 className="text-[13px] font-medium text-neutral-400">DB Status</h3>
                </div>
                <p className="text-xl font-bold tracking-tight text-emerald-400 mt-2">Healthy & Synced</p>
              </div>
            </div>

            {/* Master User List */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[14px] font-semibold text-white">Master Account Registry</h3>
                <span className="text-[11px] text-purple-400 font-medium px-2 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">CONFIDENTIAL</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-neutral-500 bg-[#050505]">
                    <th className="px-6 py-3 font-semibold">User ID</th>
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Company</th>
                    <th className="px-6 py-3 font-semibold text-right">API Key</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-white">
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500 text-[12px]">No users found in database.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3 font-mono text-[11px] text-neutral-500">{u.id}</td>
                        <td className="px-6 py-3">{u.name || <span className="text-neutral-600 italic">Not set</span>}</td>
                        <td className="px-6 py-3">{u.company || <span className="text-neutral-600 italic">Not set</span>}</td>
                        <td className="px-6 py-3 text-right">
                          {u.apiKey ? (
                            <span className="font-mono text-[11px] text-neutral-400 bg-white/5 px-2 py-1 rounded border border-white/10">
                              {u.apiKey.slice(0, 12)}...
                            </span>
                          ) : (
                            <span className="text-neutral-600 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}
