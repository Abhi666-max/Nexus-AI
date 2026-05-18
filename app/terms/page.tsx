import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 px-6 h-16 flex items-center justify-between">
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-neutral-500 text-[13px]">Last updated: May 15, 2025 · Effective: May 15, 2025</p>
        </div>

        <div className="space-y-10 text-[15px] text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">1. Acceptance of Terms</h2>
            <p>By accessing or using the Nexus AI platform and services (collectively, "Service"), you agree to be bound by these Terms of Service ("Terms"). If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms. If you do not have such authority, or if you do not agree with these Terms, you must not accept this agreement and may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">2. Description of Service</h2>
            <p>Nexus AI provides an enterprise-grade AI customer intelligence platform that enables businesses to deploy autonomous AI agents for sales and customer support automation. The Service includes AI chat infrastructure, analytics dashboards, API access, and associated tools as described in the applicable plan documentation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">3. Subscriptions and Billing</h2>
            <p className="mb-3">The Service is billed on a subscription basis. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"), either monthly or annually, depending on the subscription plan you select at the time of purchase.</p>
            <p>At the end of each Billing Cycle, your subscription will automatically renew under the exact same conditions unless you cancel it or Nexus AI cancels it. You may cancel your subscription at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">4. Prohibited Uses</h2>
            <p className="mb-3">You may not use the Service for any of the following purposes:</p>
            <ul className="space-y-2">
              {["Generating, distributing, or publishing spam, unsolicited communications, or deceptive content.", "Violating any applicable local, state, national, or international law or regulation.", "Impersonating any person or entity, or falsely misrepresenting your affiliation with a person or entity.", "Engaging in any conduct that restricts or inhibits any other user from using or enjoying the Service."].map(item => (
                <li key={item} className="flex gap-3 text-neutral-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, Nexus AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of (or inability to access or use) the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">6. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in San Francisco County, California.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">7. Contact</h2>
            <p>For questions about these Terms, please contact our legal team at <span className="text-white">legal@nexus-ai.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
