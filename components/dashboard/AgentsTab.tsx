"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { saveAgentSettings, getUserSettings } from "@/lib/db";

const DEFAULT_PROMPT = "You are Nexus, an elite AI sales and support agent. Your goal is to be concise, highly professional, and helpful. Keep responses short and subtly drive user engagement.";

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-6 py-5 border-b border-white/5 last:border-0">
      <div>
        <p className="text-[14px] font-medium text-white mb-1">{label}</p>
        <p className="text-[12px] text-neutral-500 leading-relaxed">{description}</p>
      </div>
      <button onClick={() => setOn(v => !v)}
        className={`w-11 h-6 rounded-full shrink-0 transition-colors duration-200 relative ${on ? "bg-white" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function AgentsTab() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [botName, setBotName] = useState("Nexus Agent");
  const [themeColor, setThemeColor] = useState("#8b5cf6");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load existing settings from Firestore on mount
  useEffect(() => {
    if (user) {
      getUserSettings(user.uid).then(data => {
        if (data?.systemPrompt) setPrompt(data.systemPrompt);
        if (data?.botName) setBotName(data.botName);
        if (data?.themeColor) setThemeColor(data.themeColor);
        if (data?.knowledgeBase) setKnowledgeBase(data.knowledgeBase);
      }).finally(() => setLoadingData(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveAgentSettings(user.uid, {
        systemPrompt: prompt,
        botName,
        themeColor,
        knowledgeBase
      });
      setSaved(true);
      toast.success("Agent configuration updated", {
        description: "Your system prompt is now live and will be injected into all new AI conversations.",
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error("Failed to save configuration", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white mb-1">AI Agent Configuration</h2>
        <p className="text-[12px] text-neutral-500">Customize how your autonomous agents behave across all conversations.</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <h3 className="text-[14px] font-semibold text-white mb-4">Behaviour Settings</h3>
        <Toggle label="Auto-Escalate to Human" description="Automatically route conversations to a human agent when AI confidence drops below 70%." defaultOn />
        <Toggle label="Sentiment Analysis" description="Detect negative sentiment in real time and prioritize those tickets in the Live Feed." defaultOn />
        <Toggle label="Lead Scoring" description="Automatically score incoming leads based on intent signals and conversation depth." />
        <Toggle label="Multi-language Support" description="Detect and respond in the customer's native language using automatic translation." />
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <h3 className="text-[14px] font-semibold text-white mb-4">Widget Branding</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Bot Name</label>
            <input
              type="text"
              value={botName}
              onChange={e => setBotName(e.target.value)}
              placeholder="e.g. Acme Support Bot"
              className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Theme Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={e => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-[13px] font-mono text-neutral-300 uppercase">{themeColor}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-white mb-1">Knowledge Base (V1 RAG)</h3>
            <p className="text-[12px] text-neutral-500">Paste your business FAQs, product details, or specific instructions. The AI will use this context to answer customer queries accurately.</p>
          </div>
        </div>
        {loadingData ? (
          <div className="w-full h-[140px] bg-white/5 border border-white/8 rounded-xl flex items-center justify-center mb-6">
            <Loader2 size={18} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <textarea
            value={knowledgeBase}
            onChange={e => setKnowledgeBase(e.target.value)}
            placeholder="E.g. Our return policy is 30 days. We offer free shipping on orders over $50. Support hours are 9AM-5PM EST."
            rows={5}
            className="w-full mb-6 bg-white/5 border border-white/8 text-[13px] text-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-white/20 resize-y placeholder-neutral-600 leading-relaxed transition-colors"
          />
        )}

        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-white mb-1">System Prompt</h3>
            <p className="text-[12px] text-neutral-500">The core instructions that define your agent's personality and goals. Saved to your account and injected into every AI conversation.</p>
          </div>
        </div>
        {loadingData ? (
          <div className="w-full h-[140px] bg-white/5 border border-white/8 rounded-xl flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={6}
            className="w-full bg-white/5 border border-white/8 text-[13px] text-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-white/20 resize-none placeholder-neutral-600 leading-relaxed transition-colors font-mono"
          />
        )}
        <button
          onClick={handleSave}
          disabled={saving || loadingData}
          className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-100 transition-all disabled:opacity-60"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
           : saved ? <><CheckCircle2 size={15} className="text-emerald-600" /> Saved!</>
           : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
