"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, Users, DollarSign, Database, ShieldAlert, Loader2, LogOut } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "abhi.admin.dev@gmail.com";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalRevenue: 0, totalConversations: 0 });

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      const fetchData = async () => {
        try {
          // In a real app we'd use admin SDK, but since this is client side for hackathon:
          const usersSnap = await getDocs(collection(db, "users"));
          const convosSnap = await getDocs(collection(db, "conversations"));
          
          const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          const convosData = convosSnap.docs.map(d => d.data());

          setUsers(usersData);
          setGlobalStats({
            totalUsers: usersData.length,
            totalRevenue: usersData.length * 999, // Assuming Enterprise plan for all
            totalConversations: convosData.length
          });
        } catch (err) {
          console.error("Failed to load admin data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[#0a0505] text-white">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-red-900/30 bg-[#0d0707] px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={20} />
          <span className="font-bold tracking-tight text-white uppercase text-sm tracking-widest">God Mode <span className="text-red-500">Terminal</span></span>
        </div>
        <Link href="/dashboard" className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-2 transition-colors">
          <LogOut size={14} /> Exit Admin
        </Link>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-gradient-to-br from-[#1a0505] to-[#0a0202] border border-red-900/30 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400/80">Total Users</p>
              <Users size={16} className="text-red-500" />
            </div>
            <p className="text-4xl font-bold tracking-tighter text-white">{globalStats.totalUsers.toLocaleString()}</p>
          </motion.div>
          
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-gradient-to-br from-[#1a0f05] to-[#0a0502] border border-orange-900/30 p-6 rounded-2xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/80">Platform MRR</p>
              <DollarSign size={16} className="text-orange-500" />
            </div>
            <p className="text-4xl font-bold tracking-tighter text-white">${globalStats.totalRevenue.toLocaleString()}</p>
          </motion.div>

          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-gradient-to-br from-[#1a050f] to-[#0a0205] border border-pink-900/30 p-6 rounded-2xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-400/80">API Volume</p>
              <Activity size={16} className="text-pink-500" />
            </div>
            <p className="text-4xl font-bold tracking-tighter text-white">{globalStats.totalConversations.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Database Table */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.4}} className="bg-[#0f0707] border border-red-900/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-red-900/20 flex items-center justify-between">
             <h3 className="text-sm font-semibold text-red-100 flex items-center gap-2"><Database size={16} className="text-red-500"/> User Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-red-900/20 text-[10px] uppercase tracking-widest text-red-400/60">
                  <th className="px-6 py-4 font-semibold">User ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold text-right">API Key</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-red-500/50">No users registered yet.</td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id || i} className="border-b border-red-900/10 hover:bg-red-900/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-red-200/50">{u.id}</td>
                      <td className="px-6 py-4 text-red-100 font-medium">{u.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-red-200/70">{u.company || "N/A"}</td>
                      <td className="px-6 py-4 text-right font-mono text-[10px] text-red-400/50">{u.apiKey || "Not Generated"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
