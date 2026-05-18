"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = "abhi.admin.dev@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Successfully logged in");
        // Unified routing: admin goes to command center, others go to dashboard
        router.push(cred.user.email === ADMIN_EMAIL ? "/admin/dashboard" : "/dashboard");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully");
        router.push("/dashboard");
      }
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl relative"
      >
        <Link href="/" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-white hover:bg-white/8 transition-colors">
          <X size={16} />
        </Link>

        <div className="mb-7 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
    </div>
  );
}
