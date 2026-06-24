"use client";

import { useState } from "react";
import api from "@/services/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RoadmapStep {
  phase: string;
  label: string;
  description: string;
  deliverable: string;
}

interface RecommendedModel {
  recommended_model: string;
  parameter_size: string;
  suitability_reason: string;
  alternatives: string[];
}

interface Dataset {
  name: string;
  size: string;
  metric: string;
  suitability: string;
}

interface ReadinessReport {
  readiness_score: number;
  target_venue: string;
  difficulty_level: string;
  improvement_suggestions: string[];
}

interface StrategyReport {
  domain: string;
  gaps: {
    overexplored: { name: string; reason: string }[];
    emerging: { name: string; reason: string }[];
    underexplored: { name: string; reason: string }[];
  };
  recommended_model: RecommendedModel;
  recommended_datasets: Dataset[];
  roadmap: RoadmapStep[];
  readiness: ReadinessReport;
  strategy: {
    recommended_direction: string;
    recommended_experiments: string[];
    expected_challenges: string[];
  };
  report_markdown: string;
  report_html: string;
}

export default function ResearchAdvisor() {
  // Navigation tabs within advisor
  const [subTab, setSubTab] = useState<"mentor" | "roadmap" | "resources" | "readiness" | "report">("mentor");

  // Loading state
  const [loading, setLoading] = useState(false);

  // 1. Mentor Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your AI Research Mentor. Ask me any strategic questions about your paper collections, target architectures, dataset selections, publication pipelines, or open research gaps."
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  // 2. Roadmap Builder States
  const [roadmapGoal, setRoadmapGoal] = useState("Build low-latency price slippage predictions on decentralized liquidity pools");
  const [roadmapData, setRoadmapData] = useState<RoadmapStep[] | null>(null);

  // 3. Resources Recommender States
  const [domainInput, setDomainInput] = useState("FinTech / DeFi Analytics");
  const [datasetsData, setDatasetsData] = useState<Dataset[] | null>(null);
  const [taskInput, setTaskInput] = useState("generation");
  const [computeInput, setComputeInput] = useState("gpu");
  const [modelData, setModelData] = useState<RecommendedModel | null>(null);

  // 4. Publication Readiness States
  const [scores, setScores] = useState({
    novelty: 8.0,
    methodology: 7.5,
    benchmarks: 7.0,
    experiments: 8.0
  });
  const [readinessData, setReadinessData] = useState<ReadinessReport | null>(null);

  // 5. Strategy Report States
  const [compiledReport, setCompiledReport] = useState<StrategyReport | null>(null);

  // API Triggers
  const sendChatMessage = async (msgText: string) => {
    if (!msgText.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: msgText };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/advisor/ask", { question: msgText });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error communicating with the AI Research Mentor. Please check backend connection." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/advisor/roadmap", { goal: roadmapGoal });
      setRoadmapData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to build research roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetResources = async () => {
    setLoading(true);
    try {
      const dsRes = await api.post("/api/advisor/datasets", { domain: domainInput });
      const mdRes = await api.post("/api/advisor/models", { task: taskInput, resources: computeInput });
      setDatasetsData(dsRes.data);
      setModelData(mdRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to query model and dataset advisors.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateReadiness = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/advisor/publication-readiness", scores);
      setReadinessData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to assess publication readiness.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompileReport = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/advisor/report", {
        goal: roadmapGoal,
        scores: scores
      });
      setCompiledReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to compile strategic report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans text-white relative">
      {/* Loading HUD */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 uppercase tracking-widest animate-pulse font-bold">Consulting AI Research Advisor...</p>
        </div>
      )}

      {/* Header Widget */}
      <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-zinc-200">🎓 Autonomous Research Advisor</h2>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Strategic guidance, dataset benchmark advice, target venues, and milestone mapping.</p>
        </div>
        
        {/* Sub-tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "mentor", label: "💬 Mentor Chat" },
            { id: "roadmap", label: "🗺️ Roadmap Builder" },
            { id: "resources", label: "🛠️ Resources" },
            { id: "readiness", label: "📈 Peer Readiness" },
            { id: "report", label: "📝 Strategy Report" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition cursor-pointer ${
                subTab === t.id
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "border-zinc-900 hover:border-zinc-800 text-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}

      {/* SUBTAB 1: MENTOR CHAT */}
      {subTab === "mentor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chat Interface Canvas */}
          <div className="lg:col-span-8 bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6 flex flex-col h-[550px] justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white ms-auto font-medium"
                      : "bg-zinc-900/70 border border-zinc-850 text-zinc-300 mr-auto"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex gap-3 border-t border-zinc-900 pt-4">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(chatInput); }}
                placeholder="Ask your AI research advisor (e.g. 'What open research gaps exist in my workspace?')"
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500/40 transition"
              />
              <button
                onClick={() => sendChatMessage(chatInput)}
                className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>

          {/* Quick Prompts Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Quick Advisor Prompts</h3>
              <p className="text-[11px] text-zinc-500">Select standard inquiries to run profile-based scans:</p>
              <div className="space-y-2">
                {[
                  "Scan open research gaps in my workspace.",
                  "Recommend target models and dataset configurations.",
                  "What is my estimated peer publication readiness score?",
                  "Generate a customized 6-phase research milestone roadmap.",
                  "Tell me the expected risks and bottlenecks in DeFi research."
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendChatMessage(p)}
                    className="w-full text-left p-3 border border-zinc-900 hover:border-indigo-500/30 hover:bg-indigo-950/10 rounded-xl text-xs text-zinc-300 font-semibold transition cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ROADMAP BUILDER */}
      {subTab === "roadmap" && (
        <div className="space-y-8">
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Build Milestone Roadmap</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={roadmapGoal}
                onChange={(e) => setRoadmapGoal(e.target.value)}
                placeholder="Enter your target research goal..."
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500/40 transition"
              />
              <button
                onClick={handleGenerateRoadmap}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Construct Roadmap
              </button>
            </div>
          </div>

          {roadmapData && (
            <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-8 space-y-8">
              <h4 className="text-sm font-bold text-zinc-200">Custom Research Milestone Blueprint</h4>
              
              <div className="relative pl-6 border-l-2 border-indigo-900/40 space-y-8">
                {roadmapData.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Progress Node */}
                    <div className="absolute -left-[32px] top-1 w-4 h-4 bg-zinc-950 border-2 border-indigo-500 rounded-full group-hover:bg-indigo-500 transition-colors" />
                    
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">{step.phase} — {step.label}</span>
                      <p className="text-xs text-zinc-300 font-semibold max-w-2xl leading-relaxed">{step.description}</p>
                      <div className="inline-block px-2.5 py-1 bg-zinc-900/70 border border-zinc-850 rounded text-[9px] font-bold text-zinc-400">
                        🔑 Deliverable: {step.deliverable}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: RESOURCES */}
      {subTab === "resources" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Resource Recommendation Query</h3>
              
              {/* Domain Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Research Domain</label>
                <select
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none text-zinc-300 cursor-pointer"
                >
                  <option value="FinTech / DeFi Analytics">FinTech / DeFi Analytics</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Applied Deep Learning">General Applied AI</option>
                </select>
              </div>

              {/* Task type input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Core Task Type</label>
                <select
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none text-zinc-300 cursor-pointer"
                >
                  <option value="generation">Text Generation & Instruct LLM</option>
                  <option value="retrieval">Dense Retrieval & Semantic Search</option>
                  <option value="classification">Sequence Tagging & NER Classification</option>
                </select>
              </div>

              {/* Hardware Profile */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Compute Resources Available</label>
                <select
                  value={computeInput}
                  onChange={(e) => setComputeInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs outline-none text-zinc-300 cursor-pointer"
                >
                  <option value="low">Local CPU-only / Consumer laptop</option>
                  <option value="gpu">Standard GPU (1x RTX 4090 / T4)</option>
                  <option value="high">Enterprise Clusters (A100 / H100)</option>
                </select>
              </div>

              <button
                onClick={handleGetResources}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Fetch Resource Advice
              </button>
            </div>
          </div>

          {/* Advice display side */}
          <div className="lg:col-span-8 space-y-8">
            {modelData && (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Recommended Neural Architecture</h3>
                <div className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <span className="text-xs font-bold text-zinc-200">{modelData.recommended_model}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded text-[9px] font-bold text-indigo-400">{modelData.parameter_size}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{modelData.suitability_reason}</p>
                  <div className="text-[10px] text-zinc-500 pt-1">
                    Alternatives: {modelData.alternatives?.map((a, i) => <code key={i} className="mx-1 bg-zinc-900 px-1 py-0.5 rounded text-indigo-300">{a}</code>)}
                  </div>
                </div>
              </div>
            )}

            {datasetsData && (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Target Validation Benchmarks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datasetsData.map((d, i) => (
                    <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-200">{d.name}</h4>
                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[8px] font-bold text-zinc-400">{d.size}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{d.suitability}</p>
                      <div className="text-[9px] text-zinc-500 pt-1">
                        <b>Metric:</b> <code>{d.metric}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: PEER READINESS */}
      {subTab === "readiness" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders Input */}
          <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Assess Peer Review Score</h3>
            
            {[
              { id: "novelty", label: "Novelty Index", desc: "Originality of conceptual blocks vs baselines" },
              { id: "methodology", label: "Methodology Rigor", desc: "Mathematical formalization & validation parameters" },
              { id: "benchmarks", label: "Benchmark Coverage", desc: "Use of standard open validation databases" },
              { id: "experiments", label: "Empirical Execution", desc: "Ablation depth, parameters search range" }
            ].map((s) => (
              <div key={s.id} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-zinc-300">{s.label}</span>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{s.desc}</p>
                  </div>
                  <span className="font-black text-indigo-400">{scores[s.id as keyof typeof scores].toFixed(1)}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores[s.id as keyof typeof scores]}
                  onChange={(e) => setScores({ ...scores, [s.id]: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            ))}

            <button
              onClick={handleEvaluateReadiness}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Evaluate Submission Readiness
            </button>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-7 space-y-8">
            {readinessData ? (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider font-bold">Publication Readiness Analysis</h3>
                
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-900">
                  <div className="w-20 h-20 border-4 border-indigo-500 rounded-full flex items-center justify-center bg-indigo-500/10">
                    <span className="text-xl font-black text-white">{readinessData.readiness_score}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black text-zinc-500">Target Venue Suitability</span>
                    <h4 className="text-sm font-bold text-zinc-200">{readinessData.target_venue}</h4>
                    <span className="text-[10px] text-zinc-400 block">Competition Level: <b className="text-rose-400">{readinessData.difficulty_level}</b></span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black text-zinc-500">Peer Review Improvement Checklist</span>
                  <div className="space-y-2.5">
                    {readinessData.improvement_suggestions.map((sug, i) => (
                      <div key={i} className="flex gap-3 p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-2xl text-xs text-zinc-300">
                        <input type="checkbox" className="mt-0.5 rounded border-zinc-800 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-zinc-900/10 border border-zinc-900 rounded-3xl p-8 flex items-center justify-center text-xs text-zinc-500">
                Awaiting input criteria scores to calculate rating...
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: STRATEGY REPORT COMPILER */}
      {subTab === "report" && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Compile Full Research Strategy Packet</h3>
              <p className="text-[11px] text-zinc-550 mt-1">Gathers gaps, roadmap stages, and suitability profiles into an downloadable artifact bundle.</p>
            </div>
            <button
              onClick={handleCompileReport}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Assemble Report
            </button>
          </div>

          {compiledReport && (
            <div className="space-y-8">
              {/* Actions panel */}
              <div className="flex gap-4">
                <button
                  onClick={() => downloadFile(compiledReport.report_markdown, "Research_Strategy_Report.md", "text/markdown")}
                  className="px-5 py-2.5 bg-indigo-500/15 border border-indigo-500/25 hover:border-indigo-500/50 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  📥 Download Markdown (.md)
                </button>
                <button
                  onClick={() => downloadFile(compiledReport.report_html, "Research_Strategy_Report.html", "text/html")}
                  className="px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  📥 Download HTML (.html)
                </button>
              </div>

              {/* Preview Markdown */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Compiled Report Preview</span>
                <article className="prose prose-invert prose-xs text-xs text-zinc-300 leading-relaxed bg-zinc-950/80 p-6 border border-zinc-850 rounded-2xl whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {compiledReport.report_markdown}
                </article>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
