"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function CheckoutSimulationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = () => {
    setLoading(true);
    // Simulate network delay for payment processing
    setTimeout(() => {
      toast.success("Payment Successful - Pro features unlocked", { description: "Your workspace is ready." });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
        
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-white">
          <ShieldCheck size={28} />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">Secure Checkout</h1>
        <p className="text-[13px] text-neutral-400 mb-8 leading-relaxed">
          You are in test mode. No real charges will be made. Click the button below to simulate a successful Stripe payment and activate your workspace.
        </p>

        <div className="space-y-3 mb-8 text-left bg-black/40 rounded-xl p-5 border border-white/5">
          <div className="flex justify-between text-[13px]">
            <span className="text-neutral-500">Plan</span>
            <span className="font-medium text-white">Growth (14-Day Trial)</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-neutral-500">Amount Due Today</span>
            <span className="font-medium text-white">$0.00</span>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex justify-between text-[14px]">
            <span className="text-neutral-400">Total after trial</span>
            <span className="font-bold text-white">$49.00/mo</span>
          </div>
        </div>

        <button 
          onClick={handleSimulatePayment} 
          disabled={loading}
          className="w-full bg-white text-black font-semibold text-[14px] py-3.5 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : (
            <><CheckCircle2 size={16} /> Simulate Payment Success</>
          )}
        </button>
        
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/" className="text-[12px] text-neutral-500 hover:text-white transition-colors">Cancel</Link>
          <span className="w-1 h-1 rounded-full bg-neutral-800" />
          <span className="text-[11px] text-neutral-600 flex items-center gap-1"><ShieldCheck size={12}/> Secured by Stripe</span>
        </div>
      </motion.div>
    </div>
  );
}
