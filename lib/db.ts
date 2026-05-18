import { db } from "./firebase";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, setDoc, getDoc, arrayUnion
} from "firebase/firestore";

export interface Customer {
  id?: string;
  userId: string;
  name: string;
  email: string;
  status: "active" | "churned" | "trial";
  ltv: string;
  joined: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
  isHuman?: boolean;
}

export interface Conversation {
  id?: string;
  userId: string;
  customerId: string;  // links to specific customer
  user: string;
  status: "active" | "resolved" | "escalated" | "pending";
  preview: string;
  messages: ConversationMessage[];
  createdAt?: any;
  updatedAt?: any;
}

// --- Customers ---

export const getCustomers = async (userId: string): Promise<Customer[]> => {
  const q = query(collection(db, "customers"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  return customers.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

export const addCustomer = async (userId: string, data: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(collection(db, "customers"), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[db.ts] Failed to add customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string) => {
  await deleteDoc(doc(db, "customers", id));
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, "id" | "userId">>) => {
  await updateDoc(doc(db, "customers", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// --- Conversations (with Upsert Threading) ---

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const q = query(collection(db, "conversations"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  return convos.sort((a, b) => {
    const timeA = a.updatedAt?.toMillis?.() || 0;
    const timeB = b.updatedAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

/**
 * UPSERT: Find existing conversation for a customerId, append messages to it.
 * If none exists, create a new thread. This prevents duplicate conversation docs.
 */
export const upsertConversation = async (
  userId: string,
  customerId: string,
  customerName: string,
  newMessages: ConversationMessage[]
) => {
  // Query for an existing active thread for this specific customer
  const q = query(
    collection(db, "conversations"),
    where("userId", "==", userId),
    where("customerId", "==", customerId)
  );
  const snapshot = await getDocs(q);
  const lastMsg = newMessages[newMessages.length - 1];

  if (!snapshot.empty) {
    // Thread exists — append new messages to it using arrayUnion
    const existingDoc = snapshot.docs[0];
    await updateDoc(doc(db, "conversations", existingDoc.id), {
      messages: arrayUnion(...newMessages),
      preview: lastMsg?.content || "",
      status: "active",
      updatedAt: serverTimestamp(),
    });
    return existingDoc.id;
  } else {
    // No existing thread — create a new document
    const docRef = await addDoc(collection(db, "conversations"), {
      userId,
      customerId,
      user: customerName,
      status: "active",
      preview: lastMsg?.content || "",
      messages: newMessages,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }
};

export const updateConversation = async (id: string, data: Partial<Omit<Conversation, "id" | "userId">>) => {
  await updateDoc(doc(db, "conversations", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteConversation = async (id: string) => {
  await deleteDoc(doc(db, "conversations", id));
};

// --- Users (Settings) ---

export const updateUserProfile = async (userId: string, data: { name: string; company: string }) => {
  await setDoc(doc(db, "users", userId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const updateUserApiKey = async (userId: string, apiKey: string) => {
  await setDoc(doc(db, "users", userId), {
    apiKey,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserSettings = async (userId: string) => {
  const d = await getDoc(doc(db, "users", userId));
  return d.exists() ? d.data() : null;
};

// --- God Mode (Admin) ---

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllConversations = async () => {
  const snapshot = await getDocs(collection(db, "conversations"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Conversation }));
};

// --- Sales Leads (Monetization) ---

export const addSalesLead = async (data: {
  name: string;
  email: string;
  company: string;
  volume: string;
}) => {
  const docRef = await addDoc(collection(db, "sales_leads"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// --- System Prompt ---

export const saveSystemPrompt = async (userId: string, systemPrompt: string) => {
  await setDoc(doc(db, "users", userId), {
    systemPrompt,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getSystemPrompt = async (userId: string): Promise<string | null> => {
  const d = await getDoc(doc(db, "users", userId));
  return d.exists() ? (d.data().systemPrompt || null) : null;
};
