"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import CopilotMessage from "./CopilotMessage";
import CopilotInput from "./CopilotInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your ResearchMind AI Copilot. Ask me questions about the uploaded paper, generate literature reviews, or check its limitations." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    const storedPaper = window.sessionStorage.getItem("researchmind:last-paper");
    let paperContext = {
      summary: "No summary available.",
      critique: "No critique available.",
      future_work: "No future work recommendations available."
    };
    if (storedPaper) {
      try {
        const parsed = JSON.parse(storedPaper);
        
        // Extract fields matching the expected schema for the context engine
        const summaryText = parsed.ai_summary?.tldr || parsed.summary?.tldr || parsed.abstract || "No summary available.";
        const critiqueText = parsed.research_critique?.strengths?.map((s: any) => s.point || s).join("\n") || "No critique available.";
        const futureText = parsed.future_work || "No future work suggested.";
        
        paperContext = {
          summary: summaryText,
          critique: critiqueText,
          future_work: futureText
        };
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const response = await api.post("/copilot", {
        message: text,
        paper_context: paperContext
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI Copilot engine." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Explain Paper", query: "Explain this paper" },
    { label: "What are weaknesses?", query: "What are weaknesses and critique of this paper?" },
    { label: "Suggest future work", query: "Suggest future work and improvements" },
    { label: "Suggest Datasets", query: "Suggest datasets and RAG features" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">

      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950 flex flex-wrap gap-2">

        {quickActions.map((action) => (

          <button
            key={action.label}
            onClick={() => handleSend(action.query)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full border border-zinc-800 text-xs text-zinc-300 font-semibold hover:bg-zinc-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {action.label}
          </button>

        ))}

      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, index) => (

          <CopilotMessage key={index} role={msg.role} content={msg.content} />

        ))}

        {loading && (

          <div className="flex justify-start mb-4">

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-4 text-xs font-semibold text-zinc-500 animate-pulse">
              ResearchMind is thinking...
            </div>

          </div>

        )}

        <div ref={messagesEndRef} />

      </div>

      <CopilotInput onSend={handleSend} disabled={loading} />

    </div>
  );
}
