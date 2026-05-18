import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 px-6 h-16 flex items-center justify-between max-w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[14px] font-bold tracking-tight">Nexus</span>
        </Link>
        <Link href="/" className="text-[13px] text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
          Back to Home <ChevronRight size={14} />
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-3">Documentation</p>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Developer Guide</h1>
          <p className="text-neutral-400 text-lg leading-relaxed">Everything you need to integrate Nexus AI into your product stack.</p>
        </div>

        <div className="space-y-12 text-[15px] text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">1. Quick Start</h2>
            <p className="mb-4">Nexus AI provides a fully managed API and embeddable widget to deploy autonomous AI agents on your platform within minutes. Follow the steps below to get your first AI agent live.</p>
            <div className="bg-neutral-900/60 border border-white/8 rounded-xl p-5 font-mono text-[13px] text-neutral-300">
              <p className="text-neutral-500 mb-2"># Install the Nexus SDK</p>
              <p>npm install @nexus-ai/sdk</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">2. Authentication</h2>
            <p className="mb-4">All API requests must be authenticated using your secret API key. Your key can be found in the Dashboard under Settings → API Keys. Never expose your secret key in client-side code.</p>
            <div className="bg-neutral-900/60 border border-white/8 rounded-xl p-5 font-mono text-[13px] text-neutral-300">
              <p className="text-neutral-500 mb-1"># Initialize with your secret key</p>
              <p>{`import { NexusClient } from '@nexus-ai/sdk';`}</p>
              <p>{`const client = new NexusClient({ apiKey: process.env.NEXUS_SECRET_KEY });`}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">3. Embedding the Widget</h2>
            <p className="mb-4">The Nexus Widget is a fully customizable, embeddable chat interface. Add the following script tag to your HTML to deploy your AI agent instantly.</p>
            <div className="bg-neutral-900/60 border border-white/8 rounded-xl p-5 font-mono text-[13px] text-neutral-300">
              {`<script src="https://cdn.nexus-ai.com/widget.js" data-agent-id="YOUR_AGENT_ID" async></script>`}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">4. API Reference</h2>
            <p className="mb-6">The Nexus API is RESTful and all responses are JSON-encoded. The base URL for all API requests is <code className="bg-white/8 px-1.5 py-0.5 rounded text-white text-[13px]">https://api.nexus-ai.com/v1</code>.</p>
            <div className="divide-y divide-white/5 border border-white/8 rounded-xl overflow-hidden">
              {[
                { method: "POST", path: "/chat/completions", desc: "Send a message and receive an AI response" },
                { method: "GET", path: "/agents", desc: "List all deployed agents in your workspace" },
                { method: "POST", path: "/agents", desc: "Create and deploy a new AI agent" },
                { method: "GET", path: "/analytics/summary", desc: "Fetch aggregated performance metrics" },
              ].map(({ method, path, desc }) => (
                <div key={`${method}-${path}`} className="flex items-center gap-4 px-5 py-4 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${method === "POST" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>{method}</span>
                  <code className="text-[13px] text-white font-mono flex-1">{path}</code>
                  <span className="text-[12px] text-neutral-500">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">5. Rate Limits</h2>
            <p>Starter plans are rate-limited to 100 requests per minute. Growth plans receive 1,000 requests per minute. Enterprise plans have custom rate limits based on your agreement. All rate limit information is returned in the response headers as <code className="bg-white/8 px-1.5 py-0.5 rounded text-white text-[13px]">X-RateLimit-Remaining</code>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
