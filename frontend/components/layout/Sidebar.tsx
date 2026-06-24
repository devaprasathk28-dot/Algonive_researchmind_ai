"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface SidebarProps {
  active?: string;
}

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState("Researcher");
  const [workspaceName, setWorkspaceName] = useState("Personal Workspace");
  const [recentPapers, setRecentPapers] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email") || "researcher@workspace";
      setUserEmail(email);
      const wsName = localStorage.getItem("workspace_name") || "Personal Workspace";
      setWorkspaceName(wsName);

      const userId = localStorage.getItem("user_id");
      const wsId = localStorage.getItem("workspace_id");
      if (userId) {
        let url = `/dashboard/recent/${userId}`;
        if (wsId) url += `?workspace_id=${wsId}`;
        api.get(url)
          .then((res) => {
            setRecentPapers(res.data.recent_papers || []);
            setRecentChats(res.data.recent_chats || []);
          })
          .catch((err) => console.error(err));
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("email");
      localStorage.removeItem("workspace_id");
      localStorage.removeItem("workspace_name");
      sessionStorage.clear();
      router.push("/auth/login");
    }
  };

  const navItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      id: "feed",
      name: "Personal Feed",
      href: "/feed",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      )
    },
    {
      id: "library",
      name: "Library",
      href: "/library",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      id: "workspaces",
      name: "Workspaces",
      href: "/workspaces",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
        </svg>
      )
    },
    {
      id: "discovery",
      name: "Discovery Portal",
      href: "/discovery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
        </svg>
      )
    },
    {
      id: "chat",
      name: "Copilot Chat",
      href: "/chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-2.139M18 15.001a9 9 0 0 1-9 9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    },
    {
      id: "analytics",
      name: "Analytics",
      href: "/analytics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
        </svg>
      )
    },
    {
      id: "knowledge-graph",
      name: "Knowledge Graph",
      href: "/knowledge-graph",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      )
    },
    {
      id: "admin",
      name: "Monitoring Console",
      href: "/admin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>
      )
    },
    {
      id: "settings",
      name: "Settings",
      href: "/settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1 1 12.42 7.42 2 2 0 0 1 9.59 4.59ZM9.59 16.59A2 2 0 1 1 12.42 19.42 2 2 0 0 1 9.59 16.59ZM4.59 9.59A2 2 0 1 1 7.42 12.42 2 2 0 0 1 4.59 9.59ZM16.59 9.59A2 2 0 1 1 19.42 12.42 2 2 0 0 1 16.59 9.59Z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0 select-none z-30 font-sans">
      <div className="space-y-6 flex flex-col h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-650/15">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">ResearchMind AI</h1>
            <span className="text-[8px] text-zinc-650 font-bold uppercase tracking-widest block -mt-0.5">Enterprise Suite</span>
          </div>
        </div>

        {/* Active Workspace Panel */}
        <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-900/60 rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <span className="text-[7px] text-zinc-550 font-bold uppercase tracking-widest block">Workspace</span>
              <span className="text-[10px] text-zinc-300 font-black truncate block leading-tight">{workspaceName}</span>
            </div>
          </div>
          <Link
            href="/workspaces"
            className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition ml-2 uppercase tracking-wider shrink-0"
            title="Switch Workspace"
          >
            Switch
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isItemActive = active ? active === item.id : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isItemActive
                    ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-sm"
                    : "border border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/30"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Recent Papers Feed */}
        {recentPapers.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-zinc-900/50">
            <h4 className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest">Recent Papers</h4>
            <div className="space-y-1.5">
              {recentPapers.map((paper) => (
                <Link
                  key={paper.id}
                  href="/library"
                  className="block text-[10px] font-medium text-zinc-450 hover:text-indigo-400 transition truncate pr-2"
                  title={paper.title}
                >
                  📄 {paper.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats Feed */}
        {recentChats.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-zinc-900/50">
            <h4 className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest">Recent Chats</h4>
            <div className="space-y-1.5">
              {recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  href="/chat"
                  className="block text-[10px] font-medium text-zinc-450 hover:text-indigo-400 transition truncate pr-2"
                  title={chat.question}
                >
                  💬 {chat.question}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile Details */}
      <div className="pt-4 border-t border-zinc-900/50 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex justify-center items-center text-xs font-bold text-zinc-300 uppercase">
            {userEmail.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <span className="text-[9px] font-black text-zinc-400 block truncate leading-tight uppercase tracking-wider">Session Profile</span>
            <span className="text-[9px] text-zinc-550 block truncate font-medium">{userEmail}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 bg-zinc-900 hover:bg-red-950/20 border border-zinc-850 hover:border-red-900/30 text-zinc-450 hover:text-red-400 rounded-xl text-xs font-bold transition cursor-pointer flex justify-center items-center gap-2"
        >
          Disconnect
        </button>
      </div>
    </aside>
  );
}
