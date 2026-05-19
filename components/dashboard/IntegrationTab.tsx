"use client";
import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

export default function IntegrationTab() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const integrationCode = `<script src="https://nexusai.com/widget.js" data-tenant-id="${user?.uid || 'YOUR_TENANT_ID'}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopied(true);
    toast.success("Code copied to clipboard!", {
      description: "Paste this right before the closing </body> tag of your website.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white mb-1">Widget Integration</h2>
        <p className="text-[12px] text-neutral-500">Embed the Nexus AI agent into your platform using this quick snippet.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <h3 className="text-[14px] font-semibold text-white mb-3">Installation Script</h3>
        <p className="text-[12px] text-neutral-400 mb-6 leading-relaxed">
          Copy the snippet below and paste it directly into your website's HTML, ideally just before the closing <code className="text-pink-400 bg-white/5 px-1 py-0.5 rounded">{"</body>"}</code> tag. This will load your custom-branded AI widget globally.
        </p>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-black border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 font-mono text-[12px] overflow-hidden">
            <code className="text-neutral-300 break-all whitespace-pre-wrap flex-1">
              {integrationCode}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 hover:border-white/20"
            >
              {copied ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <h3 className="text-[13px] font-semibold text-white mb-2">Need help with integration?</h3>
          <p className="text-[12px] text-neutral-500 mb-4">Read our comprehensive documentation for advanced configuration, custom events, and SDK usage.</p>
          <Link href="/documentation" className="inline-block text-[12px] font-semibold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10">
            View Developer Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
