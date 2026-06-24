"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface Workspace {
  id: number;
  name: str;
  description: string;
  created_at: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      if (!token || !userId) {
        router.push("/auth/login");
        return;
      }
      setAuthorized(true);
      fetchWorkspaces(parseInt(userId));
    }
  }, [router]);

  const fetchWorkspaces = async (userId: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${userId}`);
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project Name is required.");
      return;
    }
    setError("");
    try {
      const res = await api.post("/workspaces", {
        name,
        description
      });
      
      // Append the new workspace
      setWorkspaces((prev) => [res.data, ...prev]);
      
      // Auto select new workspace and route
      handleSelectWorkspace(res.data);
    } catch (err: any) {
      console.error("Failed to create workspace:", err);
      setError(err.response?.data?.detail || "Error creating project.");
    }
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("workspace_id", workspace.id.toString());
      localStorage.setItem("workspace_name", workspace.name);
      
      // Redirect to dashboard command center
      router.push("/dashboard");
    }
  };

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
    <main className="min-h-screen bg-black text-white p-8 relative overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      {/* Dynamic background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 z-10 relative">
        
        {/* Brand Logo Header */}
        <header className="flex justify-between items-center pb-6 border-b border-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/15">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent tracking-tight">ResearchMind AI</h1>
              <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest block -mt-0.5">Enterprise Portal</span>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-650 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5H4.5" />
            </svg>
            Create Project
          </button>
        </header>

        {/* Dashboard Title */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Research Workspaces</h2>
          <p className="text-sm text-zinc-400 mt-1">Organize literature search, RAG chat history, and semantic intelligence reports into isolated domains.</p>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider animate-pulse">
              Re-indexing Console Workspaces...
            </span>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl p-8 backdrop-blur-md">
            <div className="text-4xl mb-4">🗂️</div>
            <h3 className="text-lg font-bold text-zinc-300">No Research Workspaces Found</h3>
            <p className="text-zinc-550 text-xs mt-1">Create a workspace to initialize your academic research library.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Set Up First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                onSelect={handleSelectWorkspace}
              />
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up">
            
            {/* Close */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 rounded-lg transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-white leading-snug">
                Create New Research Project
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Set up a sandbox workspace with dynamic isolation.</p>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-450 uppercase font-black tracking-wider block">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NLP Innovations"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-455 uppercase font-black tracking-wider block">Research Domain / Field</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Vision, Large Language Models"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-450 uppercase font-black tracking-wider block">Project Description</label>
                <textarea
                  placeholder="Summarize the core topics, datasets, and objectives of this sandbox..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

interface WorkspaceCardProps {
  workspace: any;
  onSelect: (workspace: any) => void;
}

function WorkspaceCard({ workspace, onSelect }: WorkspaceCardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workspaces/${workspace.id}/stats`)
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [workspace.id]);

  return (
    <div
      onClick={() => onSelect(workspace)}
      className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 hover:border-indigo-500/20 transition-all flex flex-col justify-between cursor-pointer group hover:bg-zinc-900/40 relative overflow-hidden backdrop-blur-md"
    >
      <div className="space-y-4">
        <div>
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            Project Workspace
          </span>
          <h3 className="text-xl font-extrabold group-hover:text-indigo-400 transition-colors mt-2">
            {workspace.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
            {workspace.description || "No description provided."}
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="w-3 h-3 border border-zinc-650 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Syncing Metrics...</span>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-2xl flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Papers</span>
              <span className="text-md font-black text-zinc-300">{stats.papers}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-2xl flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Chats</span>
              <span className="text-md font-black text-zinc-300">{stats.chats}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-2xl flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Reports</span>
              <span className="text-md font-black text-zinc-300">{stats.reports}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900/60 p-3 rounded-2xl flex flex-col">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Graphs</span>
              <span className="text-md font-black text-zinc-300">{stats.graphs}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between items-center pt-6 mt-6 border-t border-zinc-900/50">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
          Created: {new Date(workspace.created_at).toLocaleDateString()}
        </span>
        
        <span className="text-xs font-bold text-zinc-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
          Open Project
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </div>
  );
}
