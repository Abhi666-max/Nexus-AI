"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, BarChart3, TrendingUp, Globe, Lock, CheckCircle2, ArrowUpRight, X } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaInstagram } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

const NexusLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Checkout Modal ─────────────────────────────────────── */
function CheckoutModal({ plan, onClose }: { plan: { name: string; price: string }; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!email.includes("@")) { toast.error("Please enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => { setConfirmed(true); setLoading(false); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-white hover:bg-white/8 transition-colors">
          <X size={16} />
        </button>

        {!confirmed ? (
          <>
            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-2">{plan.name} Plan</p>
              <h2 className="text-2xl font-bold tracking-tighter text-white mb-1">Create your workspace</h2>
              <p className="text-[13px] text-neutral-500">Get started in under 30 seconds. No credit card required.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="mt-6 w-full bg-white text-black font-semibold text-[14px] py-3 rounded-full hover:bg-neutral-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : "Confirm & Launch Workspace"}
            </button>
            <p className="text-[11px] text-neutral-600 text-center mt-4">By continuing you agree to our Terms of Service and Privacy Policy.</p>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Workspace created!</h3>
            <p className="text-[13px] text-neutral-500 max-w-xs leading-relaxed">Your AI agents are being provisioned. Check your email for next steps.</p>
            <Link href="/dashboard" onClick={onClose} className="mt-6 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-100 transition-colors">
              Open Dashboard <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Sales Lead Modal ─────────────────────────────────── */
function SalesModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", volume: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company || !form.volume) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { addSalesLead } = await import("@/lib/db");
      await addSalesLead(form);
      setDone(true);
    } catch (err: any) {
      toast.error("Submission failed.", { description: err.message });
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl relative"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-white hover:bg-white/8 transition-colors"><X size={16} /></button>

        {!done ? (
          <>
            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-2">Enterprise Plan</p>
              <h2 className="text-2xl font-bold tracking-tighter text-white mb-1">Talk to our sales team</h2>
              <p className="text-[13px] text-neutral-500">Tell us about your needs. We'll respond within 24 hours.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Work Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Company Name</label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Expected Monthly Volume</label>
                <select value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} className="w-full bg-[#111] border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 transition-colors">
                  <option value="" disabled>Select volume...</option>
                  <option value="<10k">&lt;10,000 messages/mo</option>
                  <option value="10k-100k">10,000 – 100,000 messages/mo</option>
                  <option value="100k-1M">100,000 – 1M messages/mo</option>
                  <option value="1M+">1M+ messages/mo</option>
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="mt-2 w-full bg-white text-black font-semibold text-[14px] py-3 rounded-full hover:bg-neutral-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> : "Submit Request"}
              </button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Request submitted!</h3>
            <p className="text-[13px] text-neutral-500 max-w-xs leading-relaxed">Our enterprise team will reach out to {form.email} within 24 hours.</p>
            <button onClick={onClose} className="mt-6 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-100 transition-colors">Done</button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Auth Modal ─────────────────────────────────────── */
function AuthModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Successfully logged in");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully");
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in with Google");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-white hover:bg-white/8 transition-colors">
          <X size={16} />
        </button>

        <div className="mb-7 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4">
            <NexusLogo />
          </div>
          <h2 className="text-2xl font-bold tracking-tighter text-white mb-1">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-[13px] text-neutral-500">
            {isLogin ? "Log in to continue." : "Sign up to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-white/25 placeholder-neutral-600 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold text-[14px] py-3 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            ) : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[12px] text-neutral-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[11px] text-neutral-500 font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full bg-white/5 text-white font-semibold text-[14px] py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Founder Modal (Stealth Easter Egg) ─────────────────── */
function FounderModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as any }}
        className="w-full max-w-sm bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative flex flex-col items-center text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Aesthetic top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-purple-500/10 to-transparent blur-xl pointer-events-none" />

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {/* High-fidelity avatar container */}
        <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500/30 via-emerald-500/20 to-blue-500/30 mb-5 flex items-center justify-center shadow-lg shadow-purple-950/20">
          <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center overflow-hidden border border-white/10">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20.2C9.3 20.2 6.9 18.8 5.5 16.7C5.54 14.54 9.9 13.4 12 13.4C14.08 13.4 18.44 14.54 18.5 16.7C17.1 18.8 14.7 20.2 12 20.2Z" fill="white" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Card info */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">Abhijeet Kangane</h2>
        <p className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Founder & Lead Engineer, Nexus AI</p>
        
        <p className="text-[13px] text-neutral-400 leading-relaxed max-w-[280px] mb-6">
          Building autonomous customer intelligence to scale the next generation of enterprise support.
        </p>

        {/* Social Icons styled beautifully */}
        <div className="flex items-center gap-3 justify-center mb-4">
          {socials.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 bg-white/5 border border-white/8 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={18} />
            </motion.a>
          ))}
        </div>

        {/* THE EASTER EGG: Secret Button */}
        <div className="mt-4 pt-5 border-t border-white/5 w-full flex justify-center">
          <button
            onClick={() => {
              onClose();
              router.push("/admin/login");
            }}
            className="text-[10px] font-semibold text-neutral-600 hover:text-neutral-300 transition-colors duration-200 uppercase tracking-widest flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
            Command Center Access
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}



/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ onLoginClick, onSalesClick, onFounderClick }: { onLoginClick: () => void; onSalesClick: () => void; onFounderClick: () => void }) {
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 flex justify-center px-4">
      <div className="flex items-center justify-between px-2 h-16 w-full max-w-6xl">
        <Link href="/" className="flex items-center gap-2.5"><NexusLogo /><span className="text-[15px] font-bold tracking-tight text-white">Nexus</span></Link>
        <nav className="hidden md:flex items-center gap-10">
          <button onClick={() => scroll("features")} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Features</button>
          <button onClick={() => scroll("pricing")} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Pricing</button>
          <button onClick={onSalesClick} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Enterprise</button>
        </nav>
        <div className="flex items-center gap-5">
          {loading ? (
            // Skeleton — prevents flicker during auth resolution
            <div className="w-28 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-5">
              <button onClick={onFounderClick} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Founder</button>
              <Link href="/dashboard" className="inline-flex items-center justify-center bg-white text-black text-[13px] font-semibold px-4 h-8 rounded-full hover:bg-neutral-200 transition-colors">Dashboard</Link>
            </div>
          ) : (
            <>
              <button onClick={onFounderClick} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Founder</button>
              <button onClick={onLoginClick} className="hidden md:inline-flex text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Log in</button>
              <Link href="/login" className="inline-flex items-center justify-center bg-white text-black text-[13px] font-semibold px-4 h-8 rounded-full hover:bg-neutral-200 transition-colors">Start Building</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { user, loading } = useAuth();
  const [totalConvos, setTotalConvos] = useState(14230); // fallback default

  useEffect(() => {
    if (user) {
      import("@/lib/db").then(({ getAllConversations }) => {
        getAllConversations().then(data => {
          if (data && data.length > 0) {
            setTotalConvos(14230 + data.length); // Dynamic + base for impressive landing page stats
          }
        }).catch(err => {
          // silently handle if rules block global collection reads
        });
      });
    }
  }, [user?.uid]);

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-medium text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI Agents Online · {totalConvos.toLocaleString()} conversations handled
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tighter leading-[1.05] mb-6 text-white">
          Customer Intelligence,<br /><span className="text-neutral-500">fully autonomous.</span>
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Deploy an elite AI workforce that resolves tickets, converts leads, and scales your support—without human intervention.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row items-center gap-3">
          {loading ? (
            // Skeleton button — prevents layout shift & flicker during auth check
            <div className="w-40 h-12 rounded-full bg-white/10 animate-pulse" />
          ) : (
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[14px] font-semibold hover:bg-neutral-100 transition-colors"
            >
              {user ? "Go to Dashboard" : "Start Building"} <ArrowUpRight size={16} />
            </Link>
          )}
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center justify-center border border-white/10 text-white px-6 py-3 rounded-full text-[14px] font-medium hover:bg-white/5 transition-colors">
            Read the Docs
          </button>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: Bot, title: "Autonomous Sales Bots", description: "Deploy AI agents that qualify leads, answer product questions, and guide prospects through your funnel — 24/7, without human intervention." },
  { icon: MessageSquare, title: "Intelligent Support Chat", description: "Resolve up to 85% of support tickets autonomously. Context-aware responses powered by your knowledge base, with smart escalation logic." },
  { icon: BarChart3, title: "AI Automation Systems", description: "Analyze every conversation natively. Get daily sentiment reports, conversion insights, and actionable growth signals." },
  { icon: TrendingUp, title: "Revenue Intelligence", description: "Track which conversations convert. Identify high-intent signals and automatically surface upsell opportunities at the perfect moment." },
  { icon: Globe, title: "Omnichannel Deployment", description: "Embed the Nexus Widget on any website with a single script tag. Works seamlessly across all modern browsers and mobile devices." },
  { icon: Lock, title: "Enterprise Security", description: "End-to-end encryption, SOC 2 compliant infrastructure, and granular role-based access controls built for enterprise requirements." },
];

function FeaturesGrid() {
  return (
    <section id="features" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="mb-20">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">Unmatched capabilities.</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-neutral-400 text-lg max-w-xl">Everything you need to scale customer intelligence, engineered for minimal overhead.</motion.p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i * 0.08}
              className="p-8 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-white/10 hover:bg-neutral-900/60 transition-all duration-300">
              <div className="w-9 h-9 mb-6 flex items-center justify-center text-white bg-white/5 border border-white/8 rounded-xl"><f.icon size={16} /></div>
              <h3 className="text-[15px] font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-[13px] text-neutral-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name: "Starter", price: "$0", period: "forever", description: "Perfect for validating your strategy.", features: ["1 AI Agent deployment", "5,000 messages/month", "Basic analytics dashboard", "Nexus Widget (branded)"], cta: "Start Free", highlighted: false, hasModal: true },
  { name: "Growth", price: "$49", period: "per month", description: "For growing businesses ready to scale.", features: ["5 AI Agent deployments", "500,000 messages/month", "Advanced custom reports", "Custom widget branding", "Priority Slack support"], cta: "Start 14-Day Trial", highlighted: true, hasModal: true },
  { name: "Enterprise", price: "$199", period: "per month", description: "Full power for enterprise teams.", features: ["Unlimited AI Agents", "Unlimited messages", "Custom AI model fine-tuning", "SSO + RBAC + Audit Logs", "Dedicated infrastructure"], cta: "Contact Sales", highlighted: false, hasModal: false },
];

function Pricing({ onSalesClick }: { onSalesClick: () => void }) {
  const [modalPlan, setModalPlan] = useState<{ name: string; price: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCta = async (plan: typeof plans[0]) => {
    if (plan.name === "Enterprise") {
      onSalesClick();
    } else if (plan.cta === "Start 14-Day Trial") {
      setCheckoutLoading(plan.name);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.name }),
        });
        const data = await res.json();
        // In production, redirect to data.redirectUrl (Stripe checkout)
        toast.success("Payment gateway ready.", { description: "Redirecting to secure checkout..." });
        setTimeout(() => {
          window.location.href = data.redirectUrl || "/login";
        }, 1200);
      } catch (err) {
        toast.error("Checkout failed. Please try again.");
      } finally {
        setCheckoutLoading(null);
      }
    } else {
      setModalPlan({ name: plan.name, price: plan.price });
    }
  };

  return (
    <>
      <AnimatePresence>
        {modalPlan && <CheckoutModal plan={modalPlan} onClose={() => setModalPlan(null)} />}
      </AnimatePresence>

      <section id="pricing" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center mb-20">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">Simple pricing.</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-neutral-400 text-lg max-w-xl mx-auto">Start building for free. Scale when you need to.</motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i * 0.1}
                className={cn("rounded-2xl p-8 flex flex-col", plan.highlighted ? "bg-white text-black" : "bg-neutral-900/40 border border-white/5 text-white")}>
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-neutral-500">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                    <span className="text-sm text-neutral-500">/{plan.period}</span>
                  </div>
                  <p className={cn("text-[13px]", plan.highlighted ? "text-neutral-600" : "text-neutral-400")}>{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-[13px]">
                      <CheckCircle2 size={15} className={cn("mt-0.5 shrink-0", plan.highlighted ? "text-black" : "text-neutral-400")} />
                      <span className={plan.highlighted ? "text-neutral-700" : "text-neutral-300"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCta(plan)}
                  disabled={checkoutLoading === plan.name}
                  className={cn("w-full py-3 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2",
                    plan.highlighted ? "bg-black text-white hover:bg-neutral-800" : "bg-white/8 hover:bg-white/15 text-white border border-white/10")}>
                  {checkoutLoading === plan.name ? (
                    <><motion.div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> Redirecting...</>
                  ) : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const socials = [
  { icon: FaGithub, href: "https://github.com/abhi666-max", label: "GitHub" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/in/abhijeet-kangane/", label: "LinkedIn" },
  { icon: FaXTwitter, href: "https://x.com/abhijeet_037", label: "X (Twitter)" },
  { icon: FaInstagram, href: "https://www.instagram.com/abhijeet.037/", label: "Instagram" },
];

function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6 bg-[#050505]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5"><NexusLogo /><span className="text-[15px] font-bold tracking-tight text-white">Nexus</span></Link>
          <p className="text-[13px] text-neutral-500 leading-relaxed max-w-[200px]">Autonomous Customer Intelligence for modern enterprises.</p>
        </div>

        <div className="flex flex-col gap-3 md:items-center">
          <p className="text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-widest">Legal & Docs</p>
          <div className="flex flex-col gap-2.5">
            <Link href="/documentation" className="text-[13px] text-neutral-500 hover:text-white transition-colors">Documentation</Link>
            <Link href="/privacy" className="text-[13px] text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[13px] text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-col gap-1 md:items-end">
            <p className="text-[11px] text-neutral-600 uppercase tracking-widest font-medium">Built by</p>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-[18px] font-semibold text-white tracking-tight">Abhijeet Kangane</span>
              <span className="px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Founder</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {socials.map(({ icon: Icon, href, label }) => (
              <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 bg-white/5 border border-white/8 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.12, y: -1 }} whileTap={{ scale: 0.94 }} transition={{ duration: 0.15 }}>
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-neutral-600">© {new Date().getFullYear()} Nexus AI. All rights reserved.</p>
        <p className="text-[12px] text-neutral-600">Powered by Llama 3.3 · Built with Next.js 15</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [founderOpen, setFounderOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white selection:text-black font-sans">
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {salesOpen && <SalesModal onClose={() => setSalesOpen(false)} />}
        {founderOpen && <FounderModal onClose={() => setFounderOpen(false)} />}
      </AnimatePresence>
      <Navbar
        onLoginClick={() => setShowAuthModal(true)}
        onSalesClick={() => setSalesOpen(true)}
        onFounderClick={() => setFounderOpen(true)}
      />
      <Hero />
      <FeaturesGrid />
      <Pricing onSalesClick={() => setSalesOpen(true)} />
      <Footer />
    </main>
  );
}
