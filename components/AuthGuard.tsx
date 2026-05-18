"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (!firebaseUser) {
        router.replace("/login");
      }
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

  // Phase 3: Authenticated — render protected content
  return <>{children}</>;
}
