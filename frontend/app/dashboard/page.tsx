"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PaperUpload from "@/components/upload/PaperUpload";
import api from "@/services/api";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("Researcher");
  const [stats, setStats] = useState({ papers: 0, chats: 0, reports: 0, workspaces: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [hasActivePaper, setHasActivePaper] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email") || "researcher@workspace";
      setUserEmail(email.split("@")[0]);

      const userId = localStorage.getItem("user_id");
      const wsId = localStorage.getItem("workspace_id");
      if (userId) {
        let url = `/dashboard/stats/${userId}`;
        if (wsId) url += `?workspace_id=${wsId}`;
        api.get(url)
          .then((res) => {
            setStats(res.data);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingStats(false));
      }

      const lastPaper = sessionStorage.getItem("researchmind:last-paper");
      if (lastPaper) {
        setHasActivePaper(true);
      }
    }
  }, []);

  // Render active paper workspaces if cached
  if (hasActivePaper) {
    return (
      <AppLayout activeSection="dashboard">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
            <div>
              <h2 className="text-xl font-extrabold text-white">Active Research Portfolio</h2>
              <p className="text-xs text-zinc-500">Analyze summaries, critiques, scores, and exports for this document.</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("researchmind:last-paper");
                setHasActivePaper(false);
              }}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-855 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              ✕ Clear Portfolio
            </button>
          </div>
          <PaperUpload />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeSection="dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Panel */}
        <div>
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">Command Console</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back, {userEmail}</h2>
          <p className="text-sm text-zinc-400">Access your permanent research library, execute multi-agent critique checklists, and visualize semantic concept maps.</p>
        </div>

        {/* Metric Cards Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition backdrop-blur-md">
            <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">Publications</span>
            <div className="text-3xl font-black mt-2 text-white">{loadingStats ? "..." : stats.papers}</div>
            <span className="text-[9px] text-emerald-500 font-bold mt-1 block">Active Workspace Papers</span>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition backdrop-blur-md">
            <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">Briefings & Reports</span>
            <div className="text-3xl font-black mt-2 text-white">{loadingStats ? "..." : stats.reports}</div>
            <span className="text-[9px] text-indigo-400 font-bold mt-1 block">Completed Portfolios</span>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition backdrop-blur-md">
            <span className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider block">SaaS Projects</span>
            <div className="text-3xl font-black mt-2 text-white">{loadingStats ? "..." : stats.workspaces}</div>
            <span className="text-[9px] text-purple-400 font-bold mt-1 block">Active Workspaces</span>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition backdrop-blur-md">
            <span className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider block">RAG Interrogations</span>
            <div className="text-3xl font-black mt-2 text-white">{loadingStats ? "..." : stats.chats}</div>
            <span className="text-[9px] text-pink-400 font-bold mt-1 block">Total Copilot Chats</span>
          </div>
        </div>

        {/* Quick Upload Container */}
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-2">Initialize Active Research Upload</h3>
          <p className="text-xs text-zinc-400 mb-6">Drop a publication PDF here to parse sections, extract tables/images, and start agentic quality assessments.</p>
          <PaperUpload onUploadSuccess={() => { setHasActivePaper(true); }} />
        </div>
      </div>
    </AppLayout>
  );
}
