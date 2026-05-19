"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { ShieldAlert, Eye, EyeOff, Loader2, Lock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "abhi.admin.dev@gmail.com";

export default function AdminLogin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Route Guard: bounce any already-logged-in admin to the dashboard, but clear ghost sessions for regular users
  useEffect(() => {
    const manageSession = async () => {
      if (!authLoading && user) {
        if (user.email === ADMIN_EMAIL) {
          router.replace("/admin/dashboard");
        } else {
          // Regular user stumbled onto admin login — explicitly clear their session
          // This prevents them from being stuck in a ghost state.
          await signOut(auth);
        }
      }
    };
    manageSession();
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const loggedInUser = credential.user;

      // CRITICAL POST-LOGIN GATE: Hard email validation
      if (loggedInUser.email !== ADMIN_EMAIL) {
        // Unauthorized — immediately destroy the session
        await signOut(auth);
        setAttempts(prev => prev + 1);
        setError("UNAUTHORIZED: This email is not permitted to access the Admin Console.");
        toast.error("⚠ UNAUTHORIZED ACCESS DETECTED", {
          description: "This incident has been logged. Your credentials have been rejected.",
          duration: 8000,
          style: {
            background: "#1a0505",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#fca5a5",
          },
        });
        setPassword("");
        return;
      }

      // Access granted
      toast.success("Identity Verified", {
        description: "Welcome, Founder. Initializing Command Center...",
        style: {
          background: "#051a0a",
          border: "1px solid rgba(34,197,94,0.3)",
          color: "#86efac",
        },
      });
      router.push("/admin/dashboard");

    } catch (err: any) {
      setAttempts(prev => prev + 1);
      const msg =
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found"
          ? "Invalid credentials. Access denied."
          : err.code === "auth/too-many-requests"
          ? "Too many failed attempts. Account temporarily locked."
          : "Authentication failure. Try again.";
      setError(msg);
      toast.error("Authentication Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  // Only show loading spinner for the very first auth resolution
  // Do NOT return null for authenticated users — the useEffect redirect handles routing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060303] flex items-center justify-center">
        <ShieldAlert className="text-red-500 animate-pulse" size={32} />
      </div>
    );
  }

  // Authenticated users are handled by the useEffect redirect above
  // Render null briefly while redirect fires (avoids flash of form)
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#060303] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(239,68,68,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 shadow-lg shadow-red-900/20">
            <ShieldAlert className="text-red-400" size={28} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-800/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/70">Restricted Area</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-800/60" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Nexus Command Center</h1>
          <p className="text-[13px] text-red-400/60 text-center max-w-xs">
            Authorized personnel only. Unauthorized access attempts are monitored and logged.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0d0505]/90 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Attempt warning */}
          <AnimatePresence>
            {attempts >= 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2"
              >
                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-300/80">
                  Multiple failed attempts detected. Continued failures may result in IP-level lockout.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-red-300/60 uppercase tracking-widest mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  autoComplete="email"
                  className="w-full bg-black/40 border border-red-900/30 focus:border-red-700/60 text-[14px] text-white rounded-xl px-4 py-3.5 outline-none transition-all placeholder-red-900/40 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-red-300/60 uppercase tracking-widest mb-2">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-black/40 border border-red-900/30 focus:border-red-700/60 text-[14px] text-white rounded-xl px-4 py-3.5 pr-12 outline-none transition-all placeholder-red-900/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-700/50 hover:text-red-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
                >
                  <Lock size={13} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-300/80">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-semibold text-[14px] py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12" />
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
              ) : (
                <><ShieldAlert size={16} /> Access Command Center</>
              )}
            </button>
          </form>

          {/* Footer disclaimer */}
          <div className="mt-6 pt-5 border-t border-red-900/20">
            <p className="text-[10px] text-red-900/60 text-center leading-relaxed">
              All access attempts are recorded and monitored. Unauthorized use is a violation of federal law.
              <br />This system is the exclusive property of Nexus AI.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/" className="text-[12px] text-red-900/50 hover:text-red-700/80 transition-colors">
            ← Return to Public Site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
