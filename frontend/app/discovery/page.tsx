"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/services/api";

interface ArxivPaper {
  title: string;
  authors: string[];
  summary: string;
  published: string;
  pdf_url: string;
  arxiv_url: string;
  similarity?: number;
}

interface RecommendedPaper {
  recommended_paper: string;
  authors: string[];
  summary: string;
  published_date: string;
  similarity_score: number;
  pdf_link: string;
  is_emerging?: boolean;
}

interface FollowedTopic {
  id: number;
  topic_name: string;
}

interface FollowedAuthor {
  id: number;
  author_name: string;
}

interface DashboardData {
  trending_papers: ArxivPaper[];
  recommended_papers: RecommendedPaper[];
  research_opportunities: string[];
  suggested_datasets: string[];
  suggested_models: string[];
  user_interests: string[];
}

export default function DiscoveryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "search">("feed");
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progressState, setProgressState] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [followedTopics, setFollowedTopics] = useState<FollowedTopic[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<FollowedAuthor[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Discovery Dashboard states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const fetchDashboardData = async (uid: number | null) => {
    setLoadingDashboard(true);
    try {
      let url = "/discovery/dashboard";
      if (uid) {
        url += `?user_id=${uid}`;
      }
      const res = await api.get(url);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch discovery dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUid = localStorage.getItem("user_id");
      if (storedUid) {
        const uid = parseInt(storedUid);
        setUserId(uid);
        fetchFollowedData(uid);
        fetchDashboardData(uid);
      } else {
        fetchDashboardData(null);
      }
    }
  }, []);

  const fetchFollowedData = async (uid: number) => {
    try {
      const topicsRes = await api.get(`/discovery/followed/topics/${uid}`);
      setFollowedTopics(topicsRes.data || []);
      const authorsRes = await api.get(`/discovery/followed/authors/${uid}`);
      setFollowedAuthors(authorsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch followed preferences:", err);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await api.get(`/discovery/discover?query=${searchQuery}`);
      setPapers(response.data || []);
      setActiveTab("search");
    } catch (err) {
      console.error(err);
      alert("Error querying arXiv.");
    } finally {
      setSearching(false);
    }
  };

  const handleFollowTopic = async (topicName: string) => {
    try {
      await api.post("/discovery/follow/topic", { topic_name: topicName });
      if (userId) fetchFollowedData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollowTopic = async (topicName: string) => {
    if (!userId) return;
    try {
      await api.delete(`/discovery/unfollow/topic/${userId}/${topicName}`);
      fetchFollowedData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowAuthor = async (authorName: string) => {
    try {
      await api.post("/discovery/follow/author", { author_name: authorName });
      if (userId) fetchFollowedData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollowAuthor = async (authorName: string) => {
    if (!userId) return;
    try {
      await api.delete(`/discovery/unfollow/author/${userId}/${authorName}`);
      fetchFollowedData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportPaper = async (title: string, pdfUrl: string, summary: string, authors: string[]) => {
    setImporting(true);
    setProgressPercent(10);
    setProgressState("Downloading arXiv publication PDF...");

    const wsId = localStorage.getItem("workspace_id");

    try {
      let importUrl = "/discovery/import";
      if (wsId) {
        importUrl += `?workspace_id=${wsId}`;
      }

      const importResponse = await api.post(importUrl, {
        pdf_url: pdfUrl,
        title: title
      });

      const parsedPaper = importResponse.data;
      setProgressPercent(35);
      setProgressState("Generating AI executive summary...");

      const summaryResponse = await api.post("/summarize-paper", parsedPaper);
      setProgressPercent(55);
      setProgressState("Analyzing critique scoring portfolios...");

      const critiqueResponse = await api.post("/critique-paper", parsedPaper);
      setProgressPercent(75);
      setProgressState("Building concept knowledge graphs...");

      await api.post("/classify-paper", parsedPaper);
      await api.post("/project-metrics", parsedPaper);
      const futureWorkResponse = await api.post("/future-work", parsedPaper);

      setProgressPercent(90);
      setProgressState("Compiling export reports and recommendations...");

      const reportPayload = {
        title: parsedPaper.title || title,
        summary: summaryResponse.data.tldr || "",
        key_contributions: summaryResponse.data.key_contributions || [],
        strengths: critiqueResponse.data.strengths?.map((s: any) => s.point || s) || [],
        weaknesses: critiqueResponse.data.weaknesses?.map((w: any) => w.point || w) || [],
        research_scores: critiqueResponse.data.research_scores || {},
        future_work: futureWorkResponse.data.future_work || "",
        recommendations: futureWorkResponse.data.recommendations || []
      };

      const exportResponse = await api.post("/generate-reports", reportPayload);
      const reportLinks = {
        pdf: `http://127.0.0.1:8000/${exportResponse.data.pdf}`,
        docx: `http://127.0.0.1:8000/${exportResponse.data.docx}`,
        ppt: `http://127.0.0.1:8000/${exportResponse.data.ppt}`
      };

      // Call route to generate recommendations (saving them to DB)
      await api.post("/recommendations", parsedPaper);

      const finalPortfolio = {
        id: parsedPaper.id,
        title: parsedPaper.title || title,
        authors: authors,
        abstract: parsedPaper.abstract || summary,
        summary: summaryResponse.data,
        critique: critiqueResponse.data,
        scores: critiqueResponse.data.research_scores,
        filename: parsedPaper.filename || "arxiv_imported.pdf",
        sections: parsedPaper.sections || { abstract: parsedPaper.abstract }
      };

      window.sessionStorage.setItem("researchmind:last-paper", JSON.stringify(finalPortfolio));

      setProgressPercent(100);
      setProgressState("Completed! Opening command center...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (err) {
      console.error(err);
      alert("Error importing publication.");
      setImporting(false);
    }
  };

  const trendingTopics = [
    "Agentic AI",
    "Multimodal RAG",
    "Vision Language Models",
    "Scientific AI",
    "Long Context LLMs"
  ];

  return (
    <AppLayout activeSection="discovery">
      <div className="space-y-8 animate-fade-in font-sans">
        {/* Page Header */}
        <div className="border-b border-zinc-900 pb-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">
              Academic Crawler & Discovery
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Research Discovery</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Explore live hybrid recommendation streams, trending publications, and import them directly to your library.
            </p>
          </div>

          {/* Sub Tabs Toggle */}
          <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-0.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === "feed"
                  ? "bg-zinc-800 text-white shadow-md"
                  : "text-zinc-550 hover:text-zinc-300"
              }`}
            >
              🔭 Personalized Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === "search"
                  ? "bg-zinc-800 text-white shadow-md"
                  : "text-zinc-550 hover:text-zinc-300"
              }`}
            >
              🔍 arXiv Search Crawler
            </button>
          </div>
        </div>

        {/* Ingestion overlay */}
        {importing && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col justify-center items-center gap-5 z-50">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {progressState}
            </h3>
            <div className="w-80 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider animate-pulse">
              Syncing metadata components. Please do not disconnect...
            </span>
          </div>
        )}

        {activeTab === "feed" ? (
          /* PERSONALIZED DISCOVERY DASHBOARD */
          loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 border border-zinc-900 bg-zinc-900/10 rounded-2xl">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider animate-pulse">
                Assembling Personalized Discovery Feed...
              </span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              {/* Main Feed Column */}
              <div className="space-y-8">
                {/* User Research Interests Badge Cloud */}
                {dashboardData?.user_interests && (
                  <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-lg">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-2">
                      Active Research Interests Profile
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dashboardData.user_interests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => {
                            setQuery(interest);
                            handleSearch(interest);
                          }}
                          className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 hover:border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-bold transition"
                        >
                          🏷️ {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section A: Personalized Recommended Papers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>🔭</span> Recommended for Your Active Workspaces
                  </h3>
                  
                  {!dashboardData?.recommended_papers || dashboardData.recommended_papers.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-900/10 border border-zinc-900 rounded-2xl text-zinc-500 text-xs">
                      No personalized recommendations. Add papers to your workspace to train the recommender.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.recommended_papers.map((paper, idx) => (
                        <div
                          key={`rec-feed-${idx}`}
                          className="bg-[#18181b] border border-zinc-850 hover:border-indigo-500/30 rounded-2xl p-5 hover:bg-zinc-900/30 transition duration-300 shadow-md space-y-3"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-extrabold text-white leading-snug">
                                  {paper.recommended_paper}
                                </h4>
                                {paper.is_emerging && (
                                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[9px] font-black text-rose-400 uppercase">
                                    🔥 Emerging Research
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                                By {paper.authors?.join(", ") || "arXiv Resource"}
                              </p>
                            </div>

                            <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-black text-indigo-400">
                              {Math.round(paper.similarity_score * 100)}% Match
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                            {paper.summary}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900">
                            <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                              Published: {paper.published_date ? new Date(paper.published_date).toLocaleDateString() : "Latest Feed"}
                            </span>

                            <div className="flex items-center gap-4">
                              {paper.pdf_link && (
                                <a
                                  href={paper.pdf_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-zinc-450 hover:text-white font-bold transition"
                                >
                                  direct pdf
                                </a>
                              )}
                              <button
                                onClick={() => handleImportPaper(paper.recommended_paper, paper.pdf_link, paper.summary, paper.authors)}
                                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black transition cursor-pointer"
                              >
                                Analyze Paper
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Trending Papers */}
                {dashboardData?.trending_papers && dashboardData.trending_papers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <span>⚡</span> Trending in Your Field
                    </h3>
                    <div className="space-y-4">
                      {dashboardData.trending_papers.map((paper, idx) => (
                        <div
                          key={`trend-${idx}`}
                          className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 hover:bg-zinc-900/20 transition space-y-3"
                        >
                          <div>
                            <h4 className="text-sm font-extrabold text-zinc-200">{paper.title}</h4>
                            <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">By {paper.authors.join(", ")}</p>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{paper.summary}</p>
                          <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                            <span className="text-[9px] text-zinc-550 font-semibold">Published: {new Date(paper.published).toLocaleDateString()}</span>
                            <div className="flex gap-4">
                              <a href={paper.arxiv_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-400 hover:text-white font-bold transition">arXiv Page</a>
                              <button
                                onClick={() => handleImportPaper(paper.title, paper.pdf_url, paper.summary, paper.authors)}
                                className="px-3 py-1 bg-zinc-850 hover:bg-zinc-750 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                Ingest Paper
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Gaps / Research Opportunities */}
                {dashboardData?.research_opportunities && (
                  <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                        <span>⚠️</span> Research Opportunities
                      </h3>
                      <p className="text-[9px] text-zinc-550 mt-0.5">Underexplored scientific gaps in your library.</p>
                    </div>
                    <ul className="space-y-3">
                      {dashboardData.research_opportunities.map((opportunity, i) => (
                        <li key={`opp-${i}`} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
                          <span className="text-amber-500 font-black shrink-0">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Models */}
                {dashboardData?.suggested_models && (
                  <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                        <span>🤖</span> Suggested Models
                      </h3>
                      <p className="text-[9px] text-zinc-550 mt-0.5">Highly central frameworks to review.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dashboardData.suggested_models.map((model) => (
                        <span
                          key={model}
                          className="px-2.5 py-1 bg-purple-500/5 border border-purple-500/15 rounded-lg text-xs text-zinc-350"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Datasets */}
                {dashboardData?.suggested_datasets && (
                  <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="border-b border-zinc-900 pb-2">
                      <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <span>📊</span> Suggested Datasets
                      </h3>
                      <p className="text-[9px] text-zinc-550 mt-0.5">Primary evaluations indices.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dashboardData.suggested_datasets.map((dataset) => (
                        <span
                          key={dataset}
                          className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-xs text-zinc-350"
                        >
                          {dataset}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Followed Preferences Panels */}
                <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                    <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                      Followed Topics
                    </h3>
                  </div>
                  {followedTopics.length === 0 ? (
                    <p className="text-[10px] text-zinc-550">
                      No followed topics. Search keywords to start tracking.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {followedTopics.map((t) => (
                        <div
                          key={t.id}
                          className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-450 rounded-lg text-[9px] font-bold flex items-center gap-1"
                        >
                          <button
                            onClick={() => {
                              setQuery(t.topic_name);
                              handleSearch(t.topic_name);
                            }}
                            className="hover:text-white transition font-bold"
                          >
                            {t.topic_name}
                          </button>
                          <button
                            onClick={() => handleUnfollowTopic(t.topic_name)}
                            className="text-zinc-650 hover:text-red-400 font-bold ml-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FollowField
                    placeholder="Track new topic..."
                    onAdd={(topic) => handleFollowTopic(topic)}
                  />
                </div>
              </div>
            </div>
          )
        ) : (
          /* ARXIV CRAWLER CRAWLING SYSTEM */
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-6">
              {/* Search Card */}
              <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-xl">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search query (e.g. attention, Llama-3, LLM reasoning)..."
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500/40 rounded-xl pl-4 pr-10 py-3 text-xs outline-none transition text-white"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={searching || !query.trim()}
                    className={`px-6 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                      query.trim()
                        ? "bg-indigo-650 hover:bg-indigo-650/90 hover:bg-indigo-600 text-white shadow-lg"
                        : "bg-zinc-900 border border-zinc-850 text-zinc-650 cursor-not-allowed"
                    }`}
                  >
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Search arXiv"
                    )}
                  </button>
                </div>

                {/* Trending Topics badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider mr-1">Trending Today:</span>
                  {trendingTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setQuery(topic);
                        handleSearch(topic);
                      }}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results deck */}
              {searching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 border border-zinc-900 bg-zinc-900/10 rounded-2xl animate-pulse">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-550 font-bold uppercase tracking-wider">
                    Crawling arXiv publications database...
                  </span>
                </div>
              ) : papers.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/10 border border-zinc-900 rounded-3xl p-6">
                  <div className="text-3xl mb-3">📡</div>
                  <h3 className="text-sm font-bold text-zinc-400">Discover Academic Papers</h3>
                  <p className="text-zinc-550 text-xs mt-1">
                    Type queries or click trending topics to discover and analyze publications.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {papers.map((paper, idx) => (
                    <div
                      key={idx}
                      className="bg-[#18181b] border border-zinc-850 hover:border-zinc-800 rounded-2xl p-5 transition space-y-4 shadow-md"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-white leading-snug">
                            {paper.title}
                          </h3>
                          <p className="text-[11px] text-zinc-550 font-semibold leading-relaxed">
                            By {paper.authors.slice(0, 5).join(", ")}{paper.authors.length > 5 ? " et al." : ""}
                          </p>
                        </div>
                        {paper.similarity !== undefined && (
                          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center shrink-0">
                            <span className="text-[8px] font-black uppercase tracking-widest block">MATCH</span>
                            <span className="text-xs font-black">{(paper.similarity * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {paper.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900">
                        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                          Published: {new Date(paper.published).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-4">
                          <a
                            href={paper.arxiv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-450 hover:text-white font-bold transition"
                          >
                            arXiv Page
                          </a>
                          <button
                            onClick={() => handleImportPaper(paper.title, paper.pdf_url, paper.summary, paper.authors)}
                            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black transition cursor-pointer"
                          >
                            Analyze in ResearchMind
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Follow preferences */}
            <div className="md:col-span-4 space-y-6">
              {/* Followed Topics */}
              <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                    Followed Topics
                  </h3>
                  <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-black px-1.5 py-0.5 rounded">
                    {followedTopics.length}
                  </span>
                </div>
                {followedTopics.length === 0 ? (
                  <p className="text-[10px] text-zinc-550">
                    No followed topics. Track keywords in sidebar.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {followedTopics.map((t) => (
                      <div
                        key={t.id}
                        className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                      >
                        <button
                          onClick={() => {
                            setQuery(t.topic_name);
                            handleSearch(t.topic_name);
                          }}
                          className="hover:text-white transition font-bold"
                        >
                          {t.topic_name}
                        </button>
                        <button
                          onClick={() => handleUnfollowTopic(t.topic_name)}
                          className="text-zinc-550 hover:text-red-400 font-bold ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <FollowField
                  placeholder="Track new topic..."
                  onAdd={(topic) => handleFollowTopic(topic)}
                />
              </div>

              {/* Followed Authors */}
              <div className="bg-[#18181b] border border-zinc-850 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                    Followed Authors
                  </h3>
                  <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-black px-1.5 py-0.5 rounded">
                    {followedAuthors.length}
                  </span>
                </div>
                {followedAuthors.length === 0 ? (
                  <p className="text-[10px] text-zinc-550">
                    No followed authors. Type author names to track.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {followedAuthors.map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between items-center px-3 py-2 bg-zinc-900/60 border border-zinc-900 rounded-xl text-[10px] font-semibold text-zinc-350 hover:text-white hover:border-zinc-800 transition"
                      >
                        <button
                          onClick={() => {
                            setQuery(a.author_name);
                            handleSearch(a.author_name);
                          }}
                          className="hover:text-indigo-400 transition text-left font-bold"
                        >
                          👤 {a.author_name}
                        </button>
                        <button
                          onClick={() => handleUnfollowAuthor(a.author_name)}
                          className="text-zinc-550 hover:text-red-400 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <FollowField
                  placeholder="Track new author..."
                  onAdd={(author) => handleFollowAuthor(author)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function FollowField({ placeholder, onAdd }: { placeholder: string; onAdd: (val: string) => void }) {
  const [val, setVal] = useState("");

  const submit = () => {
    if (val.trim()) {
      onAdd(val.trim());
      setVal("");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="flex-1 bg-zinc-900 border border-zinc-900 focus:border-zinc-800 text-[10px] text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none font-medium"
      />
      <button
        onClick={submit}
        className="px-2.5 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 border border-zinc-800 rounded-lg text-[10px] font-black cursor-pointer transition"
      >
        +
      </button>
    </div>
  );
}
