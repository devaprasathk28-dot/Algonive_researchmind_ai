"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export interface SimilarPaperObj {
  title: string;
  authors?: string[];
  abstract?: string;
  pdf_url?: string;
  arxiv_url?: string;
  score?: number;
  reason?: string[];
  related_models?: string[];
  related_datasets?: string[];
}

interface RecommendationPanelProps {
  recommendations: {
    datasets: string[];
    models: string[];
    topics: string[];
    research_gaps: string[];
    similar_papers?: (string | SimilarPaperObj)[];
  };
}

export default function RecommendationPanel({
  recommendations,
}: RecommendationPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!recommendations) return null;

  const isRichPaper = (p: any): p is SimilarPaperObj => {
    return p && typeof p === "object" && "title" in p;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-800 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              AI Discovery Feed
            </p>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Hybrid Research Recommendations
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Recommended Papers Stream */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Related Research Publications
            </h3>
            
            {!recommendations.similar_papers || recommendations.similar_papers.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No recommendations calculated yet.</p>
            ) : (
              recommendations.similar_papers.map((item, index) => {
                if (!isRichPaper(item)) {
                  // Fallback for simple string lists
                  return (
                    <div
                      key={`paper-str-${index}`}
                      className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/80 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📚</span>
                        <span className="text-sm font-bold text-zinc-200">{item}</span>
                      </div>
                    </div>
                  );
                }

                // Rich structured paper display
                const matchPct = item.score ? Math.round(item.score * 100) : 75;
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={`paper-rich-${index}`}
                    className="bg-zinc-900/20 rounded-2xl p-5 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900/40 transition duration-300 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base leading-snug hover:text-indigo-400 transition cursor-pointer">
                          {item.title}
                        </h4>
                        {item.authors && item.authors.length > 0 && (
                          <p className="text-xs text-zinc-400 font-medium">
                            By {item.authors.join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Score Badge */}
                      <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-black text-indigo-400">
                        {matchPct}% Match
                      </span>
                    </div>

                    {/* Explanations Badges */}
                    {item.reason && item.reason.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {item.reason.map((reasonStr) => (
                          <span
                            key={reasonStr}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400"
                          >
                            💡 {reasonStr}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expandable Abstract */}
                    {item.abstract && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                          className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition"
                        >
                          {isExpanded ? "Hide abstract ▲" : "View abstract ▼"}
                        </button>
                        {isExpanded && (
                          <p className="mt-2 text-xs leading-relaxed text-zinc-400 bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/50">
                            {item.abstract}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Related Models & Datasets in Recommendation Card */}
                    {((item.related_models && item.related_models.length > 0) ||
                      (item.related_datasets && item.related_datasets.length > 0)) && (
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-800/50 pt-3.5">
                        {item.related_models && item.related_models.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              Related Models
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.related_models.map((m) => (
                                <span
                                  key={m}
                                  className="inline-flex rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.related_datasets && item.related_datasets.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              Related Datasets
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.related_datasets.map((d) => (
                                <span
                                  key={d}
                                  className="inline-flex rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Links */}
                    {(item.pdf_url || item.arxiv_url) && (
                      <div className="mt-4 flex gap-3 border-t border-zinc-800/40 pt-3">
                        {item.pdf_url && (
                          <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center gap-1"
                          >
                            📄 Open PDF
                          </a>
                        )}
                        {item.arxiv_url && (
                          <a
                            href={item.arxiv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                          >
                            🔗 arXiv Page
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar suggestions (Models, Datasets, Gaps) */}
          <div className="space-y-6">
            {/* Suggested Datasets */}
            {recommendations.datasets && recommendations.datasets.length > 0 && (
              <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800">
                <h3 className="font-bold text-emerald-400 text-sm mb-3 flex items-center gap-1.5">
                  <span>📊</span> Suggested Datasets
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {recommendations.datasets.map((d) => (
                    <span
                      key={d}
                      className="inline-flex rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 text-xs text-zinc-300"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Models */}
            {recommendations.models && recommendations.models.length > 0 && (
              <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800">
                <h3 className="font-bold text-purple-400 text-sm mb-3 flex items-center gap-1.5">
                  <span>🤖</span> Suggested Models
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {recommendations.models.map((m) => (
                    <span
                      key={m}
                      className="inline-flex rounded-lg bg-purple-500/5 border border-purple-500/20 px-2 py-1 text-xs text-zinc-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Research Gaps & Opportunities */}
            {recommendations.research_gaps && recommendations.research_gaps.length > 0 && (
              <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800">
                <h3 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-1.5">
                  <span>⚠️</span> Research Gaps
                </h3>
                <ul className="space-y-2">
                  {recommendations.research_gaps.map((gap, index) => (
                    <li key={`gap-${index}`} className="text-zinc-400 text-xs flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
