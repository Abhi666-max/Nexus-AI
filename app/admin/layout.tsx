"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

const ADMIN_EMAIL = "abhi.admin.dev@gmail.com";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;

    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.email !== ADMIN_EMAIL) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router, pathname]);

  // Whitelist /admin/login from any loading checks or redirect states
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-transparent animate-spin" />
        </div>
        <p className="text-[12px] text-purple-700 tracking-widest uppercase font-medium">Verifying Clearance</p>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return <div className="min-h-screen bg-[#050505] text-white">{children}</div>;
}
