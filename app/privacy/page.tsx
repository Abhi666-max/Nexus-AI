import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-neutral-500 text-[13px]">Last updated: May 15, 2025 · Effective: May 15, 2025</p>
        </div>

        <div className="space-y-10 text-[15px] text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">1. Introduction</h2>
            <p>Nexus AI, Inc. ("Nexus", "we", "us", or "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, services, and any related applications (collectively, the "Service"). Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">2. Information We Collect</h2>
            <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul className="space-y-2 list-none pl-0">
              {["Personal Data: Name, email address, and billing information provided during account registration.", "Usage Data: Information about how you interact with our platform, including pages visited, features used, and time spent.", "AI Conversation Data: Messages sent to and received from your deployed AI agents for the purpose of model improvement and analytics.", "Device Data: IP address, browser type, operating system, and referring URLs collected automatically via standard web logs."].map(item => (
                <li key={item} className="flex gap-3 text-neutral-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">3. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and improve our services; to process transactions and send related information; to send technical notices and support messages; to respond to comments and questions; and to monitor and analyze usage trends. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">4. Data Retention</h2>
            <p>We retain personal data for as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, or reporting requirements. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">5. Security</h2>
            <p>We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II compliant infrastructure, and regular third-party penetration testing to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 tracking-tight">6. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact our Data Protection Officer at <span className="text-white">privacy@nexus-ai.com</span> or write to us at Nexus AI, Inc., 500 Sansome Street, San Francisco, CA 94111.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
