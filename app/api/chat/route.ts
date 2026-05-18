import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const DEFAULT_SYSTEM_PROMPT = `You are Nexus, an elite AI customer intelligence agent deployed by an enterprise SaaS platform. You are concise, deeply professional, empathetic, and solution-focused. Keep responses under 3 sentences unless detail is explicitly needed. Always steer conversations toward resolution and product value.`;

// Initialize Firebase Admin-lite on the server using the client SDK (no Admin SDK needed)
function getServerFirestore() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  // Reuse existing app if already initialized (important in Next.js edge/serverless env)
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

async function fetchUserSystemPrompt(userId: string): Promise<string> {
  try {
    const db = getServerFirestore();
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists() && snap.data().systemPrompt) {
      return snap.data().systemPrompt as string;
    }
  } catch (err) {
    console.warn("[Chat API] Could not fetch user system prompt:", err);
  }
  return DEFAULT_SYSTEM_PROMPT;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userId } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error("[Chat API Error]: Missing messages array in request body");
      return NextResponse.json({ error: "Invalid request: messages array required." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      console.error("[Chat API Error]: GROQ_API_KEY is completely missing from environment variables.");
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // Fetch the user's custom system prompt from Firestore (or use default)
    const systemPrompt = userId ? await fetchUserSystemPrompt(userId) : DEFAULT_SYSTEM_PROMPT;
    
    // Check if the conversation is escalated
    if (userId && body.customerId) {
      const db = getServerFirestore();
      const q = query(collection(db, "conversations"), where("userId", "==", userId), where("customerId", "==", body.customerId));
      const snap = await getDocs(q);
      if (!snap.empty && snap.docs[0].data().status === "escalated") {
        console.log("[Chat API] Conversation is escalated. Skipping AI response.");
        return NextResponse.json({ message: "", escalated: true });
      }
    }

    console.log(`[Chat API] Using ${userId ? "custom" : "default"} system prompt. Sending ${messages.length} messages to Groq...`);

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m: any) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 512,
      temperature: 0.7,
      stream: false,
    });

    const aiMessage = completion.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("Received empty response from Groq");
    }

    console.log("[Chat API] Successfully received AI response.");
    return NextResponse.json({ message: aiMessage });

  } catch (error: any) {
    console.error("[Nexus Chat API Error]:", error);
    return NextResponse.json(
      { error: error.message || "The AI engine encountered an issue. Please try again shortly." },
      { status: 500 }
    );
  }
}
