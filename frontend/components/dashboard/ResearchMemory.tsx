"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface Memory {
  id: number;
  memory_type: string;
  content: string;
  created_at: string;
}

interface Profile {
  favorite_domains: string[];
  top_models: string[];
  top_datasets: string[];
  top_methods: string[];
  followed_topics: string[];
  followed_authors: string[];
  total_papers_analyzed: number;
  digest: string;
}

export default function ResearchMemory() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchMemoryData();
  }, []);

  const fetchMemoryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile
      const profRes = await api.get("/api/research-profile");
      setProfile(profRes.data);

      // 2. Fetch timeline/memories
      const memRes = await api.get("/api/memory");
      setMemories(memRes.data || []);
    } catch (err) {
      console.error("Failed to fetch memory data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.get(`/api/knowledge-base?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleClearMemory = async () => {
    if (!confirm("Are you sure you want to clear your long-term research memory? This deletes all caches and profiles.")) return;
    setLoading(true);
    try {
      await api.post("/api/memory/clear");
      setProfile(null);
      setMemories([]);
      setSearchResults(null);
      setSearchQuery("");
    } catch (err) {
      console.error(err);
      alert("Failed to clear memory.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data representing weekly uploads
  const getTimelineChartData = () => {
    // Generate mock history list based on actual memory count
    const total = profile?.total_papers_analyzed || memories.length || 0;
    return [
      { week: "Week 1", papers: Math.max(0, total - 4) },
      { week: "Week 2", papers: Math.max(0, total - 2) },
      { week: "Week 3", papers: total }
    ];
  };

  return (
    <div className="space-y-8 font-sans selection:bg-indigo-500/30 text-white relative">
      
      {/* Loading view */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 uppercase tracking-widest animate-pulse font-bold">Querying Long-Term Memory...</p>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Profile Stats & Digest */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Profile Canvas Card */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6 backdrop-blur-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-200">AI Research Profile</h3>
                <span className="text-[9px] text-zinc-550 uppercase tracking-widest block font-bold mt-1">Interest Vectors</span>
              </div>
              <button
                onClick={handleClearMemory}
                className="px-3 py-1.5 border border-rose-950 hover:bg-rose-950/20 text-rose-400 rounded-xl text-[10px] font-bold transition cursor-pointer"
              >
                Reset Index
              </button>
            </div>

            {profile ? (
              <div className="space-y-5 text-xs">
                {/* Favorites categories */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Favorite Domains</span>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                      {profile.favorite_domains?.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded text-[10px] font-bold text-indigo-400">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Top Models</span>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                      {profile.top_models?.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/25 rounded text-[10px] font-bold text-purple-400">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Top Datasets</span>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                      {profile.top_datasets?.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-[10px] font-bold text-emerald-400">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Top Methods</span>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                      {profile.top_methods?.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 rounded text-[10px] font-bold text-amber-400">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Knowledge Base Size</span>
                  <span className="text-sm font-black text-white bg-zinc-950 border border-zinc-850 px-3 py-1 rounded-xl">
                    {profile.total_papers_analyzed} Paper{profile.total_papers_analyzed === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Inadequate database logs. Ingest publications to dynamically construct a Research Profile.
              </div>
            )}
          </div>

          {/* Activity digest markdown */}
          {profile?.digest && (
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Weekly Research Activity Summary</span>
              <article className="prose prose-invert prose-xs text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 border border-zinc-850 rounded-2xl whitespace-pre-wrap font-sans max-h-[300px] overflow-y-auto pr-1">
                {profile.digest}
              </article>
            </div>
          )}

          {/* SVG Research Graph Concept Map */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
            <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">User Research Graph Map</span>
            <div className="h-[220px] bg-zinc-950/50 border border-zinc-850 rounded-2xl relative overflow-hidden flex items-center justify-center">
              {profile ? (
                <svg className="w-full h-full" viewBox="0 0 300 220">
                  {/* Central Node (User) */}
                  <circle cx="150" cy="110" r="14" fill="#6366f1" opacity="0.85" className="animate-pulse" />
                  <text x="150" y="114" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">User</text>

                  {/* Model node */}
                  <line x1="150" y1="110" x2="80" y2="60" stroke="#4f4f4f" strokeDasharray="3,3" />
                  <circle cx="80" cy="60" r="10" fill="#a855f7" opacity="0.8" />
                  <text x="80" y="63" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">Model</text>
                  <text x="80" y="45" textAnchor="middle" fill="#a855f7" fontSize="7" fontWeight="bold" truncate>{profile.top_models?.[0] || "BERT"}</text>

                  {/* Dataset node */}
                  <line x1="150" y1="110" x2="220" y2="60" stroke="#4f4f4f" strokeDasharray="3,3" />
                  <circle cx="220" cy="60" r="10" fill="#10b981" opacity="0.8" />
                  <text x="220" y="63" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">Data</text>
                  <text x="220" y="45" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold" truncate>{profile.top_datasets?.[0] || "SQuAD"}</text>

                  {/* Method node */}
                  <line x1="150" y1="110" x2="150" y2="170" stroke="#4f4f4f" strokeDasharray="3,3" />
                  <circle cx="150" cy="170" r="10" fill="#f59e0b" opacity="0.8" />
                  <text x="150" y="173" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">Method</text>
                  <text x="150" y="190" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold" truncate>{profile.top_methods?.[0] || "Fine-Tune"}</text>
                </svg>
              ) : (
                <span className="text-[10px] text-zinc-550">Pool studies to construct memory topology links.</span>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: KB Explorer, Timelines & Analytics */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Knowledge Base Explorer (Search Engine) */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6 backdrop-blur-md">
            <div>
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Knowledge Base Explorer</h3>
              <p className="text-[11px] text-zinc-550 mt-0.5">Unified SQLite index search and vector semantic similarity lookup.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models, datasets, papers, or semantic concepts..."
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500/40 transition text-white"
              />
              <button
                type="submit"
                className="bg-white hover:bg-zinc-200 text-black px-5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Search
              </button>
            </form>

            {searchResults && (
              <div className="space-y-5 pt-4 border-t border-zinc-900 max-h-[350px] overflow-y-auto pr-1 animate-fade-in text-xs">
                
                {/* 1. Matching Papers */}
                {searchResults.papers?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Publications Matched ({searchResults.papers.length})</span>
                    <div className="space-y-2">
                      {searchResults.papers.map((p: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                          <span className="font-extrabold text-zinc-200 block truncate">{p.title}</span>
                          <span className="text-[9px] text-zinc-550 block mt-0.5 truncate">Authors: {p.authors || "Unknown"}</span>
                          <p className="text-[10px] text-zinc-450 leading-relaxed mt-1">{p.abstract}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matching Entities */}
                {searchResults.entities?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Entities Matched ({searchResults.entities.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResults.entities.map((e: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-zinc-250 block truncate max-w-[150px]">{e.name}</span>
                            <span className="text-[9px] text-zinc-550 block mt-0.5 truncate max-w-[150px]">In: {e.paper_title}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded text-[8px] font-bold text-indigo-400 uppercase">
                            {e.entity_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Semantic Memories */}
                {searchResults.memories?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Semantic Memories (ChromaDB Vector Match)</span>
                    <div className="space-y-2">
                      {searchResults.memories.map((m: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-1.5">
                          <div className="flex justify-between items-center w-full">
                            <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] font-bold text-purple-400 uppercase">
                              {m.memory_type}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-650">Distance: {m.distance}</span>
                          </div>
                          <p className="text-[10px] text-zinc-350 leading-relaxed">{m.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.papers?.length === 0 && searchResults.entities?.length === 0 && searchResults.memories?.length === 0 && (
                  <p className="text-center py-6 text-zinc-550">No database or vector items matched your query.</p>
                )}

              </div>
            )}
          </div>

          {/* Historical Analytics chart */}
          {profile && profile.total_papers_analyzed > 0 && (
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
              <div>
                <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Research Timeline Analytics</span>
                <p className="text-[10px] text-zinc-550 mt-0.5">Vector database ingestion progression.</p>
              </div>

              <div className="h-[180px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getTimelineChartData()}>
                    <defs>
                      <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 9 }} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }} />
                    <Area type="monotone" dataKey="papers" stroke="#6366f1" fillOpacity={1} fill="url(#colorPapers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Memory Timeline List */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
            <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Historical Study Timeline</span>
            <div className="relative pl-4 border-l border-zinc-800 space-y-5 max-h-[350px] overflow-y-auto pr-1">
              {memories.filter(m => m.memory_type === "PAPER").map((mem, i) => (
                <div key={i} className="relative group">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-black group-hover:scale-125 transition-transform" />
                  <div className="bg-zinc-950/40 p-3.5 border border-zinc-850 rounded-xl space-y-1 text-xs">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-black">
                      {mem.created_at ? new Date(mem.created_at).toLocaleDateString() : "Just Now"}
                    </span>
                    <p className="text-zinc-300 font-extrabold leading-snug truncate max-w-[340px]">{mem.content.split("\n")[0].replace("Title: ", "")}</p>
                    <span className="text-[10px] text-zinc-500 font-bold block">{mem.content.split("\n")[1]}</span>
                  </div>
                </div>
              ))}

              {memories.filter(m => m.memory_type === "PAPER").length === 0 && (
                <div className="text-center py-6 text-zinc-550 text-xs pl-4 border-none">
                  Timeline empty. Pooled papers will appear in chronological memory progression.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
