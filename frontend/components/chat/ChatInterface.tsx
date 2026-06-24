"use client";

import { useState } from "react";
import api from "@/services/api";
import ChatMessage from "./ChatMessage";
import CitationPanel from "./CitationPanel";
import { Message, Citation } from "@/types/chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Try to get paper_id from sessionStorage
    let paperId: number | null = null;
    try {
      const cached = sessionStorage.getItem("researchmind:last-paper");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          paperId = parsed.id;
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const response = await api.post("/ask-paper", {
        question,
        paper_id: paperId,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCitations(response.data.citations || []);
      setQuestion("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Chat Window */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-[600px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-zinc-500">
            Ask questions about indexed research papers.
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {loading && (
          <div className="text-zinc-500">
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a research question..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 text-white outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askQuestion();
            }
          }}
        />
        <button
          onClick={askQuestion}
          className="bg-white text-black px-6 rounded-xl font-semibold hover:bg-zinc-200 transition cursor-pointer"
        >
          Ask
        </button>
      </div>

      {/* Citations */}
      <CitationPanel citations={citations} />
    </div>
  );
}
