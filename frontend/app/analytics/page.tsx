"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import ScoreRadar from "@/components/analytics/ScoreRadar";
import PerformanceChart from "@/components/analytics/PerformanceChart";
import ComparisonTable from "@/components/analytics/ComparisonTable";
import ResearchInsights from "@/components/analytics/ResearchInsights";
import AppLayout from "@/components/layout/AppLayout";

export default function AnalyticsPage() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  
  const [paperA, setPaperA] = useState<any>(null);
  const [paperB, setPaperB] = useState<any>(null);
  
  const [scoresA, setScoresA] = useState<any>(null);
  const [scoresB, setScoresB] = useState<any>(null);
  
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [uploadingB, setUploadingB] = useState(false);

  const handleUploadA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFileA(file);
    setUploadingA(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await api.post("/upload-paper", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPaperA(uploadRes.data);
      
      const critiqueRes = await api.post("/critique-paper", uploadRes.data);
      setScoresA(critiqueRes.data.research_scores);
    } catch (error) {
      console.error("Error uploading Paper A", error);
    } finally {
      setUploadingA(false);
    }
  };

  const handleUploadB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFileB(file);
    setUploadingB(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await api.post("/upload-paper", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPaperB(uploadRes.data);
      
      const critiqueRes = await api.post("/critique-paper", uploadRes.data);
      setScoresB(critiqueRes.data.research_scores);
    } catch (error) {
      console.error("Error uploading Paper B", error);
    } finally {
      setUploadingB(false);
    }
  };

  const runComparison = async () => {
    if (!paperA || !paperB) return;
    setLoading(true);
    try {
      const compareRes = await api.post("/compare-papers", {
        paper_a: paperA,
        paper_b: paperB
      });
      setComparison(compareRes.data);
    } catch (error) {
      console.error("Error generating comparison analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = async () => {
    setLoading(true);
    try {
      const paperAData = {
        filename: "attention_is_all_you_need.pdf",
        title: "Attention Is All You Need",
        authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
        sections: {
          abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. The model achieves 93.8% accuracy on WMT English-to-German.",
          introduction: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. Recurrent models factor computation along the symbol positions of input and output sequences. This inherent sequential nature precludes parallelization within training examples.",
          methodology: "The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence."
        }
      };

      const paperBData = {
        filename: "bert.pdf",
        title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
        sections: {
          abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. BERT achieves 95.4% accuracy on GLUE benchmarks.",
          introduction: "Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, and token-level tasks such as named entity recognition and question answering. There are two existing strategies for applying pre-trained language representations to downstream tasks: feature-based and fine-tuning.",
          methodology: "We introduce BERT and its detailed implementation in this section. There are two steps in our framework: pre-training and fine-tuning. During pre-training, the model is trained on unlabeled data over different pre-training tasks. For fine-tuning, the BERT model is first initialized with the pre-trained parameters, and all of the parameters are fine-tuned using labeled data from the downstream tasks."
        }
      };

      setPaperA(paperAData);
      setPaperB(paperBData);
      
      const scoresAData = {
        novelty: 9.5,
        clarity: 8.8,
        technical_depth: 9.2,
        innovation: 9.6,
        reproducibility: 8.5,
        dataset_quality: 8.0
      };
      
      const scoresBData = {
        novelty: 9.0,
        clarity: 8.5,
        technical_depth: 9.0,
        innovation: 9.2,
        reproducibility: 8.8,
        dataset_quality: 8.5
      };
      
      setScoresA(scoresAData);
      setScoresB(scoresBData);

      const compareRes = await api.post("/compare-papers", {
        paper_a: paperAData,
        paper_b: paperBData
      });
      setComparison(compareRes.data);
    } catch (error) {
      console.error("Error loading demo comparison", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    setFileA(null);
    setFileB(null);
    setPaperA(null);
    setPaperB(null);
    setScoresA(null);
    setScoresB(null);
    setComparison(null);
  };

  return (
    <AppLayout activeSection="analytics">
      <div className="space-y-8 animate-fade-in font-sans">
        {/* Navigation Breadcrumb - Action buttons */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Research Decision Intelligence
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Side-by-side comparative analytics of methodology, datasets, and performance benchmarks.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadDemo}
              className="bg-indigo-650 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-650/15"
            >
              Load Demo Comparison
            </button>
            {(paperA || paperB) && (
              <button
                onClick={clearSession}
                className="border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 text-zinc-350 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Upload Panels */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Paper A Panel */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 relative hover:border-indigo-500/20 transition duration-300">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Document A
            </div>
            <h3 className="text-md font-extrabold text-white mb-1">Primary Paper</h3>
            <p className="text-zinc-550 text-xs mb-4">Upload research paper A to analyze and compare</p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadA}
              className="hidden"
              id="file-upload-a"
              disabled={uploadingA}
            />
            <label
              htmlFor="file-upload-a"
              className={`flex flex-col items-center justify-center border-2 border-dashed border-zinc-850 hover:border-indigo-500/30 rounded-xl p-8 cursor-pointer hover:bg-indigo-950/5 transition duration-300 ${uploadingA ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploadingA ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-400 font-medium animate-pulse">Analyzing Paper A...</span>
                </div>
              ) : paperA ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="text-xs text-zinc-300 font-bold block truncate max-w-[250px]">{paperA.title || fileA?.name || "Paper A Loaded"}</span>
                  <span className="text-[10px] text-zinc-550 mt-1 block">Click to replace file</span>
                </div>
              ) : (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-650 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-xs text-zinc-450 font-semibold block">Select PDF Document</span>
                  <span className="text-[10px] text-zinc-600 mt-1 block">Supports standard academic PDFs</span>
                </div>
              )}
            </label>
          </div>

          {/* Paper B Panel */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 relative hover:border-pink-500/20 transition duration-300">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
              Document B
            </div>
            <h3 className="text-md font-extrabold text-white mb-1">Secondary Paper</h3>
            <p className="text-zinc-555 text-xs mb-4">Upload research paper B to analyze and compare</p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadB}
              className="hidden"
              id="file-upload-b"
              disabled={uploadingB}
            />
            <label
              htmlFor="file-upload-b"
              className={`flex flex-col items-center justify-center border-2 border-dashed border-zinc-850 hover:border-pink-500/30 rounded-xl p-8 cursor-pointer hover:bg-pink-950/5 transition duration-300 ${uploadingB ? "opacity-50 pointer-events-none" : ""}`}
            >
              {uploadingB ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-400 font-medium animate-pulse">Analyzing Paper B...</span>
                </div>
              ) : paperB ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-400 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="text-xs text-zinc-300 font-bold block truncate max-w-[250px]">{paperB.title || fileB?.name || "Paper B Loaded"}</span>
                  <span className="text-[10px] text-zinc-550 mt-1 block">Click to replace file</span>
                </div>
              ) : (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-655 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-xs text-zinc-455 font-semibold block">Select PDF Document</span>
                  <span className="text-[10px] text-zinc-600 mt-1 block">Supports standard academic PDFs</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Analyze trigger button */}
        {paperA && paperB && !comparison && (
          <div className="flex justify-center py-4">
            <button
              onClick={runComparison}
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black px-8 py-3.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xl hover:-translate-y-0.5"
            >
              {loading ? "Calculating comparative matrices..." : "Generate Comparative Analysis"}
            </button>
          </div>
        )}

        {/* Main Dashboard section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 border border-zinc-900/50 bg-zinc-900/10 rounded-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-lg font-bold text-zinc-300 animate-pulse">Generating decision intelligence insights...</h3>
            <p className="text-xs text-zinc-500">Extracting methodologies, computing quality ratings, and mapping performance datasets</p>
          </div>
        ) : (
          comparison && (
            <div className="space-y-8 animate-fade-in">
              {/* Visualizations grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScoreRadar
                  scoresA={scoresA}
                  scoresB={scoresB}
                  titleA={paperA?.title ? (paperA.title.length > 25 ? paperA.title.substring(0, 25) + "..." : paperA.title) : "Paper A"}
                  titleB={paperB?.title ? (paperB.title.length > 25 ? paperB.title.substring(0, 25) + "..." : paperB.title) : "Paper B"}
                />
                
                <PerformanceChart
                  metricsA={comparison?.performance?.paper_a_metrics}
                  metricsB={comparison?.performance?.paper_b_metrics}
                  titleA={paperA?.title ? (paperA.title.length > 25 ? paperA.title.substring(0, 25) + "..." : paperA.title) : "Paper A"}
                  titleB={paperB?.title ? (paperB.title.length > 25 ? paperB.title.substring(0, 25) + "..." : paperB.title) : "Paper B"}
                />
              </div>

              {/* Research Insights Synthesis */}
              <ResearchInsights
                titleA={paperA?.title || "Paper A"}
                titleB={paperB?.title || "Paper B"}
                comparisonResult={comparison}
                scoresA={scoresA}
                scoresB={scoresB}
              />

              {/* Technical Comparison Table */}
              <ComparisonTable
                titleA={paperA?.title || "Paper A"}
                titleB={paperB?.title || "Paper B"}
                comparisonResult={comparison}
              />
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
