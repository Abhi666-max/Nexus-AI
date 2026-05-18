"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, CreditCard, Key, Upload, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getUserSettings, updateUserProfile, updateUserApiKey } from "@/lib/db";

const tabs = ["Profile", "Billing", "API Keys"] as const;
type Tab = typeof tabs[number];

function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      getUserSettings(user.uid).then(data => {
        if (data) {
          setName(data.name || "");
          setCompany(data.company || "");
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name, company });
      toast.success("Profile updated", { description: "Your changes have been securely saved to Firestore." });
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.message });
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  if (loading) {
    return <div className="max-w-lg p-6 flex items-center justify-center text-neutral-500"><Loader2 className="animate-spin" size={20} /></div>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xl font-bold text-white uppercase">
            {name ? name.substring(0, 2) : email.substring(0, 2)}
          </div>
          <div>
            <p className="text-[14px] font-medium text-white mb-1">{name || "Update your name"}</p>
            <p className="text-[12px] text-neutral-500">{email}</p>
            {isEditing && (
              <button className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-white transition-colors"><Upload size={12}/> Upload Photo</button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emma Watson" className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20 transition-colors"/>
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Email</label>
                <input value={email} disabled className="w-full bg-white/5 border border-white/8 text-[13px] text-neutral-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed opacity-70"/>
                <p className="text-[10px] text-neutral-500 mt-1.5">Email cannot be changed directly.</p>
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-400 mb-1.5 block">Company Name</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Nexus AI Inc." className="w-full bg-white/5 border border-white/8 text-[13px] text-white rounded-xl px-4 py-3 outline-none focus:border-white/20 transition-colors"/>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : "Save Changes"}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={saving} className="text-neutral-400 hover:text-white text-[13px] font-medium px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <p className="text-[12px] font-medium text-neutral-500 mb-1">Full Name</p>
                <p className="text-[14px] text-white">{name || "Not set"}</p>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div>
                <p className="text-[12px] font-medium text-neutral-500 mb-1">Email Address</p>
                <p className="text-[14px] text-white">{email}</p>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div>
                <p className="text-[12px] font-medium text-neutral-500 mb-1">Company Name</p>
                <p className="text-[14px] text-white">{company || "Not set"}</p>
              </div>
            </div>
            
            <button onClick={() => setIsEditing(true)} className="mt-8 bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-full text-[13px] font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Billing() {
  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Current Plan</p>
            <p className="text-2xl font-bold tracking-tighter text-white">Enterprise</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-full uppercase tracking-wider">Active</span>
        </div>
        <p className="text-[13px] text-neutral-500 mb-5">$999/month · Custom limits</p>
        <button onClick={()=>toast("Billing portal is restricted in this environment.",{icon:"🔒"})} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors border border-white/8 px-4 py-2 rounded-xl">Manage Billing</button>
      </div>
    </div>
  );
}

function ApiKeys() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (user) {
      getUserSettings(user.uid).then(data => {
        if (data?.apiKey) {
          setKey(data.apiKey);
        } else {
          // generate initial
          const newKey = "nxs_live_" + crypto.randomUUID().replace(/-/g, "");
          updateUserApiKey(user.uid, newKey);
          setKey(newKey);
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleCopy = () => { navigator.clipboard.writeText(key); toast.success("API key copied to clipboard."); };
  
  const handleRegenerate = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const newKey = "nxs_live_" + crypto.randomUUID().replace(/-/g, "");
      await updateUserApiKey(user.uid, newKey);
      setKey(newKey);
      toast.success("API key regenerated", { description: "Your old key has been permanently revoked." });
    } catch (err: any) {
      toast.error("Failed to regenerate key", { description: err.message });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="animate-spin text-neutral-500" size={20} /></div>;

  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[14px] font-semibold text-white">Secret API Key</h3>
          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/20">Live</span>
        </div>
        <p className="text-[12px] text-neutral-500 mb-4">Never expose this key in client-side code. Treat it like a password.</p>
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="flex-1 font-mono text-[13px] text-neutral-300 truncate">{show ? key : "nxs_live_" + "•".repeat(24)}</p>
          <button onClick={()=>setShow(v=>!v)} className="text-neutral-500 hover:text-white transition-colors">{show?<EyeOff size={15}/>:<Eye size={15}/>}</button>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleCopy} className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors border border-white/8 px-4 py-2 rounded-xl">Copy Key</button>
          <button onClick={handleRegenerate} disabled={regenerating} className="text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors border border-red-500/20 px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-2">
            {regenerating ? <Loader2 size={14} className="animate-spin" /> : null} Revoke & Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsTab() {
  const [active, setActive] = useState<Tab>("Profile");
  const icons = { Profile: User, Billing: CreditCard, "API Keys": Key };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white mb-1">Settings</h2>
        <p className="text-[12px] text-neutral-500">Manage your account, billing, and API credentials.</p>
      </div>
      <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = icons[t];
          return (
            <button key={t} onClick={()=>setActive(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${active===t?"bg-white text-black":"text-neutral-400 hover:text-white"}`}>
              <Icon size={14}/>{t}
            </button>
          );
        })}
      </div>
      {active==="Profile"&&<Profile/>}
      {active==="Billing"&&<Billing/>}
      {active==="API Keys"&&<ApiKeys/>}
    </div>
  );
}
