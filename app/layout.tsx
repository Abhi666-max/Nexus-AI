import type { Metadata } from "next";
import "./globals.css";
import NexusWidget from "@/components/NexusWidget";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "Nexus AI — Autonomous Customer Intelligence Platform",
  description:
    "Enterprise-grade AI platform that automates sales conversions, scales customer support, and deploys intelligent chat agents.",
  keywords: ["AI chatbot", "sales automation", "customer support AI", "Nexus AI"],
  authors: [{ name: "Abhijeet Kangane" }],
  openGraph: {
    title: "Nexus AI — Autonomous Customer Intelligence Platform",
    description: "Automate Sales. Scale Support. Zero Human Effort.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0A0A0A] text-[#FAFAFA] antialiased">
        <AuthProvider>
          {children}
          <NexusWidget />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#FAFAFA",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                borderRadius: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
