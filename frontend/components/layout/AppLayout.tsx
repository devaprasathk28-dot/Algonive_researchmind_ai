"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface AppLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

export default function AppLayout({ children, activeSection }: AppLayoutProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const wsId = localStorage.getItem("workspace_id");
      if (!token) {
        router.push("/auth/login");
      } else if (!wsId && activeSection !== "workspaces") {
        router.push("/workspaces");
      } else {
        setAuthorized(true);
      }
    }
  }, [router, activeSection]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
          Syncing Environment Credentials...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-indigo-500/30">
      {/* Pinned Collapsible Sidebar */}
      <Sidebar active={activeSection} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Child Content */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto z-10 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
