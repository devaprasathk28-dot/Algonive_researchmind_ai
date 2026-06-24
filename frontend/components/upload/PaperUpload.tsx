"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import api from "@/services/api";
import SummaryCard from "@/components/dashboard/SummaryCard";
import CritiqueCard from "@/components/dashboard/CritiqueCard";
import ScoreCard from "@/components/dashboard/ScoreCard";
import ResearchInsights from "@/components/dashboard/ResearchInsights";
import ResearchClassification from "@/components/dashboard/ResearchClassification";
import ProjectMetrics from "@/components/dashboard/ProjectMetrics";
import FutureWorkPanel from "@/components/dashboard/FutureWorkPanel";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import EmbeddedKnowledgeGraph from "@/components/dashboard/EmbeddedKnowledgeGraph";
import ExportCenter from "@/components/dashboard/ExportCenter";
import RecommendationPanel from "@/components/recommendations/RecommendationPanel";
import {
  SummaryResponse,
  CritiqueResponse,
} from "@/types/paper";

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

interface PaperUploadProps {
  onUploadSuccess?: () => void;
}

export default function PaperUpload({ onUploadSuccess }: PaperUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progressState, setProgressState] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [critique, setCritique] = useState<CritiqueResponse | null>(null);
  const [graphReady, setGraphReady] = useState(false);
  const [classification, setClassification] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [futureWork, setFutureWork] = useState<any>(null);
  const [reportLinks, setReportLinks] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [suggestedWorkspaces, setSuggestedWorkspaces] = useState<any[]>([]);
  const [assignedWorkspace, setAssignedWorkspace] = useState<string | null>(null);
  const [activePaperId, setActivePaperId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = window.sessionStorage.getItem("researchmind:last-paper");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id) {
          setActivePaperId(parsed.id);
        }
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.critique) setCritique(parsed.critique);
        if (parsed.classification) setClassification(parsed.classification);
        if (parsed.metrics) setMetrics(parsed.metrics);
        if (parsed.futureWork) setFutureWork(parsed.futureWork);
        if (parsed.recommendations) setRecommendations(parsed.recommendations);
        if (parsed.reportLinks) setReportLinks(parsed.reportLinks);
        setGraphReady(true);
      } catch (e) {
        console.error("Error loading cached paper:", e);
      }
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAssignWorkspace = async (workspaceId: number, workspaceName: string) => {
    if (!activePaperId) return;
    try {
      await api.post(`/workspaces/assign/${activePaperId}/${workspaceId}`);
      setAssignedWorkspace(workspaceName);
      
      const cached = sessionStorage.getItem("researchmind:last-paper");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.workspace_id = workspaceId;
        sessionStorage.setItem("researchmind:last-paper", JSON.stringify(parsed));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to assign workspace.");
    }
  };

  const rememberPaper = (parsedPaper: object) => {
    window.sessionStorage.setItem(
      "researchmind:last-paper",
      JSON.stringify(parsedPaper)
    );
    setGraphReady(true);
  };

  const uploadPaper = async () => {
    if (!file) return;
    setLoading(true);
    setSuggestedWorkspaces([]);
    setAssignedWorkspace(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Parsing PDF
      setProgressState("Parsing PDF publication structures...");
      setProgressPercent(20);

      let uploadUrl = "/upload-paper";
      const wsId = localStorage.getItem("workspace_id");
      if (wsId) {
        uploadUrl += `?workspace_id=${wsId}`;
      }

      const uploadResponse = await api.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const parsedPaper = uploadResponse.data;
      rememberPaper(parsedPaper);
      if (parsedPaper.id) {
        setActivePaperId(parsedPaper.id);
      }

      // 2. Generating Summary
      setProgressState("Generating AI executive summarization portfolio...");
      setProgressPercent(40);
      const summaryResponse = await api.post("/summarize-paper", parsedPaper);
      setSummary(summaryResponse.data);

      // 3. Critiquing Paper
      setProgressState("Executing multi-agent qualitative critique checks...");
      setProgressPercent(60);
      const critiqueResponse = await api.post("/critique-paper", parsedPaper);
      setCritique(critiqueResponse.data);

      // 4. Building Graph
      setProgressState("Classifying taxonomies & building metrics index...");
      setProgressPercent(80);
      const classificationResponse = await api.post("/classify-paper", parsedPaper);
      setClassification(classificationResponse.data);

      const metricsResponse = await api.post("/project-metrics", parsedPaper);
      setMetrics(metricsResponse.data);

      const futureWorkResponse = await api.post("/future-work", parsedPaper);
      setFutureWork(futureWorkResponse.data);

      // 5. Creating Report
      setProgressState("Exporting report briefings & generating recommendations...");
      setProgressPercent(95);

      const reportPayload = {
        title: parsedPaper.title || "Research Paper",
        summary: summaryResponse.data.tldr || "",
        key_contributions: parseArray(summaryResponse.data.key_contributions),
        strengths: parseArray(critiqueResponse.data.strengths),
        weaknesses: parseArray(critiqueResponse.data.weaknesses),
        research_scores: critiqueResponse.data.research_scores || {},
        future_work: futureWorkResponse.data.future_work || "",
        recommendations: futureWorkResponse.data.recommendations || []
      };

      const exportResponse = await api.post("/generate-reports", reportPayload);
      setReportLinks({
        pdf: `http://127.0.0.1:8000/${exportResponse.data.pdf}`,
        docx: `http://127.0.0.1:8000/${exportResponse.data.docx}`,
        ppt: `http://127.0.0.1:8000/${exportResponse.data.ppt}`
      });

      const recommendationsResponse = await api.post("/recommendations", parsedPaper);
      setRecommendations(recommendationsResponse.data);

      const userId = localStorage.getItem("user_id");
      if (userId && parsedPaper) {
        const suggestRes = await api.post(`/workspaces/suggest/${userId}`, parsedPaper);
        setSuggestedWorkspaces(suggestRes.data || []);
      }

      // 6. Completed
      setProgressState("Completed analysis successfully!");
      setProgressPercent(100);

      const finalState = {
        ...parsedPaper,
        summary: summaryResponse.data,
        critique: critiqueResponse.data,
        classification: classificationResponse.data,
        metrics: metricsResponse.data,
        futureWork: futureWorkResponse.data,
        recommendations: recommendationsResponse.data,
        reportLinks: {
          pdf: `http://127.0.0.1:8000/${exportResponse.data.pdf}`,
          docx: `http://127.0.0.1:8000/${exportResponse.data.docx}`,
          ppt: `http://127.0.0.1:8000/${exportResponse.data.ppt}`
        }
      };
      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(finalState));

      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      console.error(error);
      setProgressState("Failed analysis pipeline execution.");
      setProgressPercent(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const loadDemoPaper = async () => {
    setLoading(true);
    setProgressState("Simulating local demo parser...");
    setProgressPercent(30);
    const mockParsedPaper = {
      filename: "attention_is_all_you_need.pdf",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
      page_count: 15,
      images: Array(8).fill("image"),
      tables: Array(4).fill("table"),
      sections: {
        abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.",
        introduction: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. Recurrent models factor computation along the symbol positions of input and output sequences.",
        methodology: "The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder."
      }
    };
    try {
      rememberPaper(mockParsedPaper);
      setProgressPercent(60);
      const summaryResponse = await api.post("/summarize-paper", mockParsedPaper);
      setSummary(summaryResponse.data);

      const critiqueResponse = await api.post("/critique-paper", mockParsedPaper);
      setCritique(critiqueResponse.data);

      const classificationResponse = await api.post("/classify-paper", mockParsedPaper);
      setClassification(classificationResponse.data);

      const metricsResponse = await api.post("/project-metrics", mockParsedPaper);
      setMetrics(metricsResponse.data);

      const futureWorkResponse = await api.post("/future-work", mockParsedPaper);
      setFutureWork(futureWorkResponse.data);

      const reportPayload = {
        title: mockParsedPaper.title || "Research Paper",
        summary: summaryResponse.data.tldr || "",
        key_contributions: parseArray(summaryResponse.data.key_contributions),
        strengths: parseArray(critiqueResponse.data.strengths),
        weaknesses: parseArray(critiqueResponse.data.weaknesses),
        research_scores: critiqueResponse.data.research_scores || {},
        future_work: futureWorkResponse.data.future_work || "",
        recommendations: futureWorkResponse.data.recommendations || []
      };

      const exportResponse = await api.post("/generate-reports", reportPayload);
      setReportLinks({
        pdf: `http://127.0.0.1:8000/${exportResponse.data.pdf}`,
        docx: `http://127.0.0.1:8000/${exportResponse.data.docx}`,
        ppt: `http://127.0.0.1:8000/${exportResponse.data.ppt}`
      });

      const recommendationsResponse = await api.post("/recommendations", mockParsedPaper);
      setRecommendations(recommendationsResponse.data);

      setSuggestedWorkspaces([
        { workspace_id: 1, name: "AI Research Workspace", match_score: 4 },
        { workspace_id: 2, name: "Healthcare AI Workspace", match_score: 2 }
      ]);
      setProgressPercent(100);

      const finalState = {
        ...mockParsedPaper,
        summary: summaryResponse.data,
        critique: critiqueResponse.data,
        classification: classificationResponse.data,
        metrics: metricsResponse.data,
        futureWork: futureWorkResponse.data,
        recommendations: recommendationsResponse.data,
        reportLinks: {
          pdf: `http://127.0.0.1:8000/${exportResponse.data.pdf}`,
          docx: `http://127.0.0.1:8000/${exportResponse.data.docx}`,
          ppt: `http://127.0.0.1:8000/${exportResponse.data.ppt}`
        }
      };
      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(finalState));

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Drag & Drop Upload Zone */}
      <div className="bg-[#18181b] p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-sm font-extrabold mb-4 text-white uppercase tracking-wider">
          Upload Research Paper
        </h3>

        {!loading ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer select-none transition ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/5 text-indigo-400"
                : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 text-zinc-400"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-550">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div className="text-xs">
                {file ? (
                  <span className="text-zinc-200 font-bold block truncate max-w-sm">Selected File: {file.name}</span>
                ) : (
                  <>
                    <span className="text-zinc-300 font-bold">Drag & drop publication PDF here</span>
                    <span className="block text-[10px] text-zinc-550 mt-1">Or click to browse file systems (Supports PDF)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Real-time processing progress bars */
          <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-350 font-bold truncate max-w-[80%]">{progressState}</span>
              <span className="text-zinc-400 font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex gap-2.5 text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
              <span className={progressPercent >= 20 ? "text-indigo-400" : ""}>Parse</span>
              <span>➔</span>
              <span className={progressPercent >= 40 ? "text-indigo-400" : ""}>Summarize</span>
              <span>➔</span>
              <span className={progressPercent >= 60 ? "text-indigo-400" : ""}>Critique</span>
              <span>➔</span>
              <span className={progressPercent >= 80 ? "text-indigo-400" : ""}>Graph</span>
              <span>➔</span>
              <span className={progressPercent >= 95 ? "text-indigo-400" : ""}>Report</span>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-5 flex gap-3">
            <button
              onClick={uploadPaper}
              disabled={!file}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                file
                  ? "bg-indigo-650 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-650/10"
                  : "bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Analyze Paper
            </button>
            <button
              onClick={loadDemoPaper}
              className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Load Demo Paper
            </button>
            {graphReady && (
              <Link
                href="/knowledge-graph"
                className="inline-flex items-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 px-5 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Explore Knowledge Graph
              </Link>
            )}
          </div>
        )}

        {/* Suggested workspaces classification badges */}
        {suggestedWorkspaces.length > 0 && (
          <div className="mt-6 border-t border-zinc-900 pt-5 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              Smart Workspace Suggestions
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {suggestedWorkspaces.map((ws: any) => (
                <button
                  key={ws.workspace_id}
                  onClick={() => handleAssignWorkspace(ws.workspace_id, ws.name)}
                  className="px-3.5 py-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  ✓ Place in: {ws.name}
                  <span className="bg-indigo-500/20 px-1.5 py-0.5 rounded-md text-[8px] font-black text-indigo-300">
                    Match: {ws.match_score}
                  </span>
                </button>
              ))}
            </div>
            {assignedWorkspace && (
              <div className="text-[11px] text-emerald-400 font-bold mt-2 animate-pulse flex items-center gap-1.5">
                Successfully assigned paper to project workspace: {assignedWorkspace}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Breakdown & Results Panel */}
      {summary && (
        <SummaryCard summary={summary.tldr} />
      )}

      {summary && (
        <CritiqueCard title="Key Contributions" content={summary.key_contributions} />
      )}

      {critique && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <CritiqueCard title="Strengths" content={critique.strengths} />
            <CritiqueCard title="Weaknesses" content={critique.weaknesses} />
          </div>

          {/* Scores Deck */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <ScoreCard 
              title="Novelty" 
              score={critique.research_scores.novelty} 
              reason={critique.research_scores_explained?.novelty?.reason}
              confidence={critique.research_scores_explained?.novelty?.confidence}
            />
            <ScoreCard 
              title="Clarity" 
              score={critique.research_scores.clarity} 
              reason={critique.research_scores_explained?.clarity?.reason}
              confidence={critique.research_scores_explained?.clarity?.confidence}
            />
            <ScoreCard 
              title="Technical Depth" 
              score={critique.research_scores.technical_depth || critique.research_scores.technical_quality} 
              reason={critique.research_scores_explained?.technical_quality?.reason}
              confidence={critique.research_scores_explained?.technical_quality?.confidence}
            />
            <ScoreCard 
              title="Innovation" 
              score={critique.research_scores.innovation} 
              reason={critique.research_scores_explained?.innovation?.reason}
              confidence={critique.research_scores_explained?.innovation?.confidence}
            />
            <ScoreCard 
              title="Reproducibility" 
              score={critique.research_scores.reproducibility || 7.5} 
              reason={critique.research_scores_explained?.reproducibility?.reason}
              confidence={critique.research_scores_explained?.reproducibility?.confidence}
            />
            <ScoreCard 
              title="Dataset Quality" 
              score={critique.research_scores.dataset_quality || 8.0} 
              reason={critique.research_scores_explained?.dataset_quality?.reason}
              confidence={critique.research_scores_explained?.dataset_quality?.confidence}
            />
          </div>


          <ResearchInsights
            domain="Artificial Intelligence"
            researchType="Applied Research"
            complexity="Advanced"
            relevance="High"
            innovation="Strong"
          />

          {classification && (
            <ResearchClassification
              category={classification.category}
              subCategory={classification.subCategory}
              domain={classification.domain}
              applicationArea={classification.applicationArea}
              difficulty={classification.difficulty}
              keywords={classification.keywords}
              researchType={classification.researchType}
              confidence={classification.confidence}
              explanation={classification.explanation}
            />
          )}

          {metrics && (
            <ProjectMetrics
              pages={metrics.pages}
              words={metrics.words}
              sections={metrics.sections}
              figures={metrics.figures}
              tables={metrics.tables}
              references={metrics.references || 0}
              readingTime={metrics.readingTime}
              complexity={metrics.complexity}
              equations={metrics.equations}
              technicalDensity={metrics.technical_density ?? metrics.technicalDensity}
              documentIntelligence={metrics.document_intelligence ?? metrics.documentIntelligence}
              researchHealth={metrics.research_health ?? metrics.researchHealth}
              readability={metrics.readability}
              methodology={metrics.methodology}
              experimentalCoverage={metrics.experimental_coverage ?? metrics.experimentalCoverage}
              citationCoverage={metrics.citation_coverage ?? metrics.citationCoverage}
            />
          )}

          {futureWork && (
            <FutureWorkPanel
              futureWork={futureWork.future_work}
              recommendations={futureWork.recommendations}
            />
          )}

          <AnalyticsDashboard scores={critique.research_scores} />

          {metrics && (
            <EmbeddedKnowledgeGraph key={metrics.words} />
          )}

          {recommendations && (
            <RecommendationPanel recommendations={recommendations} />
          )}

          {reportLinks && (
            <ExportCenter reportLinks={reportLinks} />
          )}
        </div>
      )}
    </div>
  );
}
