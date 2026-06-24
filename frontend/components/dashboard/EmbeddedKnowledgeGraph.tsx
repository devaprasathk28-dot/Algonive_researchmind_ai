"use client";

import dynamic from "next/dynamic";

const KnowledgeGraph = dynamic(

  () => import(
    "@/components/graphs/KnowledgeGraph"
  ),

  {
    ssr: false,
  }
);

export default function EmbeddedKnowledgeGraph() {

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6 text-white">

        Research Knowledge Graph
      </h2>

      <KnowledgeGraph />

    </div>
  );
}
