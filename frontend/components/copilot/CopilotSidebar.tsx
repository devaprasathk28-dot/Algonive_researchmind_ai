"use client";

import { useState } from "react";
import CopilotChat from "./CopilotChat";

export default function CopilotSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black font-bold z-50 shadow-2xl flex items-center justify-center hover:bg-zinc-200 transition duration-300 cursor-pointer"
      >

        <span className="text-sm tracking-wider font-extrabold">AI</span>

      </button>

      {open && (

        <div className="fixed right-0 top-0 h-full w-[400px] max-w-full bg-zinc-950 border-l border-zinc-800/85 shadow-2xl z-40 flex flex-col">

          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">

            <h2 className="text-xl font-bold text-white tracking-tight">
              ResearchMind Assistant
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-zinc-500 hover:text-white transition font-bold text-sm cursor-pointer"
            >
              ✕ Close
            </button>

          </div>

          <CopilotChat />

        </div>

      )}
    </>
  );
}
