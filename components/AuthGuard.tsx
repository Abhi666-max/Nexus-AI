"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        router.replace("/login");
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists() && userDoc.data().status === "suspended") {
          setIsSuspended(true);
        }
      } catch (err) {
        console.error("Failed to check user status", err);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Phase 1: Resolving auth token — block all UI, show premium loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-white border-transparent animate-spin" />
        </div>
        <p className="text-[12px] text-neutral-600 tracking-widest uppercase font-medium">
          Verifying Session
        </p>
      </div>
    );
  }

  // Phase 2: Auth resolved, no user — render nothing while redirect fires
  if (!user) return null;

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#060303] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2 border border-red-500/20">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Suspended</h1>
        <p className="text-[14px] text-neutral-400 max-w-sm">
          Your access to the Nexus platform has been temporarily suspended by an administrator. Please contact support to resolve this issue.
        </p>
        <button onClick={() => router.replace("/")} className="mt-4 text-[13px] font-semibold text-white bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full transition-colors">
          Return Home
        </button>
      </div>
    );
  }

  // Phase 3: Authenticated — render protected content
  return <>{children}</>;
}
