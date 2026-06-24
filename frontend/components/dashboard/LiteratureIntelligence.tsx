"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Paper {
  id: number;
  title: string;
  authors: string;
  created_at: string;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  paper_ids: number[];
  created_at: string;
}

export default function LiteratureIntelligence() {
  // DB list states
  const [collections, setCollections] = useState<Collection[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  
  // Selected Collection & Results
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  
  // Creator states
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
  
  // Tabs & Q&A
  const [activeTab, setActiveTab] = useState<string>("canvas");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const suggestedQuestions = [
    "What remains unsolved in this collection?",
    "Compare the methodologies used by the papers.",
    "What are the major research gaps in these works?",
    "Explain the scientific consensus of this pool."
  ];

  // Colors for charts
  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Collections
      const colRes = await api.get("/api/collections");
      setCollections(colRes.data || []);
      
      // 2. Fetch Papers
      const papersRes = await api.get("/api/library");
      setPapers(papersRes.data || []);
    } catch (err) {
      console.error("Failed to load collections or papers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCollection = async (id: number) => {
    setSelectedCollectionId(id);
    setAnalysisResult(null);
    setChatMessages([]);
    
    // Find details
    const col = collections.find(c => c.id === id) || null;
    setSelectedCollection(col);
    
    if (col) {
      // Try to load pre-existing review or auto-trigger review loading
      // For now, let user trigger "Generate Literature Analysis" manually
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.post("/api/collections", {
        name: newName,
        description: newDesc,
        paper_ids: selectedPaperIds
      });
      
      // Add to state and select
      const newCol = res.data;
      setCollections(prev => [...prev, newCol]);
      setSelectedCollectionId(newCol.id);
      setSelectedCollection(newCol);
      setAnalysisResult(null);
      setChatMessages([]);
      
      // Reset creator form
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
      setSelectedPaperIds([]);
    } catch (err) {
      console.error("Failed to create collection:", err);
      alert("Error creating collection.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaperSelection = (pid: number) => {
    setSelectedPaperIds(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handleGenerateReview = async () => {
    if (!selectedCollectionId) return;
    setGenerating(true);
    setLoadingStep("1. Querying merged database entities...");
    
    try {
      setTimeout(() => setLoadingStep("2. Mapping methodology differentiators..."), 1000);
      setTimeout(() => setLoadingStep("3. Detecting areas of consensus..."), 2000);
      setTimeout(() => setLoadingStep("4. Scanning for structural contradictions..."), 3000);
      setTimeout(() => setLoadingStep("5. Computing NetworkX citation centralities..."), 4000);
      setTimeout(() => setLoadingStep("6. Synthesizing literature canvas report..."), 5000);
      
      const res = await api.post(`/api/collections/${selectedCollectionId}/generate`);
      setAnalysisResult(res.data);
      setActiveTab("canvas");
    } catch (err) {
      console.error("Failed to run literature analysis pipeline:", err);
      alert("Error generating review. Make sure you have added papers with extracted entities.");
    } finally {
      setGenerating(false);
    }
  };

  const handleChatSubmit = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim() || !selectedCollectionId) return;

    const userMsg = { role: "user", content: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.post(`/api/collections/${selectedCollectionId}/ask`, {
        question: query
      });
      const botMsg = { role: "assistant", content: res.data.answer || "No response generated." };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to Supervisor Mode." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollectionId) return;
    if (!confirm("Are you sure you want to delete this collection?")) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/collections/${selectedCollectionId}`);
      setCollections(prev => prev.filter(c => c.id !== selectedCollectionId));
      setSelectedCollectionId(null);
      setSelectedCollection(null);
      setAnalysisResult(null);
      setChatMessages([]);
    } catch (err) {
      console.error(err);
      alert("Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!analysisResult?.review?.content) return;
    const blob = new Blob([analysisResult.review.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCollection?.name.toLowerCase().replace(/\s+/g, "_")}_literature_review.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Extract chart data from trends
  const getTrendData = (categoryKey: string) => {
    if (!analysisResult?.trends?.[categoryKey]) return [];
    return analysisResult.trends[categoryKey].map((item: any) => ({
      name: item.name,
      frequency: item.frequency,
      papers: item.paper_count
    }));
  };

  return (
    <div className="space-y-8 font-sans selection:bg-indigo-500/30 text-white relative">
      
      {/* Loading & Generating Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Literature Intelligence Engine
          </h3>
          <p className="text-sm text-zinc-400 tracking-wide animate-pulse">
            {loadingStep}
          </p>
        </div>
      )}

      {/* Main Grid: Collections Selector & Review Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Collections manager */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-5 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-zinc-450 tracking-wider">Research Collections</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Pool
              </button>
            </div>

            {/* List of collections */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {collections.length === 0 ? (
                <div className="text-center py-6 text-zinc-550 text-xs">
                  No collections created yet. Build a pool of papers to begin cross-analysis.
                </div>
              ) : (
                collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleSelectCollection(col.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition flex flex-col gap-1.5 ${
                      selectedCollectionId === col.id
                        ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-600/5"
                        : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-extrabold text-zinc-200">{col.name}</span>
                      <span className="text-[9px] bg-zinc-850 px-2 py-0.5 rounded text-zinc-400 font-bold">
                        {col.paper_ids?.length || 0} Paper{col.paper_ids?.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {col.description && (
                      <p className="text-[10px] text-zinc-500 line-clamp-1 leading-relaxed">{col.description}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected collection info details */}
          {selectedCollection && (
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-200">{selectedCollection.name}</h4>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold mt-1">Collection Scope</span>
                </div>
                <button
                  onClick={handleDeleteCollection}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 border border-zinc-900 hover:border-rose-950 rounded-lg transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>

              {/* Papers lists in collection */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Paper Catalog</span>
                <div className="space-y-1.5">
                  {papers.filter(p => selectedCollection.paper_ids?.includes(p.id)).map((p) => (
                    <div key={p.id} className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-xl flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold block text-zinc-300 truncate leading-snug">{p.title}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">{p.authors || "Unknown author"}</span>
                      </div>
                    </div>
                  ))}
                  {selectedCollection.paper_ids?.length === 0 && (
                    <p className="text-xs text-zinc-500 py-3 text-center">No papers in this collection scope.</p>
                  )}
                </div>
              </div>

              {/* Analysis Trigger Action */}
              <button
                onClick={handleGenerateReview}
                disabled={selectedCollection.paper_ids?.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition mt-2 cursor-pointer"
              >
                Generate Literature Analysis
              </button>
            </div>
          )}

        </div>

        {/* Right pane: Analysis Results Workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          {analysisResult ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Review summary cards & score */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">{analysisResult.review?.title || "Literature review synthesiser"}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400">
                      <span>Total Papers:</span>
                      <b className="text-zinc-200">{analysisResult.collection_metadata?.total_papers || 0}</b>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400">
                      <span>Consensus Points:</span>
                      <b className="text-emerald-400">{analysisResult.consensus?.length || 0}</b>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400">
                      <span>Gaps Detected:</span>
                      <b className="text-amber-400">{analysisResult.gaps?.length || 0}</b>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center p-4 bg-zinc-950 border border-zinc-850 rounded-2xl text-center min-w-[120px]">
                  <span className="text-2xl font-black text-indigo-400">{analysisResult.review?.quality_score?.toFixed(1) || "7.5"}</span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold mt-1">Review Quality</span>
                </div>
              </div>

              {/* Sub-tabs menu */}
              <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-2">
                {[
                  { id: "canvas", label: "Literature Canvas", icon: "📝" },
                  { id: "consensus", label: "Synthesis", icon: "🔬" },
                  { id: "comparison", label: "Comparison Table", icon: "📊" },
                  { id: "trends", label: "Entity Trends", icon: "📈" },
                  { id: "gaps", label: "Gaps & Opportunities", icon: "💡" },
                  { id: "citation", label: "Citation Map", icon: "🕸️" },
                  { id: "supervisor", label: "Supervisor Q&A", icon: "🎓" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-indigo-650 text-white border border-indigo-500/30"
                        : "bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border border-transparent"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md min-h-[420px]">
                
                {/* 1. Canvas Section */}
                {activeTab === "canvas" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                      <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Markdown Canvas Document</span>
                      <button
                        onClick={handleDownloadMarkdown}
                        className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        Download MD Report
                      </button>
                    </div>
                    
                    <article className="prose prose-invert prose-xs text-zinc-300 leading-relaxed max-w-none max-h-[600px] overflow-y-auto pr-2 bg-zinc-950/40 p-6 border border-zinc-850 rounded-2xl whitespace-pre-wrap font-sans">
                      {analysisResult.review?.content}
                    </article>
                  </div>
                )}

                {/* 2. Consensus & Contradictions Section */}
                {activeTab === "consensus" && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Consensus points */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Extracts of Scientific Agreement</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisResult.consensus?.map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-2xl hover:border-emerald-500/20 transition space-y-2">
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 uppercase">
                              {item.category}
                            </span>
                            <p className="text-xs text-zinc-200 leading-relaxed font-semibold">{item.statement}</p>
                            <div className="flex flex-wrap gap-1 items-center mt-2 pt-2 border-t border-zinc-900">
                              <span className="text-[8px] text-zinc-550 uppercase tracking-widest font-black mr-1">Supporting:</span>
                              {item.supporting_papers.map((title: string, j: number) => (
                                <span key={j} className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[8px] truncate max-w-[120px]" title={title}>
                                  {title}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {analysisResult.consensus?.length === 0 && (
                          <p className="text-xs text-zinc-500 col-span-2 text-center py-6">No explicit consensus paths mapped.</p>
                        )}
                      </div>
                    </div>

                    {/* Contradictions */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Methodological Trade-offs & Conflict Areas</h4>
                      <div className="space-y-3">
                        {analysisResult.contradictions?.map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-2xl hover:border-rose-500/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-bold text-rose-400 uppercase">
                                {item.category}
                              </span>
                              <p className="text-xs text-zinc-300 font-semibold leading-relaxed">{item.conflict}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[8px] text-zinc-550 uppercase tracking-widest font-black mr-1 block md:inline">Debated In:</span>
                              {item.papers_involved.map((title: string, j: number) => (
                                <span key={j} className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[8px] truncate max-w-[150px]" title={title}>
                                  {title}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {analysisResult.contradictions?.length === 0 && (
                          <p className="text-xs text-zinc-500 text-center py-6">No active conflict nodes discovered in references.</p>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. Comparison Grid Table */}
                {activeTab === "comparison" && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Side-by-Side Methodology Difference Matrix</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500">
                            <th className="py-3 px-4 font-extrabold">Paper Title</th>
                            <th className="py-3 px-4 font-extrabold">Primary Models</th>
                            <th className="py-3 px-4 font-extrabold">Evaluation Datasets</th>
                            <th className="py-3 px-4 font-extrabold">Core Methods</th>
                            <th className="py-3 px-4 font-extrabold text-center">Score Index</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.comparison?.papers_comparison?.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-950/40 transition">
                              <td className="py-4 px-4 font-bold text-zinc-200 max-w-[200px] truncate" title={p.title}>{p.title}</td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.models.slice(0, 3).map((m: string, idx: number) => (
                                    <span key={idx} className="bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">{m}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.datasets.slice(0, 3).map((d: string, idx: number) => (
                                    <span key={idx} className="bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">{d}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.methods.slice(0, 3).map((m: string, idx: number) => (
                                    <span key={idx} className="bg-zinc-950 border border-zinc-850 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">{m}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center font-extrabold text-indigo-400">
                                {p.scores?.novelty ? (
                                  <span className="bg-indigo-500/10 px-2.5 py-0.5 border border-indigo-500/20 rounded-full">
                                    {((p.scores.novelty + p.scores.technical_depth + p.scores.innovation) / 3).toFixed(1)}/10
                                  </span>
                                ) : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Differentiators bullet highlights */}
                    <div className="mt-6 p-5 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Key Comparative Differentiators</span>
                      <div className="space-y-2 text-xs">
                        {analysisResult.comparison?.differentiators?.map((diff: any, idx: number) => (
                          <div key={idx} className="flex gap-2.5 items-start">
                            <span className="text-indigo-400 font-black">•</span>
                            <p className="text-zinc-300 leading-relaxed">{diff.comparison}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Entity Trends Section */}
                {activeTab === "trends" && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Distribution Pie chart & bars */}
                    <div className="grid md:grid-cols-2 gap-8">
                      
                      {/* Bar chart of top Models */}
                      <div className="space-y-4">
                        <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Top Models Frequency</span>
                        {getTrendData("models").length > 0 ? (
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getTrendData("models")}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }} />
                                <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-650 py-10 text-center">Insufficient model frequency data.</p>
                        )}
                      </div>

                      {/* Bar chart of top Methods */}
                      <div className="space-y-4">
                        <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Top Methods Frequency</span>
                        {getTrendData("methods").length > 0 ? (
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getTrendData("methods")}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                                <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }} />
                                <Bar dataKey="frequency" fill="#a855f7" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-650 py-10 text-center">Insufficient methodology frequency data.</p>
                        )}
                      </div>

                    </div>

                    {/* Entities details cards list */}
                    <div className="space-y-4">
                      <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Top Research Datasets</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        {analysisResult.trends?.datasets?.slice(0, 4).map((d: any, idx: number) => (
                          <div key={idx} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                            <span className="text-xs font-black text-zinc-200 block truncate">{d.name}</span>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-1">Frequency: {d.frequency}</span>
                            <span className="text-[9px] text-indigo-400 font-semibold block mt-1">{d.paper_count} Paper{d.paper_count === 1 ? "" : "s"}</span>
                          </div>
                        ))}
                        {(!analysisResult.trends?.datasets || analysisResult.trends.datasets.length === 0) && (
                          <p className="text-xs text-zinc-500 py-4 col-span-4">No dataset entities found.</p>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. Gaps Section */}
                {activeTab === "gaps" && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Unexplored Gaps & Technology Combinations</h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {analysisResult.gaps?.map((gap: any, i: number) => (
                        <div key={i} className="p-5 bg-zinc-950/80 border border-zinc-850 rounded-2xl flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-bold text-amber-400 uppercase">
                                {gap.category}
                              </span>
                              <span className="text-xs font-black text-zinc-500">Impact: <b className="text-zinc-350">{gap.impact_score}/10</b></span>
                            </div>
                            <h5 className="text-sm font-extrabold text-zinc-200">{gap.title}</h5>
                            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">{gap.description}</p>
                          </div>
                          
                          {/* Progress indicator */}
                          <div className="pt-2">
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full" style={{ width: `${gap.impact_score * 10}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      {analysisResult.gaps?.length === 0 && (
                        <p className="text-xs text-zinc-500 py-10 col-span-2 text-center">No research gaps could be mapped dynamically.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Citation Map Section */}
                {activeTab === "citation" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">NetworkX Citations Pathway Graph</h4>
                        <p className="text-[10px] text-zinc-550 mt-0.5">Flow analysis of parent-child citation centralities.</p>
                      </div>
                      <div className="flex gap-4 text-[10px] font-bold text-zinc-450 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg">
                        <span>Density: {analysisResult.citation_map?.metrics?.density || 0}</span>
                      </div>
                    </div>

                    {/* Simple nodes list and path visualization */}
                    <div className="grid md:grid-cols-12 gap-6">
                      
                      <div className="md:col-span-8 bg-zinc-950/60 border border-zinc-850 rounded-2xl p-5 space-y-4">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Flow Pathway Channels</span>
                        <div className="space-y-4">
                          {analysisResult.citation_map?.edges?.map((edge: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 text-xs">
                              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-bold truncate max-w-[180px]">
                                {edge.source}
                              </div>
                              <span className="text-zinc-650 font-black flex-1 border-t border-dashed border-zinc-800 text-center text-[10px] py-1">cites</span>
                              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg font-bold truncate max-w-[180px]">
                                {edge.target}
                              </div>
                            </div>
                          ))}
                          {(!analysisResult.citation_map?.edges || analysisResult.citation_map.edges.length === 0) && (
                            <p className="text-xs text-zinc-500 text-center py-10">No citations links discovered.</p>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl p-5 space-y-4">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Influence Centrality</span>
                        <div className="space-y-3">
                          {analysisResult.citation_map?.nodes?.map((node: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center border-b border-zinc-900 pb-2 text-xs">
                              <span className="font-extrabold text-zinc-300 truncate max-w-[140px]" title={node.id}>{node.id}</span>
                              <div className="flex gap-2">
                                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 border border-indigo-500/20 rounded font-black">PR: {node.influence_score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 7. Supervisor Q&A Chat Section */}
                {activeTab === "supervisor" && (
                  <div className="space-y-5 animate-fade-in flex flex-col h-[480px]">
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                      <div>
                        <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">Research Supervisor Q&A</span>
                        <p className="text-[10px] text-zinc-550">Interactive dialogue about the research collection limits.</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-400 uppercase">
                        Supervisor Mode Active
                      </span>
                    </div>

                    {/* Chat messages canvas */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                      {chatMessages.length === 0 && (
                        <div className="text-zinc-500 space-y-4 mt-4">
                          <p>Welcome to <b>Supervisor Mode Q&A</b>. I have reviewed the literature collection '{selectedCollection?.name}'. Ask me questions regarding limits, methodologies, or gaps.</p>
                          <div className="space-y-2 mt-4">
                            <span className="text-[10px] uppercase font-bold text-zinc-650 tracking-wider block">Recommended supervisor prompts:</span>
                            {suggestedQuestions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => handleChatSubmit(q)}
                                className="w-full text-left p-3 border border-zinc-800 hover:border-indigo-500/30 hover:bg-indigo-950/15 rounded-xl text-xs text-zinc-300 font-semibold transition"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {chatMessages.map((m, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-2xl leading-relaxed max-w-[85%] ${
                            m.role === "user"
                              ? "bg-indigo-600 text-white ms-auto font-medium"
                              : "bg-zinc-950/80 border border-zinc-850 text-zinc-300 mr-auto font-medium"
                          }`}
                        >
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500 block font-bold mb-1">
                            {m.role === "user" ? "Researcher" : "Research Supervisor"}
                          </span>
                          {m.content}
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-zinc-400 w-[120px] flex gap-1 justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}
                    </div>

                    {/* Chat footer input */}
                    <div className="pt-3 border-t border-zinc-900 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Query the literature pool..."
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500/40 transition text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleChatSubmit();
                        }}
                      />
                      <button
                        onClick={() => handleChatSubmit()}
                        className="bg-white hover:bg-zinc-200 text-black px-5 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        Query
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-zinc-900/10 border border-dashed border-zinc-900 rounded-3xl p-12 text-center space-y-4 min-h-[450px] flex flex-col justify-center items-center">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-full text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253m0 0A17.919 17.919 0 0 0 12 10.5c3.162 0 6.133.815 8.716 2.247" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-350">Literature Intelligence Workspace</h4>
                <p className="text-xs text-zinc-500 max-w-sm mt-1 mx-auto leading-relaxed">
                  Select a research collection from the left panel and click 'Generate Literature Analysis' to run multi-paper synthesiser.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleCreateCollection} className="bg-zinc-950 border border-zinc-850 rounded-3xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-extrabold text-white">Create Research Collection</h4>
                <span className="text-[9px] uppercase tracking-widest text-zinc-550 font-bold block mt-0.5">Aggregate relative studies</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-zinc-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[350px]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. LLM Architectures Survey"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Focus areas, comparative baselines, or synthesis objective..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40 transition min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">Select Papers to Pool</label>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-zinc-900 bg-zinc-950 p-2 rounded-xl">
                  {papers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTogglePaperSelection(p.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                        selectedPaperIds.includes(p.id)
                          ? "bg-indigo-950/20 border-indigo-500/35"
                          : "border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/30"
                      }`}
                    >
                      <span className="font-bold text-zinc-350 truncate max-w-[320px]">{p.title}</span>
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                        selectedPaperIds.includes(p.id) ? "bg-indigo-550 text-white" : "border border-zinc-700"
                      }`}>
                        {selectedPaperIds.includes(p.id) && "✓"}
                      </span>
                    </button>
                  ))}
                  {papers.length === 0 && (
                    <p className="text-[10px] text-zinc-550 text-center py-4">No uploaded papers in library to pool.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-900 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
