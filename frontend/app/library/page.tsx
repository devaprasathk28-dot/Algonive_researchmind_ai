"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import Sidebar from "@/components/layout/Sidebar";

interface Paper {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  summary?: string; // serialized JSON
  critique?: string; // serialized JSON
  created_at: string;
  status: string;
  file_path?: string;
  report_path?: string;
  analysis?: {
    novelty: string;
    clarity: string;
    innovation: string;
    technical_depth: string;
  };
}

const parseArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val
      .split(/\n+/)
      .map((line) => line.replace(/^[\s*\-•+]+/, "").trim())
      .filter(Boolean);
  }
  return [val];
};

export default function LibraryPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState<number | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  // Fetch papers from backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      const wsId = localStorage.getItem("workspace_id");
      if (!token || !userId) {
        router.push("/auth/login");
        return;
      }
      if (!wsId) {
        router.push("/workspaces");
        return;
      }
      setAuthorized(true);
      fetchLibrary(parseInt(userId), parseInt(wsId));
    }
  }, [router]);

  const fetchLibrary = async (userId: number, workspaceId: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/library/${userId}?workspace_id=${workspaceId}`);
      setPapers(res.data?.papers || []);
    } catch (err) {
      console.error("Failed to fetch library papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete paper from DB
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this paper from your library?")) return;

    try {
      await api.delete(`/paper/${id}`);
      setPapers((prev) => prev.filter((p) => p.id !== id));
      if (selectedPaper && selectedPaper.id === id) {
        setModalOpen(false);
        setSelectedPaper(null);
      }
    } catch (err) {
      console.error("Failed to delete paper:", err);
      alert("Error deleting paper. Try again.");
    }
  };

  // Load paper into active workspace / RAG index
  const handleLoadWorkspace = async (e: React.MouseEvent | null, id: number, targetPath: string = "/dashboard") => {
    if (e) e.stopPropagation();
    try {
      setWorkspaceLoading(id);
      const res = await api.post(`/library/load/${id}`);
      
      // Cache paper data in session storage for the command center and graph
      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(res.data));
      
      // Redirect
      router.push(targetPath);
    } catch (err) {
      console.error("Failed to load paper to workspace:", err);
      alert("Error loading paper into workspace.");
    } finally {
      setWorkspaceLoading(null);
    }
  };

  // Download report for a paper
  const handleDownloadReport = async (e: React.MouseEvent, paperId: number, format: 'pdf' | 'docx' | 'pptx') => {
    e.stopPropagation();
    const downloadKey = `${paperId}-${format}`;
    try {
      setDownloadingReport(downloadKey);
      const response = await api.get(`/library/report/${paperId}/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${paperId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Failed to download ${format} report:`, err);
      alert(`Error downloading ${format} report.`);
    } finally {
      setDownloadingReport(null);
    }
  };

  // Open details modal
  const handleOpenDetails = (paper: Paper) => {
    setSelectedPaper(paper);
    setModalOpen(true);
  };

  // Filter papers based on search
  const filteredPapers = papers.filter((paper) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = paper.title?.toLowerCase().includes(q) || false;
    const authorsMatch = paper.authors?.toLowerCase().includes(q) || false;
    const abstractMatch = paper.abstract?.toLowerCase().includes(q) || false;
    return titleMatch || authorsMatch || abstractMatch;
  });

  // Parse JSON data for presentation
  const getParsedSummary = (paper: Paper) => {
    if (!paper.summary) return null;
    try {
      return JSON.parse(paper.summary);
    } catch {
      return { tldr: paper.summary, key_contributions: [] };
    }
  };

  const getParsedCritique = (paper: Paper) => {
    if (!paper.critique) return null;
    try {
      return JSON.parse(paper.critique);
    } catch {
      return { strengths: [], weaknesses: [] };
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
          Verifying Library Credentials...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Sidebar active="library" />
      
      <main className="flex-1 p-8 overflow-y-auto max-h-screen relative overflow-x-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-8 z-10 relative">
          
          {/* Dashboard Title & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/50 pb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Permanent Library</h2>
              <p className="text-sm text-zinc-400">Manage and browse through your saved academic papers and analytical scores.</p>
            </div>
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, abstract..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition text-white"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500 absolute left-3 top-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Workspace Loading Overlay */}
          {workspaceLoading !== null && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50 animate-fade-in">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Loading Workspace Environment...
              </h3>
              <p className="text-sm text-zinc-400 tracking-wide animate-pulse">
                Re-indexing text chunks and loading semantic analyses into session.
              </p>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider animate-pulse">
                Scanning Repository Library...
              </span>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl p-8 backdrop-blur-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-zinc-300">No Research Papers Found</h3>
              <p className="text-zinc-500 text-xs mt-1">
                {searchQuery ? "Try checking spelling or adjusting your keywords filter." : "Upload publications in the Command Console to persist research analytics."}
              </p>
              {!searchQuery && (
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Upload Your First Paper
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPapers.map((paper) => {
                const summaryObj = getParsedSummary(paper);
                const avgScore = paper.analysis
                  ? (parseFloat(paper.analysis.novelty || "0") +
                     parseFloat(paper.analysis.clarity || "0") +
                     parseFloat(paper.analysis.innovation || "0") +
                     parseFloat(paper.analysis.technical_depth || "0")) / 4.0
                  : null;

                return (
                  <div
                    key={paper.id}
                    onClick={() => handleOpenDetails(paper)}
                    className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 hover:border-indigo-500/20 transition-all flex flex-col justify-between cursor-pointer group hover:bg-zinc-900/40 relative overflow-hidden backdrop-blur-md"
                  >
                    <div className="space-y-4">
                      {/* Header: Title and Scores */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-md font-extrabold group-hover:text-indigo-400 transition-colors line-clamp-2 pr-6">
                            {paper.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-semibold truncate max-w-[340px]">
                            By {paper.authors || "Unknown Authors"}
                          </p>
                        </div>

                        {/* Overall score badge */}
                        {avgScore !== null && (
                          <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl text-center shrink-0">
                            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black block">SCORE</span>
                            <span className="text-sm font-black text-white">{avgScore.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Description: Abstract or TLDR */}
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {summaryObj?.tldr || paper.abstract || "No abstract or summary details saved."}
                      </p>

                      {/* Breakdown score badges if analysis exists */}
                      {paper.analysis && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="text-[10px] font-bold bg-zinc-950/70 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg">
                            Novelty: <b className="text-emerald-400">{paper.analysis.novelty}</b>
                          </span>
                          <span className="text-[10px] font-bold bg-zinc-950/70 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg">
                            Clarity: <b className="text-indigo-400">{paper.analysis.clarity}</b>
                          </span>
                          <span className="text-[10px] font-bold bg-zinc-950/70 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg">
                            Depth: <b className="text-purple-400">{paper.analysis.technical_depth}</b>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-zinc-900/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          Saved: {new Date(paper.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {/* File status badge */}
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                            paper.status === "completed" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 animate-pulse"
                          }`}>
                            {paper.status || "completed"}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons panel */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                          {/* View Analysis */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDetails(paper); }}
                            className="px-3 py-2 bg-zinc-850 hover:bg-zinc-750 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            View
                          </button>

                          {/* Open Chat */}
                          <button
                            onClick={(e) => handleLoadWorkspace(e, paper.id, "/chat")}
                            className="px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                            Chat
                          </button>

                          {/* Workspace */}
                          <button
                            onClick={(e) => handleLoadWorkspace(e, paper.id, "/dashboard")}
                            className="px-3 py-2 bg-zinc-850 hover:bg-zinc-750 border border-zinc-800 hover:border-indigo-500/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            Workspace
                          </button>
                        </div>

                        {/* Export & Delete group */}
                        <div className="flex items-center gap-2">
                          {/* Download Report Actions */}
                          <div className="relative group/download">
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              Report
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 bottom-full mb-1 w-28 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl p-1 hidden group-hover/download:block hover:block z-20">
                              <button
                                onClick={(e) => handleDownloadReport(e, paper.id, 'pdf')}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition flex items-center justify-between"
                              >
                                <span>PDF</span>
                                {downloadingReport === `${paper.id}-pdf` && <span className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin" />}
                              </button>
                              <button
                                onClick={(e) => handleDownloadReport(e, paper.id, 'docx')}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition flex items-center justify-between"
                              >
                                <span>DOCX</span>
                                {downloadingReport === `${paper.id}-docx` && <span className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin" />}
                              </button>
                              <button
                                onClick={(e) => handleDownloadReport(e, paper.id, 'pptx')}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-zinc-900 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition flex items-center justify-between"
                              >
                                <span>PPTX</span>
                                {downloadingReport === `${paper.id}-pptx` && <span className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin" />}
                              </button>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDelete(e, paper.id)}
                            className="p-2 border border-zinc-800 hover:border-red-500/35 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                            title="Delete Paper"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paper Detail Analysis Modal */}
          {modalOpen && selectedPaper && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto animate-fade-in">
              <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-scale-up">
                
                {/* Close Button */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 rounded-lg transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Title & Metadata */}
                <div className="space-y-2 pr-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    Static Archival Dossier
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
                    {selectedPaper.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-bold">
                    By {selectedPaper.authors || "Unknown Authors"}
                  </p>
                </div>

                {/* Grid: Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left Column: Summary & Critique (Col 8) */}
                  <div className="md:col-span-8 space-y-6">
                    
                    {/* Executive Summary */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">AI Executive Summary</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 border border-zinc-900 rounded-2xl">
                        {getParsedSummary(selectedPaper)?.tldr || selectedPaper.abstract || "No executive summary parsed."}
                      </p>
                    </div>

                    {/* Key Contributions */}
                    {parseArray(getParsedSummary(selectedPaper)?.key_contributions).length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Key Contributions</h4>
                        <ul className="space-y-2 text-xs text-zinc-300">
                          {parseArray(getParsedSummary(selectedPaper).key_contributions).map((c: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <span className="text-indigo-400 font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    {selectedPaper.critique && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Strengths</h4>
                          <div className="bg-emerald-950/10 border border-emerald-950/20 p-4 rounded-2xl space-y-2.5 max-h-48 overflow-y-auto">
                            {parseArray(getParsedCritique(selectedPaper)?.strengths).map((s: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-zinc-300 leading-relaxed">
                                <b className="text-zinc-200 block">{s.point || s}</b>
                                {s.explanation && <span className="text-zinc-500">{s.explanation}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider">Weaknesses</h4>
                          <div className="bg-rose-950/10 border border-rose-950/20 p-4 rounded-2xl space-y-2.5 max-h-48 overflow-y-auto">
                            {parseArray(getParsedCritique(selectedPaper)?.weaknesses).map((w: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-zinc-300 leading-relaxed">
                                <b className="text-zinc-200 block">{w.point || w}</b>
                                {w.explanation && <span className="text-zinc-500">{w.explanation}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Scores Breakdowns (Col 4) */}
                  <div className="md:col-span-4 space-y-6">
                    
                    {/* Research Quality Scores */}
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-4">
                      <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Quality Breakdowns</h4>
                      
                      {selectedPaper.analysis ? (
                        <div className="space-y-3.5">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-zinc-400 font-semibold">Novelty</span>
                              <span className="text-zinc-200 font-bold">{selectedPaper.analysis.novelty}/10</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${parseFloat(selectedPaper.analysis.novelty) * 10}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-zinc-400 font-semibold">Clarity</span>
                              <span className="text-zinc-200 font-bold">{selectedPaper.analysis.clarity}/10</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${parseFloat(selectedPaper.analysis.clarity) * 10}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-zinc-400 font-semibold">Innovation</span>
                              <span className="text-zinc-200 font-bold">{selectedPaper.analysis.innovation}/10</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-violet-500 h-full rounded-full" style={{ width: `${parseFloat(selectedPaper.analysis.innovation) * 10}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-zinc-400 font-semibold">Technical Depth</span>
                              <span className="text-zinc-200 font-bold">{selectedPaper.analysis.technical_depth}/10</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${parseFloat(selectedPaper.analysis.technical_depth) * 10}%` }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500 text-center py-6">
                          No analytical scores saved.
                        </div>
                      )}
                    </div>

                    {/* Report Download Panel inside Modal */}
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 space-y-3">
                      <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Download Briefings</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => handleDownloadReport(e, selectedPaper.id, 'pdf')}
                          className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          PDF
                        </button>
                        <button
                          onClick={(e) => handleDownloadReport(e, selectedPaper.id, 'docx')}
                          className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          DOCX
                        </button>
                        <button
                          onClick={(e) => handleDownloadReport(e, selectedPaper.id, 'pptx')}
                          className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          PPTX
                        </button>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLoadWorkspace(null, selectedPaper.id, "/dashboard")}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-8.22-.07m0 0a6 6 0 0 1-.07-8.23m8.29 8.3 4.25 4.25m-4.25-4.25a6 6 0 0 0-8.22-.07m8.22.07a6 6 0 0 1 0-8.22m-8.22 8.22L3 18.5" />
                        </svg>
                        Load into Workspace
                      </button>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition flex justify-center items-center cursor-pointer"
                      >
                        Close Dossier View
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
