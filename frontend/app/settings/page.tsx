"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function SettingsPage() {
  const [email, setEmail] = useState("researcher@workspace");
  const [theme, setTheme] = useState("dark");
  const [researchPref, setResearchPref] = useState("comprehensive");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("email") || "researcher@workspace");
    }
  }, []);

  return (
    <AppLayout activeSection="settings">
      <div className="space-y-8 animate-fade-in font-sans">
        {/* Page Header */}
        <div className="border-b border-zinc-900 pb-4">
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">
            System Preferences
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Console Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure your account settings, workspace preferences, and export options.
          </p>
        </div>

        {/* Configurations Grid */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Left: General Settings (Col 8) */}
          <div className="md:col-span-8 space-y-6">
            {/* Account Details Card */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Profile Identity</span>
                  <div className="text-xs text-zinc-300 font-semibold bg-zinc-900/40 px-4 py-2.5 rounded-xl border border-zinc-900 truncate">
                    {email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Access Permissions</span>
                  <div className="text-xs text-zinc-300 font-semibold bg-zinc-900/40 px-4 py-2.5 rounded-xl border border-zinc-900">
                    Administrator (Contributor)
                  </div>
                </div>
              </div>
            </div>

            {/* Research Preferences Card */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Research Engine Configuration
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">
                    Default LLM Agent Checklist Mode
                  </label>
                  <select
                    value={researchPref}
                    onChange={(e) => setResearchPref(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/40 transition cursor-pointer"
                  >
                    <option value="comprehensive">Comprehensive Critique Portfolio (Strengths, Weaknesses, Novelty)</option>
                    <option value="fast">Fast Briefing Profile (Executive Summary & Key Claims Only)</option>
                    <option value="technical">Technical Depth Focus (Formulas, Math, Reproducibility Score)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">
                    Workspace Theme Mode
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/40 transition cursor-pointer"
                  >
                    <option value="dark">Enterprise Dark (Vercel Deep Slate Theme - #09090b)</option>
                    <option value="light">Developer Gray (High Contrast Palette - #18181b)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Informational Notes (Col 4) */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Security & Sync Details
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Active sessions are validated dynamically via OAuth JSON Web Tokens. Local database caches will persist in your isolated workspace unless manually disconnected.
              </p>
              <div className="text-[10px] text-zinc-500 bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl font-mono leading-tight">
                Client API: 127.0.0.1:8000
                <br />
                JWT Auth: RSA-256
                <br />
                Cache Level: Workspace Local
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
