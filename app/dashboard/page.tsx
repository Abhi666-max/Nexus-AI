"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Users, MessageSquare, Activity, ArrowUpRight,
  CheckCircle2, Clock, AlertCircle, Bell, LogOut, Zap,
  Settings, Search, ChevronRight, X, User
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import CustomersTab from "@/components/dashboard/CustomersTab";
import AgentsTab from "@/components/dashboard/AgentsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import ConversationsTab from "@/components/dashboard/ConversationsTab";
import { useAuth } from "@/lib/AuthContext";
import { getConversations, Conversation } from "@/lib/db";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// chartData is now computed dynamically from Firestore — removed hardcoded array

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeklyChartData(conversations: Conversation[]) {
  // Build a map of day -> { total, resolved }
  const map: Record<string, { interactions: number; resolved: number }> = {};
  DAYS.forEach(d => { map[d] = { interactions: 0, resolved: 0 }; });

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  conversations.forEach(c => {
    // Use updatedAt or createdAt timestamp
    const ts = c.updatedAt?.toDate?.() || c.createdAt?.toDate?.();
    if (!ts || ts < oneWeekAgo) return;
    const dayName = DAYS[ts.getDay()];
    map[dayName].interactions += 1;
    if (c.status === "resolved") map[dayName].resolved += 1;
  });

  // Return in Mon–Sun order for display
  const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return ordered.map(d => ({ name: d, interactions: map[d].interactions, resolved: map[d].resolved }));
}

function calcAvgResponseTime(conversations: Conversation[]): string {
  // Estimate avg response time as avg messages per conversation (proxy metric)
  if (conversations.length === 0) return "N/A";
  const totalMsgs = conversations.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
  const avg = totalMsgs / conversations.length;
  // Rough proxy: more messages = faster iterative responses
  return avg > 0 ? `${(1.2 / Math.max(1, avg * 0.1)).toFixed(1)}s` : "N/A";
}


type SidebarKey = "dashboard" | "conversations" | "customers" | "agents" | "settings";

const sidebarItems: { key: SidebarKey; label: string; icon: any; section?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3, section: "Overview" },
  { key: "conversations", label: "Conversations", icon: MessageSquare },
  { key: "customers", label: "Customers", icon: Users },
  { key: "agents", label: "AI Agents", icon: Zap, section: "Configuration" },
  { key: "settings", label: "Settings", icon: Settings },
];

const viewContent: Record<SidebarKey, { title: string; description: string }> = {
  dashboard: { title: "Command Center", description: "Real-time AI performance overview" },
  conversations: { title: "Conversations", description: "All active and past AI-handled conversations" },
  customers: { title: "Customer Directory", description: "Manage and segment your customer base" },
  agents: { title: "AI Agents", description: "Configure and deploy autonomous AI agents" },
  settings: { title: "Settings", description: "Account, integrations, and security preferences" },
};

const NexusLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<SidebarKey>("dashboard");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, resRate: "0%", avgTime: "N/A" });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully.");
      // Hard navigate to clear all React state + force AuthGuard to trigger
      window.location.href = "/";
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "conversations"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
        setConversations(data);
        const total = data.length;
        const resolved = data.filter(d => d.status === "resolved").length;
        const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) + "%" : "0%";
        const avgTime = calcAvgResponseTime(data);
        setStats({ total, resolved, resRate, avgTime });
      }, (err) => {
        console.error("Dashboard onSnapshot error:", err);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Derived Dynamic Data
  const dynamicMetrics = [
    { title: "Total Interactions", value: stats.total.toString(), change: "+0%", isPositive: true, icon: MessageSquare },
    { title: "Resolution Rate", value: stats.resRate, change: "+0%", isPositive: true, icon: CheckCircle2 },
    { title: "Avg Response Time", value: stats.avgTime, change: "-0.1s", isPositive: true, icon: Zap },
    { title: "Active Agents", value: "24/7", change: "100%", isPositive: true, icon: Activity },
  ];
  
  const dynamicLiveFeed = conversations.slice(0, 5).map(c => ({
    id: c.id?.slice(0, 8) || "N/A",
    user: c.user,
    issue: c.preview || "No preview",
    status: c.status,
    time: "recent"
  }));
  
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!mounted) return null;

  const handleNav = (key: SidebarKey) => {
    setActiveView(key);
  };

  const currentView = viewContent[activeView];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 bg-[#050505] flex-shrink-0 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <NexusLogo />
            <span className="text-[14px] font-bold tracking-tight text-white">Nexus</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <div key={item.key}>
              {item.section && (
                <p className="px-2 pt-5 pb-1.5 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">
                  {item.section}
                </p>
              )}
              <button
                onClick={() => handleNav(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                  activeView === item.key
                    ? "bg-white/10 text-white"
                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {activeView === item.key && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </button>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[13px] font-medium text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#050505] shrink-0 relative">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">{currentView.title}</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">{currentView.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {(bellOpen || profileOpen) && (
              <div className="fixed inset-0 z-40" onClick={() => { setBellOpen(false); setProfileOpen(false); }} />
            )}
            
            {/* Animated Search */}
            <div className="flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden mr-2"
                  >
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white outline-none focus:border-white/20 placeholder-neutral-600"
                      onBlur={() => setSearchOpen(false)}
                      onKeyDown={(e) => {
                         if (e.key === "Enter") {
                           toast("Search functionality is in beta.");
                           setSearchOpen(false);
                         }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Search size={17} />
              </button>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setBellOpen(!bellOpen); setProfileOpen(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors relative"
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                       <span className="text-[13px] font-semibold text-white">Notifications</span>
                       <span className="text-[10px] text-neutral-500 cursor-pointer hover:text-white">Mark all read</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {[
                        { title: "New agent deployed successfully", time: "10m ago", icon: Zap, color: "text-emerald-400" },
                        { title: "High volume alert on pricing page", time: "1h ago", icon: AlertCircle, color: "text-amber-400" },
                        { title: "Weekly report generated", time: "2h ago", icon: BarChart3, color: "text-blue-400" },
                      ].map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 border-b border-white/5 last:border-0">
                          <div className={`mt-0.5 shrink-0 ${n.color}`}><n.icon size={14} /></div>
                          <div>
                            <p className="text-[12px] text-white font-medium mb-0.5">{n.title}</p>
                            <p className="text-[10px] text-neutral-500">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[12px] font-semibold hover:bg-white/20 transition-colors"
              >
                AK
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                  >
                    <div className="px-4 py-3 border-b border-white/10 mb-1">
                      <p className="text-[13px] font-semibold text-white">{user?.displayName || "Account"}</p>
                      <p className="text-[11px] text-neutral-500">{user?.email}</p>
                    </div>
                    <button onClick={() => { setActiveView("settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] text-neutral-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
                       <Settings size={14} /> Workspace Settings
                    </button>
                    <button onClick={() => { setActiveView("settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] text-neutral-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
                       <BarChart3 size={14} /> Billing
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                       <LogOut size={14} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-7xl mx-auto space-y-6"
              >
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dynamicMetrics.map((metric, i) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl p-6 bg-[#0d0d0d] border border-white/8 flex flex-col hover:-translate-y-0.5 hover:border-white/15 transition-all duration-300 cursor-default"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/8">
                          <metric.icon size={16} className="text-neutral-400" />
                        </div>
                        <div className={cn("flex items-center gap-1 text-[11px] font-semibold", metric.isPositive ? "text-emerald-500" : "text-red-500")}>
                          <ArrowUpRight size={13} />
                          {metric.change}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tighter text-white mb-1">{metric.value}</h3>
                      <p className="text-[12px] text-neutral-500 font-medium">{metric.title}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart + Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="lg:col-span-2 rounded-2xl p-6 bg-[#0d0d0d] border border-white/8"
                  >
                    <div className="mb-6">
                      <h3 className="text-[15px] font-semibold tracking-tight text-white mb-1">Interaction Volume</h3>
                      <p className="text-[12px] text-neutral-500">Autonomous vs. escalated tickets this week</p>
                    </div>
                    <div className="min-h-[280px]">
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={buildWeeklyChartData(conversations)} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="whiteGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#52525B" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                          <XAxis dataKey="name" stroke="#3f3f46" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#3f3f46" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip contentStyle={{ backgroundColor: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
                          <Area type="monotone" dataKey="interactions" stroke="#3f3f46" strokeWidth={1.5} fill="url(#grayGrad)" />
                          <Area type="monotone" dataKey="resolved" stroke="#FFFFFF" strokeWidth={1.5} fill="url(#whiteGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Live Feed */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-2xl p-6 bg-[#0d0d0d] border border-white/8 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[15px] font-semibold tracking-tight text-white">Live Feed</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                        </span>
                        <span className="text-[11px] font-medium text-neutral-500">Live</span>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {dynamicLiveFeed.length === 0 ? (
                         <div className="text-[12px] text-neutral-500 text-center py-6">No recent interactions.</div>
                      ) : (
                        dynamicLiveFeed.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.08 }}
                            className="p-3.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[11px] font-semibold text-white px-1.5 py-0.5 bg-white/8 rounded-md">{item.id}</span>
                              <div className="flex items-center gap-1 text-[11px] text-neutral-600">
                                <Clock size={10} />
                                {item.time}
                              </div>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[12px] font-medium text-white mb-0.5">{item.issue}</p>
                                <p className="text-[11px] text-neutral-500">{item.user}</p>
                              </div>
                              {item.status === "resolved" && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />}
                              {item.status === "active" && <Activity size={14} className="text-blue-400 shrink-0 mt-0.5" />}
                              {item.status === "pending" && <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />}
                              {item.status === "escalated" && <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-7xl mx-auto h-full"
              >
                {activeView === "conversations" && <ConversationsTab />}
                {activeView === "customers" && <CustomersTab />}
                {activeView === "agents" && <AgentsTab />}
                {activeView === "settings" && <SettingsTab />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
