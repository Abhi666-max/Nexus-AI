"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  Activity, Users, DollarSign, Database, ShieldAlert, Loader2,
  LogOut, Globe, Trash2, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ADMIN_EMAIL = "abhi.admin.dev@gmail.com";

interface AdminUser {
  id: string;
  name?: string;
  company?: string;
  apiKey?: string;
  createdAt?: any;
}

interface AdminConversation {
  id: string;
  userId: string;
  user: string;
  status: string;
  messages?: any[];
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalConversations: 0,
    activeWorkspaces: 0,
  });

  // MILITARY-GRADE SECURITY: Immediate redirect for any non-admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Not logged in at all — send to admin login portal
        router.replace("/admin/login");
      } else if (user.email !== ADMIN_EMAIL) {
        // Logged in as wrong user — bounce to their dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;

    const fetchGlobalData = async () => {
      try {
        const [usersSnap, convosSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "conversations")),
        ]);

        const usersData: AdminUser[] = usersSnap.docs.map(d => ({ id: d.id, ...d.data() as Omit<AdminUser, "id"> }));
        const convosData: AdminConversation[] = convosSnap.docs.map(d => ({ id: d.id, ...d.data() as Omit<AdminConversation, "id"> }));

        // Count unique userIds with ≥1 conversation as "active workspaces"
        const activeWorkspaceIds = new Set(convosData.map(c => c.userId)).size;

        setUsers(usersData);
        setConversations(convosData);
        setGlobalStats({
          totalUsers: usersData.length,
          totalRevenue: usersData.length * 199, // Simulated at $199/user
          totalConversations: convosData.length,
          activeWorkspaces: activeWorkspaceIds,
        });
      } catch (err) {
        console.error("Admin fetch error:", err);
        toast.error("Failed to load global data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, [user]);

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm(`Permanently revoke access for user ${userId}? This is irreversible.`)) return;
    setRevokingId(userId);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      setGlobalStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1, totalRevenue: Math.max(0, prev.totalRevenue - 199) }));
      toast.success("Access revoked", { description: `User ${userId.slice(0, 8)}... has been removed from the platform.` });
    } catch (err: any) {
      toast.error("Revoke failed", { description: err.message });
    } finally {
      setRevokingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#060303] flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="text-red-500 animate-pulse" size={40} />
        <p className="text-red-400 text-sm font-mono tracking-widest animate-pulse">AUTHENTICATING...</p>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const metricCards = [
    {
      title: "Registered Workspaces",
      value: globalStats.totalUsers.toLocaleString(),
      sub: `${globalStats.activeWorkspaces} active`,
      icon: Users,
      color: "from-red-950/60 to-[#0a0202]",
      border: "border-red-900/40",
      iconColor: "text-red-400",
      glowColor: "bg-red-500/10",
    },
    {
      title: "Platform MRR",
      value: `$${globalStats.totalRevenue.toLocaleString()}`,
      sub: "$199 × users",
      icon: DollarSign,
      color: "from-amber-950/60 to-[#0a0502]",
      border: "border-amber-900/40",
      iconColor: "text-amber-400",
      glowColor: "bg-amber-500/10",
    },
    {
      title: "Global Conversations",
      value: globalStats.totalConversations.toLocaleString(),
      sub: "All tenants",
      icon: Globe,
      color: "from-orange-950/60 to-[#0a0302]",
      border: "border-orange-900/40",
      iconColor: "text-orange-400",
      glowColor: "bg-orange-500/10",
    },
    {
      title: "Platform Health",
      value: "100%",
      sub: "All systems nominal",
      icon: Activity,
      color: "from-rose-950/60 to-[#0a0202]",
      border: "border-rose-900/40",
      iconColor: "text-rose-400",
      glowColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060303] text-white font-sans">
      {/* Top Bar — Founder Mode Indicator */}
      <div className="h-1 w-full bg-gradient-to-r from-red-700 via-amber-500 to-red-700" />

      <nav className="h-14 border-b border-red-900/30 bg-[#0a0404]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="text-red-400" size={14} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">God Mode</span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-amber-300">Founder Access — {user.email}</span>
          </div>
          <Link href="/dashboard" className="text-xs font-medium text-red-400/70 hover:text-red-300 flex items-center gap-1.5 transition-colors">
            <LogOut size={13} /> Exit
          </Link>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-white mb-1">Global Command Center</h1>
          <p className="text-[13px] text-red-400/60">Full platform access · All tenant data · Zero restrictions</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metricCards.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`bg-gradient-to-br ${m.color} border ${m.border} p-6 rounded-2xl relative overflow-hidden group`}
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${m.glowColor} rounded-full blur-2xl transition-all group-hover:scale-150`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${m.iconColor} opacity-70`}>{m.title}</p>
                <m.icon size={16} className={m.iconColor} />
              </div>
              <p className="text-3xl font-bold tracking-tighter text-white relative z-10">{m.value}</p>
              <p className="text-[11px] text-red-200/40 mt-1 relative z-10">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* User Registry Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0d0505]/80 border border-red-900/20 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="px-6 py-5 border-b border-red-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={15} className="text-red-500" />
              <h3 className="text-sm font-semibold text-red-100">User Registry</h3>
              <span className="text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{users.length} records</span>
            </div>
            <span className="text-[10px] text-red-400/40 font-mono">CLEARANCE: LEVEL 5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 border-b border-red-900/20 text-[10px] uppercase tracking-widest text-red-400/50">
                  <th className="px-6 py-4 font-semibold">User ID</th>
                  <th className="px-6 py-4 font-semibold">Identity</th>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Conversations</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-red-900/10">
                <AnimatePresence>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-red-500/40 text-sm">
                        No registered users found in Firestore.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => {
                      const userConvoCount = conversations.filter(c => c.userId === u.id).length;
                      return (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-red-900/10 transition-colors group"
                        >
                          <td className="px-6 py-4 font-mono text-[11px] text-red-200/40">{u.id.slice(0, 16)}...</td>
                          <td className="px-6 py-4">
                            <p className="text-red-100 font-medium">{u.name || "—"}</p>
                          </td>
                          <td className="px-6 py-4 text-red-200/60">{u.company || "—"}</td>
                          <td className="px-6 py-4">
                            <span className="text-[12px] font-mono text-amber-400">{userConvoCount}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRevokeAccess(u.id)}
                              disabled={revokingId === u.id}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            >
                              {revokingId === u.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                              Revoke Access
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Global Conversations Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0d0505]/80 border border-red-900/20 rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-red-900/20 flex items-center gap-3">
            <Globe size={15} className="text-red-500" />
            <h3 className="text-sm font-semibold text-red-100">Global Conversation Feed</h3>
            <span className="text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">{conversations.length} total</span>
          </div>
          <div className="divide-y divide-red-900/10 max-h-80 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="px-6 py-12 text-center text-red-500/40 text-sm">No conversations on platform yet.</div>
            ) : (
              conversations.slice(0, 20).map((c, i) => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-red-900/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${c.status === "escalated" ? "bg-red-400 animate-pulse" : c.status === "resolved" ? "bg-emerald-400" : "bg-blue-400"}`} />
                    <div>
                      <p className="text-[13px] text-red-100 font-medium">{c.user}</p>
                      <p className="text-[10px] text-red-400/40 font-mono">{c.id.slice(0, 16)}... · tenant: {c.userId?.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-red-200/40 font-mono">{c.messages?.length || 0} msgs</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider
                      ${c.status === "escalated" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                        c.status === "resolved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                        "bg-blue-500/15 text-blue-400 border border-blue-500/20"}`
                    }>{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
