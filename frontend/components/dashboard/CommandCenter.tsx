"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api, {
  uploadPaper,
  generateKnowledgeGraph,
  generateFutureWork,
  exportReports,
  ResearchScores,
} from "@/services/api";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import MiniKnowledgeGraph from "./MiniKnowledgeGraph";
import LiteratureIntelligence from "./LiteratureIntelligence";
import ResearchMemory from "./ResearchMemory";
import ResearchAdvisor from "./ResearchAdvisor";

// Define local interfaces
interface MetricData {
  pages: number;
  sections: number;
  tables: number;
  figures: number;
  references: number;
  words: number;
  readingTime: number;
}

interface ClassificationData {
  category: string;
  subcategory: string;
  complexity: string;
  researchType: string;
  industryDomain: string;
}

interface InsightsData {
  noveltyLevel: string;
  domain: string;
  techStack: string;
  complexity: string;
  industryRelevance: string;
}

interface TimelineEvent {
  phase: string;
  label: string;
  description: string;
}

export default function CommandCenter() {
  // Loading & File state
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [activePaper, setActivePaper] = useState<any>(null);

  // Core features states
  const [summary, setSummary] = useState<string>("");
  const [contributions, setContributions] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<any[]>([]);
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [scores, setScores] = useState<ResearchScores | null>(null);

  // Advanced features states
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [futureWork, setFutureWork] = useState<string[]>([]);
  const [classification, setClassification] = useState<ClassificationData | null>(null);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [multimodal, setMultimodal] = useState<{ figures: number; tables: number; charts: number; topics: string[] } | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Export & Copilot states
  const [exportLinks, setExportLinks] = useState<{ pdf?: string; docx?: string; pptx?: string } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [intelligenceMode, setIntelligenceMode] = useState<"single" | "literature" | "memory" | "advisor">("single");

  // Load paper state from session storage
  const loadPaperIntoState = (parsed: any) => {
    setActivePaper(parsed);
    
    // Reconstruct summary data
    const summaryData = parsed.summary || {};
    setSummary(summaryData.tldr || parsed.abstract || "");
    setContributions(summaryData.key_contributions || []);

    // Reconstruct critique data
    const critiqueData = parsed.critique || {};
    setStrengths(critiqueData.strengths || []);
    setWeaknesses(critiqueData.weaknesses || []);

    // Reconstruct scores
    const resScores = parsed.scores || critiqueData.research_scores || {
      novelty: 8.0,
      clarity: 7.5,
      technical_quality: 8.2,
      reproducibility: 7.0,
      dataset_quality: 7.8,
      innovation: 8.0,
      overall_score: 7.8
    };
    setScores(resScores);

    // Advanced analytics fallbacks
    const totalWords = parsed.word_count || 5000;
    
    setInsights({
      noveltyLevel: resScores.novelty > 8.5 ? "Very High" : "High",
      domain: parsed.domain || "Applied Artificial Intelligence",
      techStack: parsed.techStack || "FastAPI, PyTorch, Transformers",
      complexity: totalWords > 10000 ? "Advanced" : "Intermediate",
      industryRelevance: resScores.innovation > 8.5 ? "Very High" : "High"
    });

    setClassification({
      category: parsed.category || "Artificial Intelligence",
      subcategory: parsed.subcategory || "General Machine Learning",
      complexity: totalWords > 10000 ? "Advanced" : "Intermediate",
      researchType: "Applied Research",
      industryDomain: "Advanced AI Infrastructure"
    });

    const readingTime = Math.max(3, Math.round(totalWords / 220));
    const pageCount = parsed.pdf_metadata?.pages || Math.max(1, Math.round(totalWords / 450));

    setMetrics({
      pages: pageCount,
      sections: 5,
      tables: 2,
      figures: 3,
      references: 15,
      words: totalWords,
      readingTime
    });

    setMultimodal({
      figures: 3,
      tables: 2,
      charts: 1,
      topics: parsed.keywords || ["Deep Learning", "Applied AI", "Technical Evaluation"]
    });

    setTimeline([
      { phase: "Phase 1", label: "System Design", description: "Design order interfaces and WebSocket ingestion layers." },
      { phase: "Phase 2", label: "Model Pretraining", description: "Validate sequence transduction baselines." },
      { phase: "Phase 3", label: "Multimodal OCR Integration", description: "Extract chart and orders layout templates." },
      { phase: "Phase 4", label: "Benchmark Evaluation", description: "Conduct comparative studies on validation runs." },
      { phase: "Phase 5", label: "API Deployment", description: "Package inference API gateways via Docker/Uvicorn." }
    ]);

    setSuggestedQuestions([
      "What is the main methodology of this paper?",
      "Explain the key contributions.",
      "What are the major limitations and weaknesses?",
      "Generate suggestions for future research work."
    ]);
  };

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem("researchmind:last-paper");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id || parsed.summary)) {
          loadPaperIntoState(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cached paper:", e);
    }
  }, []);

  // Handle real PDF upload and parallel analytics generation
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setExportLinks(null);
    setChatMessages([]);
    
    try {
      setLoadingStep("1. Ingesting PDF & Extracting Layout...");
      const parsed: any = await uploadPaper(file);
      setActivePaper(parsed);

      setLoadingStep("2. Generating AI Semantic Summaries...");
      const summaryRes = await api.post("/summarize-paper", parsed);
      setSummary(summaryRes.data.tldr);
      setContributions(summaryRes.data.key_contributions || []);

      setLoadingStep("3. Conducting Critical Review...");
      const critiqueRes = await api.post("/critique-paper", parsed);
      setStrengths(critiqueRes.data.strengths || []);
      setWeaknesses(critiqueRes.data.weaknesses || []);
      
      const resScores = critiqueRes.data.research_scores || {
        novelty: 8.0,
        clarity: 7.5,
        technical_quality: 8.2,
        reproducibility: 7.0,
        dataset_quality: 7.8,
        innovation: 8.0,
        overall_score: 7.8
      };
      setScores(resScores);

      setLoadingStep("4. Building RAG Semantics...");
      // Combine text to index for Q&A
      let fullText = "";
      if (parsed.sections) {
        fullText = Object.values(parsed.sections).join("\n");
      } else {
        fullText = parsed.extracted_text || parsed.abstract || "";
      }
      await api.post("/index-paper", parsed);

      // Parse Metrics
      const totalWords = parsed.word_count || fullText.split(/\s+/).filter(Boolean).length || 5000;

      setLoadingStep("5. Mapping Knowledge Graph Preview...");
      try {
        const graphRes = await generateKnowledgeGraph(parsed);
        if (graphRes && graphRes.nodes) {
          setGraphData({
            nodes: graphRes.nodes.slice(0, 15),
            edges: graphRes.edges.slice(0, 15)
          });
        }
      } catch (err) {
        console.error("Knowledge Graph generation failed", err);
      }

      setLoadingStep("6. Calculating Multi-Modal & Topic Analytics...");
      // Extract topics & future work
      try {
        const fwRes = await generateFutureWork(fullText);
        setFutureWork(fwRes.future_work_suggestions || ["Investigate large scale deployments."]);
      } catch (err) {
        console.error("Future work generator failed", err);
      }

      // Infer domains, stack, and classification dynamically
      const textLower = fullText.toLowerCase();
      let domain = "Applied Artificial Intelligence";
      let category = "Artificial Intelligence";
      let subcategory = "General Machine Learning";
      let stack = "FastAPI, PyTorch, Transformers";
      
      if (textLower.includes("crypto") || textLower.includes("decentralized") || textLower.includes("blockchain")) {
        domain = "Cryptocurrency Order Flow Analytics";
        category = "FinTech";
        subcategory = "Decentralized Liquidity Intelligence";
        stack = "FastAPI, Next.js, SQLite, WebSockets";
      } else if (textLower.includes("transformer") || textLower.includes("attention")) {
        domain = "Deep Learning Language Architectures";
        category = "NLP";
        subcategory = "Attention-Based Models";
        stack = "PyTorch, Transformers, Sentence-Transformers";
      } else if (textLower.includes("image") || textLower.includes("cnn") || textLower.includes("ocr")) {
        domain = "Computer Vision & Multimodal Extraction";
        category = "Computer Vision";
        subcategory = "Multimodal OCR Analysis";
        stack = "EasyOCR, OpenCV, PyMuPDF";
      }

      setInsights({
        noveltyLevel: resScores.novelty > 8.5 ? "Very High" : "High",
        domain,
        techStack: stack,
        complexity: totalWords > 10000 ? "Advanced" : "Intermediate",
        industryRelevance: resScores.innovation > 8.5 ? "Very High" : "High"
      });

      setClassification({
        category,
        subcategory,
        complexity: totalWords > 10000 ? "Advanced" : "Intermediate",
        researchType: textLower.includes("prototype") || textLower.includes("platform") || textLower.includes("system") ? "Applied Research" : "Theoretical Research",
        industryDomain: category === "FinTech" ? "Financial Technology" : "Advanced AI Infrastructure"
      });

      const readingTime = Math.max(3, Math.round(totalWords / 220));
      const pageCount = parsed.pdf_metadata?.pages || Math.max(1, Math.round(totalWords / 450));
      const sectionCount = parsed.sections ? Object.keys(parsed.sections).length : 5;
      const tableCount = parsed.tables ? parsed.tables.length : 2;
      const figureCount = parsed.images ? parsed.images.length : 3;

      setMetrics({
        pages: pageCount,
        sections: sectionCount,
        tables: tableCount,
        figures: figureCount,
        references: parsed.references_sample ? parsed.references_sample.length : 15,
        words: totalWords,
        readingTime
      });

      setMultimodal({
        figures: figureCount,
        tables: tableCount,
        charts: Math.max(1, Math.round(figureCount / 2)),
        topics: parsed.keywords || ["Deep Learning", "Applied AI", "Technical Evaluation"]
      });

      // Suggestions timeline
      setTimeline([
        { phase: "Phase 1", label: "System Design", description: "Design order interfaces and WebSocket ingestion layers." },
        { phase: "Phase 2", label: "Model Pretraining", description: "Validate sequence transduction baselines." },
        { phase: "Phase 3", label: "Multimodal OCR Integration", description: "Extract chart and orders layout templates." },
        { phase: "Phase 4", label: "Benchmark Evaluation", description: "Conduct comparative studies on validation runs." },
        { phase: "Phase 5", label: "API Deployment", description: "Package inference API gateways via Docker/Uvicorn." }
      ]);

      setSuggestedQuestions([
        "What is the main methodology of this paper?",
        "Explain the key contributions.",
        "What are the major limitations and weaknesses?",
        "Generate suggestions for future research work."
      ]);

      // Cache paper data in session storage for graph page
      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(parsed));

    } catch (err) {
      console.error(err);
      alert("Error parsing paper. Verify the backend FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Load static demo paper (matches user description)
  const handleLoadDemo = () => {
    setLoading(true);
    setLoadingStep("Loading CryptoPulse Demo Workspace...");
    setExportLinks(null);
    setChatMessages([]);
    
    setTimeout(() => {
      const mockPaper = {
        title: "CryptoPulse: Real-Time Decentralized Exchange Liquidity & Order Flow Analytics Platform",
        authors: ["Deva Prasad", "Alex Chen", "Sarah Jenkins"],
        abstract: "This paper proposes CryptoPulse, a state-of-the-art applied FinTech system that utilizes a FastAPI backend, SQLite database, and Next.js frontend to monitor decentralized exchange (DEX) liquidity pools.",
        sections: {
          abstract: "...",
          introduction: "...",
          methodology: "..."
        }
      };
      
      setActivePaper(mockPaper);
      setSummary("CryptoPulse introduces an enterprise order-flow monitoring system for DEX networks. By scraping WebSocket transaction events from Uniswap V3 smart contracts in real-time, the platform reconstructs high-fidelity order books. It runs lightweight convolutional layers locally to forecast price slippage and liquidity exhaustion events up to 10 seconds in advance.");
      
      setContributions([
        "WebSocket order-book reconstruction framework for decentralized Uniswap V3 liquidity contracts.",
        "Convolutional price slippage predictor reaching 94% accuracy under high-volatility events.",
        "Highly optimized FastAPI orders cache using localized SQLite indexing and fast in-memory query processing."
      ]);

      setStrengths([
        { point: "Real-time websocket telemetry", explanation: "Low-latency scraping mitigates stale index telemetry." },
        { point: "Solid accuracy benchmarks", explanation: "94% slippage model accuracy outperforms vanilla models by 12%." }
      ]);

      setWeaknesses([
        { point: "Uniswap-specific assumptions", explanation: "Methodology relies heavily on concentrated liquidity patterns." },
        { point: "No cross-dex correlation", explanation: "Ignores arbitrage flows from Sushiswap, Balancer, or Curve." }
      ]);

      setScores({
        novelty: 8.5,
        clarity: 7.9,
        technical_quality: 8.8, // maps to Technical Depth 8.8
        reproducibility: 7.2,
        dataset_quality: 8.0,
        innovation: 8.6,
        overall_score: 8.2
      } as any);

      setInsights({
        noveltyLevel: "High",
        domain: "FinTech / Cryptocurrency Analytics",
        techStack: "FastAPI, Next.js, SQLite, WebSockets",
        complexity: "Advanced",
        industryRelevance: "Very High"
      });

      setFutureWork([
        "Add Deep Learning Forecasting",
        "Add Sentiment Analysis",
        "Add Multi-Exchange Support",
        "Add Portfolio Intelligence",
        "Add Reinforcement Learning"
      ]);

      setClassification({
        category: "FinTech",
        subcategory: "Cryptocurrency Intelligence",
        complexity: "Advanced",
        researchType: "Applied Research",
        industryDomain: "Financial Technology"
      });

      setMetrics({
        pages: 52,
        sections: 9,
        tables: 12,
        figures: 8,
        references: 34,
        words: 18200,
        readingTime: 24
      });

      setMultimodal({
        figures: 8,
        tables: 12,
        charts: 5,
        topics: ["Market Trends", "Volume Analytics", "Price Prediction", "DEX Liquidity"]
      });

      setGraphData({
        nodes: [
          { id: "CryptoPulse", label: "PAPER" },
          { id: "FastAPI", label: "MODEL" },
          { id: "WebSockets", label: "METHOD" },
          { id: "SQLite", label: "DATASET" },
          { id: "Uniswap V3", label: "DOMAIN" },
          { id: "Slippage Prediction", label: "CONCEPT" }
        ],
        edges: [
          { source: "CryptoPulse", target: "FastAPI", relation: "built_with" },
          { source: "CryptoPulse", target: "WebSockets", relation: "ingests_via" },
          { source: "CryptoPulse", target: "SQLite", relation: "stores_in" },
          { source: "CryptoPulse", target: "Uniswap V3", relation: "targets" },
          { source: "CryptoPulse", target: "Slippage Prediction", relation: "optimizes" }
        ]
      });

      setTimeline([
        { phase: "Month 1", label: "Idea / Conceptualization", description: "Designconcentrated liquidity ordered telemetry graphs." },
        { phase: "Month 2", label: "Architecture Formulation", description: "Architect FastAPI websocket pools and SQLite indexes." },
        { phase: "Month 3", label: "Development & Training", description: "Build model training modules and orders parser loops." },
        { phase: "Month 4", label: "Testing & Validation", description: "Evaluate slippage accuracy using historic Uniswap datasets." },
        { phase: "Month 5", label: "Deployment", description: "Host Docker Gateway containers reload routing configurations." }
      ]);

      setSuggestedQuestions([
        "What is the main methodology?",
        "What are the limitations?",
        "How scalable is this system?",
        "What future work is suggested?"
      ]);

      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(mockPaper));
      setLoading(false);
    }, 1200);
  };

  // Generate and fetch download reports
  const triggerExport = async () => {
    if (!activePaper) return;
    setExportLoading(true);
    try {
      const summaryText = summary;
      const critiqueText = `Strengths:\n${strengths.map(s=>`* ${s.point}: ${s.explanation}`).join("\n")}\n\nWeaknesses:\n${weaknesses.map(w=>`* ${w.point}: ${w.explanation}`).join("\n")}`;
      const res = await exportReports(activePaper.title, summaryText, critiqueText);
      setExportLinks(res.reports);
    } catch (err) {
      console.error(err);
      alert("Export failed. Make sure the backend server is running.");
    } finally {
      setExportLoading(false);
    }
  };

  // Chat copilot request
  const handleChatSubmit = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { role: "user", content: query };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const payload: any = { question: query };
      if (activePaper && activePaper.id) {
        payload.paper_id = activePaper.id;
      }
      const res = await api.post("/ask-paper", payload);
      const botMsg = { role: "assistant", content: res.data.answer || "Answer could not be generated." };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI chat service." }]);
    } finally {
      setChatLoading(false);
    }
  };


  return (
    <div className="space-y-8 font-sans selection:bg-indigo-500/30 text-white relative">
      
      {/* Intelligence Mode Tabs */}
      <div className="flex border-b border-zinc-900 pb-2">
        <button
          onClick={() => setIntelligenceMode("single")}
          className={`px-6 py-3 font-extrabold text-sm transition-all border-b-2 cursor-pointer ${
            intelligenceMode === "single"
              ? "text-indigo-400 border-indigo-500 font-black"
              : "text-zinc-550 border-transparent hover:text-zinc-350"
          }`}
        >
          📄 Single-Paper Analytics
        </button>
        <button
          onClick={() => setIntelligenceMode("literature")}
          className={`px-6 py-3 font-extrabold text-sm transition-all border-b-2 cursor-pointer ${
            intelligenceMode === "literature"
              ? "text-indigo-400 border-indigo-500 font-black"
              : "text-zinc-550 border-transparent hover:text-zinc-350"
          }`}
        >
          📚 Multi-Paper Literature Review
        </button>
        <button
          onClick={() => setIntelligenceMode("memory")}
          className={`px-6 py-3 font-extrabold text-sm transition-all border-b-2 cursor-pointer ${
            intelligenceMode === "memory"
              ? "text-indigo-400 border-indigo-500 font-black"
              : "text-zinc-550 border-transparent hover:text-zinc-350"
          }`}
        >
          🧠 Long-Term Research Memory
        </button>
        <button
          onClick={() => setIntelligenceMode("advisor")}
          className={`px-6 py-3 font-extrabold text-sm transition-all border-b-2 cursor-pointer ${
            intelligenceMode === "advisor"
              ? "text-indigo-400 border-indigo-500 font-black"
              : "text-zinc-550 border-transparent hover:text-zinc-350"
          }`}
        >
          🎓 Autonomous Research Advisor
        </button>
      </div>

      {intelligenceMode === "literature" ? (
        <LiteratureIntelligence />
      ) : intelligenceMode === "memory" ? (
        <ResearchMemory />
      ) : intelligenceMode === "advisor" ? (
        <ResearchAdvisor />
      ) : (
        <>
          {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50 animate-fade-in">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ResearchMind AI Intellect Engine
          </h3>
          <p className="text-sm text-zinc-400 tracking-wide animate-pulse">
            {loadingStep}
          </p>
        </div>
      )}

      {/* Floating Chat Copilot Toggle */}
      {activePaper && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="fixed bottom-8 right-8 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center gap-2 font-bold cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
          </svg>
          Ask Copilot
        </button>
      )}

      {/* Chat Copilot Sidebar Panel */}
      {chatOpen && (
        <aside className="fixed right-0 top-0 bottom-0 w-[420px] bg-zinc-950/95 border-l border-zinc-800 shadow-2xl z-50 flex flex-col p-6 animate-fade-in backdrop-blur-md">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h4 className="font-extrabold text-white text-md tracking-tight">AI Research Copilot</h4>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">RAG-Indexed Session</span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-zinc-400 hover:text-white p-1 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatMessages.length === 0 && (
              <div className="text-zinc-500 text-sm space-y-3 mt-6">
                <p>Welcome! Ask anything about <b>{activePaper?.title || "your paper"}</b>.</p>
                <div className="space-y-2 mt-4">
                  <p className="text-xs uppercase tracking-wider font-bold text-zinc-650">Suggested Prompts:</p>
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
                className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white ms-auto font-medium"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 mr-auto"
                }`}
              >
                {m.content}
              </div>
            ))}

            {chatLoading && (
              <div className="bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-2xl text-xs text-zinc-400 w-[100px] flex gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="pt-4 border-t border-zinc-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask ResearchMind..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500/40 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChatSubmit();
              }}
            />
            <button
              onClick={() => handleChatSubmit()}
              className="bg-white hover:bg-zinc-200 text-black px-4 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Ask
            </button>
          </div>
        </aside>
      )}

      {/* Upload and Hero Panel */}
      <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid md:grid-cols-[1fr_360px] gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Command Center v1.0.0
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ingest & Analyze Research Literature
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Upload standard academic PDF publications to extract multi-modal order flows, map entity relationships, generate critiques, predictions, and download export packets.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="hidden"
                id="dashboard-pdf-input"
              />
              <label
                htmlFor="dashboard-pdf-input"
                className="px-6 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                {file ? file.name : "Select PDF Document"}
              </label>
              <button
                onClick={handleUpload}
                disabled={!file}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition cursor-pointer"
              >
                Analyze Publication
              </button>
              <button
                onClick={handleLoadDemo}
                className="px-6 py-3 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Load Demo Workspace
              </button>
            </div>
          </div>
          
          {/* Quick status widget */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Active Workspace</h4>
            {activePaper ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-12h7.5M20.25 9h-7.5M20.25 12h-7.5M20.25 15h-7.5M20.25 18h-7.5M3 19.5V4.5A2.25 2.25 0 0 1 5.25 2.25h13.5A2.25 2.25 0 0 1 21 4.5v15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 19.5Z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold truncate max-w-[240px] text-zinc-200">{activePaper.title}</h5>
                    <span className="text-[9px] text-zinc-500 block truncate">{activePaper.authors?.join(", ") || "Unknown authors"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-400">
                  <span>Status: <b className="text-emerald-400">Indexed</b></span>
                  <span>Words: {metrics?.words.toLocaleString() || "0"}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs">
                No active document loaded. Ingest a paper to view command analytics.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Dashboard Content */}
      {activePaper && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* LEFT SIDEBAR / METRICS PANELS (COL 4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Feature 7: Quality Badges */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Research Quality Badges</h3>
              {scores && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-emerald-500/20 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏆</span>
                      <div>
                        <span className="text-xs font-bold block text-zinc-200 group-hover:text-emerald-400 transition">Excellent Novelty</span>
                        <span className="text-[10px] text-zinc-500">Breakthrough index indicators</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">{scores.novelty.toFixed(1)}/10</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-indigo-500/20 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚀</span>
                      <div>
                        <span className="text-xs font-bold block text-zinc-200 group-hover:text-indigo-400 transition">Strong Innovation</span>
                        <span className="text-[10px] text-zinc-500">Methodological development score</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-300 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">{scores.innovation.toFixed(1)}/10</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl hover:border-purple-500/20 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📊</span>
                      <div>
                        <span className="text-xs font-bold block text-zinc-200 group-hover:text-purple-400 transition">High Technical Depth</span>
                        <span className="text-[10px] text-zinc-500">Algorithmic complexity evaluation</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-300 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-full">{scores.technical_quality.toFixed(1)}/10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 1: Research Insights Panel */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Research Insights</h3>
              {insights && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Novelty Level</span>
                    <span className="font-bold text-emerald-400">{insights.noveltyLevel}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Research Domain</span>
                    <span className="font-bold text-zinc-200 truncate max-w-[200px]">{insights.domain}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Technology Stack</span>
                    <span className="font-bold text-zinc-300 truncate max-w-[200px]">{insights.techStack}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Complexity</span>
                    <span className="font-bold text-indigo-400">{insights.complexity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Industry Relevance</span>
                    <span className="font-bold text-purple-400">{insights.industryRelevance}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 5: Paper Classification Panel */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Research Classification</h3>
              {classification && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Category</span>
                    <span className="font-bold text-zinc-200">{classification.category}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Subcategory</span>
                    <span className="font-bold text-zinc-300 truncate max-w-[200px]">{classification.subcategory}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Complexity Level</span>
                    <span className="font-bold text-indigo-400">{classification.complexity}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500 font-semibold">Research Type</span>
                    <span className="font-bold text-emerald-400">{classification.researchType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Industry Domain</span>
                    <span className="font-bold text-purple-400">{classification.industryDomain}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 10: Project Metrics Panel */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Project Intelligence</h3>
              {metrics && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                    <span className="text-xl font-black text-white">{metrics.pages}</span>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Pages</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                    <span className="text-xl font-black text-white">{metrics.sections}</span>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Sections</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                    <span className="text-xl font-black text-white">{metrics.tables}</span>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Tables</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                    <span className="text-xl font-black text-white">{metrics.figures}</span>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Figures</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl col-span-2 flex justify-between items-center px-4">
                    <div className="text-left">
                      <span className="text-sm font-black text-white">{metrics.readingTime} Mins</span>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Est. Reading Time</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-zinc-300">{metrics.references} Source{metrics.references === 1 ? "" : "s"}</span>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">References</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 9: Export Center */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Export Center</h3>
              <p className="text-[11px] text-zinc-500">Compile summary and critiques into downloadable document formats.</p>
              
              {!exportLinks ? (
                <button
                  onClick={triggerExport}
                  disabled={exportLoading}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer"
                >
                  {exportLoading ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      Compiling reports...
                    </>
                  ) : (
                    "Compile Export Packet"
                  )}
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`http://127.0.0.1:8000${exportLinks.pdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-rose-500/10 border border-rose-500/25 hover:border-rose-500/50 text-rose-400 rounded-xl text-center text-xs font-bold transition block"
                  >
                    PDF
                  </a>
                  <a
                    href={`http://127.0.0.1:8000${exportLinks.docx}`}
                    className="p-3 bg-indigo-500/10 border border-indigo-500/25 hover:border-indigo-500/50 text-indigo-400 rounded-xl text-center text-xs font-bold transition block"
                  >
                    DOCX
                  </a>
                  <a
                    href={`http://127.0.0.1:8000${exportLinks.pptx}`}
                    className="p-3 bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 text-amber-400 rounded-xl text-center text-xs font-bold transition block"
                  >
                    PPTX
                  </a>
                </div>
              )}
            </div>
            
          </div>

          {/* MAIN GRAPHICS & CONTENT AREA (COL 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">AI Executive Summary</h3>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 border border-zinc-800 rounded-2xl">
                  {summary}
                </p>
              </div>

              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Key Contributions</h3>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {contributions.map((c, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="text-indigo-400 mt-0.5 font-black">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3: Visual Analytics Dashboard */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Analytics Dashboard</h3>
                <p className="text-[11px] text-zinc-550 mt-0.5">Visual multidimensional quality index scoring.</p>
              </div>

              <div className="grid md:grid-cols-[280px_1fr] gap-6 items-center">
                {/* Recharts Radar chart */}
                {scores && (
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: "Novelty", score: scores.novelty },
                        { subject: "Clarity", score: scores.clarity },
                        { subject: "Technical", score: scores.technical_quality },
                        { subject: "Dataset", score: scores.dataset_quality },
                        { subject: "Innovation", score: scores.innovation },
                        { subject: "Reproduce", score: scores.reproducibility },
                      ]}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#3f3f46", fontSize: 8 }} stroke="#27272a" />
                        <Radar name="Scoring Index" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "10px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* score distribution & progress */}
                {scores && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                        <span className="font-bold">Innovation Index</span>
                        <span className="font-black text-indigo-400">{scores.innovation.toFixed(1)}/10</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${scores.innovation * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                        <span className="font-bold">Technical Depth</span>
                        <span className="font-black text-purple-400">{scores.technical_quality.toFixed(1)}/10</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${scores.technical_quality * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                        <span className="font-bold">Dataset Quality</span>
                        <span className="font-black text-emerald-400">{scores.dataset_quality.toFixed(1)}/10</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${scores.dataset_quality * 10}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature 4: Knowledge Graph Preview */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Semantic Knowledge Graph</h3>
                  <p className="text-[11px] text-zinc-550 mt-0.5">Interact with entities and conceptual relations dynamically.</p>
                </div>
                <Link
                  href="/knowledge-graph"
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5"
                >
                  Expand Canvas
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </Link>
              </div>

              {graphData ? (
                <MiniKnowledgeGraph nodes={graphData.nodes} edges={graphData.edges} />
              ) : (
                <div className="h-[280px] bg-zinc-950/80 rounded-xl flex items-center justify-center text-xs text-zinc-500 border border-zinc-800/80">
                  Semantic graph nodes not extracted. Generate analysis to view topologies.
                </div>
              )}
            </div>

            {/* Feature 6: Multimodal OCR & Visual Analysis */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Visual & Layout Analysis</h3>
              {multimodal && (
                <div className="grid md:grid-cols-[160px_1fr] gap-6">
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">Figures Found</span>
                      <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{multimodal.figures}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">Tables Found</span>
                      <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{multimodal.tables}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">Charts Found</span>
                      <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">{multimodal.charts}</span>
                    </div>
                  </div>
                  
                  <div className="border-l border-zinc-900 pl-6 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Detected Topics & Structures</span>
                    <div className="flex flex-wrap gap-2">
                      {multimodal.topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-zinc-950/75 border border-zinc-850 rounded-lg text-[10px] font-semibold text-indigo-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Future Work suggestions */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">AI Future Research Suggestions</h3>
              <ul className="space-y-3 text-xs">
                {futureWork.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl group hover:border-indigo-500/25 transition">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 font-black text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-zinc-300 font-medium group-hover:text-zinc-200 transition">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 12: Research Timeline */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 space-y-6">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Execution & Timeline Blueprint</h3>
              {timeline.length > 0 && (
                <div className="relative pl-4 border-l border-zinc-800 space-y-6">
                  {timeline.map((t, i) => (
                    <div key={i} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-black group-hover:scale-125 transition-transform duration-300" />
                      
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{t.phase} — {t.label}</span>
                        <p className="text-xs text-zinc-400 mt-1 font-semibold leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
        </>
      )}
    </div>
  );
}
