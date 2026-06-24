"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/layout/Sidebar";

export default function ChatPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const wsId = localStorage.getItem("workspace_id");
      if (!token) {
        router.push("/auth/login");
      } else if (!wsId) {
        router.push("/workspaces");
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
          Verifying Console Credentials...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Sidebar active="chat" />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen relative overflow-x-hidden space-y-6">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <header className="pb-6 border-b border-zinc-900/50">
          <h1 className="text-3xl font-extrabold tracking-tight">Research Chat</h1>
          <p className="text-xs text-zinc-500 mt-1">Ask questions about indexed research publications in your active workspace.</p>
        </header>

        <div className="max-w-6xl mx-auto">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

