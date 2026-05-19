# Nexus AI — Autonomous Customer Intelligence Platform

> **Deploy an elite AI workforce that resolves support tickets, qualifies leads, and scales customer operations — without human intervention.**

Nexus AI is a production-ready, multi-tenant SaaS platform that transforms customer support into a fully autonomous operation. Intelligent agents handle conversations end-to-end, escalate to human operators when needed, and hand back to AI autonomously — all in real time.

---

## Key Features

### 🤖 Autonomous AI Agents
- **Groq-Powered Engine** — Ultra-low latency responses via `llama-3.3-70b-versatile`
- **Per-Tenant System Prompts** — Each workspace configures their agent's persona, tone, and domain knowledge
- **Chat Simulator** — Test any customer scenario against live AI before deploying, with conversation history pre-loaded

### 🔄 Human-in-the-Loop: Takeover Protocol
- **One-Click Escalation** — Operators pause the AI and take direct control of any conversation
- **Differentiated Message Rendering** — Human replies appear with a distinct blue bubble and `· You` label vs. AI messages
- **Resolve & Handback** — Returning a conversation to AI control restores full autonomous operation immediately on the next customer message; no page refresh required

### 📊 Real-Time Analytics
- **Live Firestore Listeners** — All metrics computed from `onSnapshot` — zero polling, zero stale data
- **Human Cost Saved** — Dynamically calculates the dollar value of AI-automated interactions vs. human agent cost
- **Weekly Activity Chart** — Recharts area graph built from real conversation timestamps
- **Live Conversation Feed** — Scrolling feed of the 5 most recent threads with status indicators

### 🛡️ Secure Founder Dashboard
- **Isolated Route** — `/admin/login` and `/admin/dashboard` are completely separate from the tenant auth flow
- **Hard Email Lock** — Only the configured admin email can access the panel; any other authenticated user is immediately signed out
- **Global Analytics** — Platform-wide metrics across all tenants: total workspaces, MRR, conversation volume
- **User Registry** — Full table of every registered user with per-user conversation counts and Revoke Access controls

### 👥 Multi-Tenant Customer Management
- **Customer Directory** — Full CRUD with Firestore persistence (Add, Edit, Delete)
- **Real-Time Inbox** — Conversation list updates instantly via `onSnapshot` listeners
- **Functional Search** — Client-side `.filter()` across name, email, and status
- **Thread Deletion** — Hard delete with confirmation, atomic Firestore removal

### 💳 Billing & Settings
- **API Key Management** — Generate, reveal, copy, and rotate `nxs_live_` API keys stored in Firestore
- **Billing Portal** — Subscription info, payment method display, and 3-month invoice history
- **Real Invoice Downloads** — Clicking download generates and saves a real `.txt` file via `Blob + URL.createObjectURL()` — no fake toasts

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack React, server/client components, API routes |
| **Language** | TypeScript (Strict) | End-to-end type safety |
| **Authentication** | Firebase Authentication | Email/password + Google OAuth for tenants |
| **Database** | Cloud Firestore | Real-time multi-tenant data store |
| **AI Engine** | Groq API (`llama-3.3-70b-versatile`) | Sub-second LLM inference for customer conversations |
| **Styling** | Tailwind CSS v3 | Utility-first design system |
| **Animations** | Framer Motion | Page transitions, modals, micro-interactions |
| **Charts** | Recharts | Weekly interaction area graph |
| **Notifications** | Sonner | Toast system for all async feedback |
| **Icons** | Lucide React | Consistent icon library |

---

## Project Architecture

```
nexus-ai/
├── app/
│   ├── page.tsx                    # Public landing page
│   ├── login/page.tsx              # Tenant login (Email + Google OAuth)
│   ├── dashboard/
│   │   ├── layout.tsx              # AuthGuard wrapper
│   │   └── page.tsx                # Main dashboard SPA (multi-view)
│   ├── admin/
│   │   ├── login/page.tsx          # Isolated admin auth portal
│   │   └── dashboard/page.tsx      # Founder-only global command center
│   └── api/
│       └── chat/route.ts           # Groq AI endpoint + escalation gatekeeper
│
├── components/
│   ├── AuthGuard.tsx               # Route protection for /dashboard
│   └── dashboard/
│       ├── ConversationsTab.tsx    # Real-time inbox, Takeover/Handback flow
│       ├── CustomersTab.tsx        # Customer CRUD + Chat Simulator
│       ├── AgentsTab.tsx           # AI agent configuration + system prompt editor
│       └── SettingsTab.tsx         # Profile, API keys, billing portal
│
├── lib/
│   ├── firebase.ts                 # Firebase app initialization
│   ├── AuthContext.tsx             # Global auth state via React Context
│   └── db.ts                       # Typed Firestore service layer
│
└── .env.local                      # Environment secrets (never committed)
```

---

## Local Setup

### Prerequisites

- Node.js `v18.0+`
- A **Firebase project** with Authentication and Firestore enabled
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root with the following values:

```env
# ── Firebase ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# ── Groq AI (server-only — never prefix with NEXT_PUBLIC_) ───────────────────
GROQ_API_KEY=
```

> **Security:** `.env.local` is included in `.gitignore`. Never commit API keys.

### 3. Configure Firestore Security Rules

In the Firebase Console → Firestore → Rules, apply these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> For production, tighten rules to enforce `userId == request.auth.uid` at the document level.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Authentication Flows

### Tenant Login (`/login`)
- Email/password or Google OAuth
- On success, routes to `/dashboard`
- The subtle **Founder Access** button at the bottom routes to the admin portal

### Admin Login (`/admin/login`)
- Email/password **only** — no OAuth, no sign-up
- Post-login: checks `user.email` against the configured admin address
- Non-matching email → immediate `signOut()` + unauthorized alert
- Matching email → routes to `/admin/dashboard`

---

## Key Design Decisions

**Escalation Gatekeeper:** The `/api/chat` route reads the Firestore conversation document on every request. If `status === "escalated"`, the Groq API call is skipped entirely and `{ escalated: true }` is returned. This makes the AI blockade purely server-side with zero reliance on client state.

**Upsert Threading:** The `upsertConversation()` function prevents duplicate Firestore documents per customer. One thread per customer is always found and appended to — never overwritten.

**Token Cost Metric:** Token count is estimated as `totalChars / 4` (industry standard: 1 token ≈ 4 characters). Human cost saved is calculated at `$0.125 per message` (30 seconds × $15/hr human agent rate), giving a concrete business-value metric for every conversation the AI handles.

**Real File Downloads:** Invoice files are generated client-side as `text/plain` Blobs, downloaded via a programmatic `<a>` element click, and the object URL is immediately revoked to prevent memory leaks.

---

## Roadmap

- [ ] Stripe webhook integration for live subscription management
- [ ] Firebase Cloud Functions for email alerts on escalation
- [ ] Server-side Firestore pagination for high-volume customer directories
- [ ] Production Firestore security rules with per-document `userId` enforcement
- [ ] Multi-agent configuration (assign different AI personas to different customer segments)
- [ ] Export conversations as CSV / PDF from the admin panel

---

## License

MIT © 2026 Nexus AI.
