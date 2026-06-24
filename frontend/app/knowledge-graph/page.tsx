"use client";

import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";

const KnowledgeGraph = dynamic(
  () => import("@/components/graphs/KnowledgeGraph"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[680px] items-center justify-center text-sm text-zinc-500 bg-zinc-950/40 rounded-3xl border border-zinc-900">
        Loading Semantic Intelligence Map...
      </div>
    ),
  }
);

export default function KnowledgeGraphPage() {
  return (
    <AppLayout activeSection="knowledge-graph">
      <div className="space-y-8 animate-fade-in font-sans">
        <div className="border-b border-zinc-900 pb-4">
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">
            Semantic Intelligence Map
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Knowledge Graph</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Explore the authors, models, methods, datasets, metrics, and concepts extracted from your latest paper.
          </p>
        </div>

        <KnowledgeGraph />
      </div>
    </AppLayout>
  );
}
