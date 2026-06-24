"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/services/api";

export default function FeedPage() {
  const [feedData, setFeedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedPapers, setSavedPapers] = useState<Record<string, boolean>>({});
  const [newInterest, setNewInterest] = useState("");
  const [addingInterest, setAddingInterest] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
      setWorkspaceId(localStorage.getItem("workspace_id"));
    }
  }, []);

  const fetchFeed = () => {
    if (!userId) return;
    setLoading(true);
    api.get(`/feed/${userId}`)
      .then((res) => {
        setFeedData(res.data);
      })
      .catch((err) => console.error("Error fetching feed:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userId) {
      fetchFeed();
    }
  }, [userId]);

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newInterest.trim()) return;
    setAddingInterest(true);

    api.post("/feed/interests", {
      user_id: parseInt(userId),
      topic: newInterest.trim()
    })
      .then(() => {
        setNewInterest("");
        fetchFeed();
      })
      .catch((err) => console.error("Error adding interest:", err))
      .finally(() => setAddingInterest(false));
  };

  const handleRemoveInterest = (topic: string) => {
    if (!userId) return;
    api.delete(`/feed/interests/${userId}/${encodeURIComponent(topic)}`)
      .then(() => {
        fetchFeed();
      })
      .catch((err) => console.error("Error removing interest:", err));
  };

  const handleSaveToLibrary = (paper: any, index: number) => {
    if (!userId) return;
    const paperKey = paper.arxiv_url || paper.title;
    setSavingId(paperKey);

    api.post("/feed/save-paper", {
      user_id: parseInt(userId),
      title: paper.title,
      authors: Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors,
      abstract: paper.summary,
      arxiv_url: paper.arxiv_url,
      pdf_url: paper.pdf_url,
      workspace_id: workspaceId ? parseInt(workspaceId) : null
    })
      .then(() => {
        setSavedPapers(prev => ({ ...prev, [paperKey]: true }));
        // Trigger a notification fetch on TopNavbar indirectly by updating count or wait for poll
      })
      .catch((err) => console.error("Error saving paper:", err))
      .finally(() => setSavingId(null));
  };

  return (
    <AppLayout activeSection="feed">
      <div className="space-y-8 animate-fade-in pb-12 font-sans text-zinc-300">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-5 gap-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">PROACTIVE DISCOVERY</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Your Personalized Feed</h2>
            <p className="text-xs text-zinc-400 mt-1">Aggregated and ranked publications from arXiv mapping to your workspace history and followed interests.</p>
          </div>
          <button
            onClick={fetchFeed}
            className="self-start px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Re-Sync Feed
          </button>
        </div>

        {/* Interests Bar */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Followed Research Topics</h4>
              <p className="text-[10px] text-zinc-500">Add key phrases to customize your feed scoring and arXiv crawls.</p>
            </div>
            <form onSubmit={handleAddInterest} className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="E.g. Reinforcement Learning..."
                disabled={addingInterest}
                className="bg-zinc-950 border border-zinc-900 focus:border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs outline-none text-white placeholder-zinc-600 w-52 md:w-64"
              />
              <button
                type="submit"
                disabled={addingInterest || !newInterest.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
              >
                Add Topic
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {feedData?.interests && feedData.interests.length > 0 ? (
              feedData.interests.map((interest: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-bold text-[11px] rounded-lg"
                >
                  #{interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-red-400 text-zinc-550 transition font-black text-xs cursor-pointer ml-0.5"
                    title={`Unfollow ${interest}`}
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-zinc-550 italic">No topics added. Add interests above to tune recommendations.</span>
            )}
          </div>
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl h-80 animate-pulse" />
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl h-60 animate-pulse" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl h-44 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          /* Main Layout content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Digest & Breakthroughs */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Daily Research Digest */}
              {feedData?.daily_digest && (
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                    <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Daily Briefing Digest</h3>
                  </div>
                  <div className="text-xs text-zinc-400 space-y-4 whitespace-pre-line leading-relaxed">
                    {feedData.daily_digest.replace(/### .*\n\n/, '')}
                  </div>
                </div>
              )}

              {/* Breakthroughs Alerts Dashboard */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Breakthrough Alerts</h3>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-md uppercase">
                    {feedData?.breakthroughs?.length || 0} New
                  </span>
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto no-scrollbar">
                  {feedData?.breakthroughs && feedData.breakthroughs.length > 0 ? (
                    feedData.breakthroughs.map((paper: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-1.5">
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">
                          {paper.breakthrough_reason || "SOTA MATCH"}
                        </span>
                        <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-snug">{paper.title}</h4>
                        <a
                          href={paper.arxiv_url || paper.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                        >
                          View publication
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-zinc-550 text-xs italic">
                      No breakthrough papers matching keywords in feed.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Recommendations List */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Recommended Publications</h3>
                <span className="text-xs text-zinc-500 font-bold">{feedData?.feed?.length || 0} papers retrieved</span>
              </div>

              <div className="space-y-4">
                {feedData?.feed && feedData.feed.length > 0 ? (
                  feedData.feed.map((paper: any, idx: number) => {
                    const paperKey = paper.arxiv_url || paper.title;
                    const isSaved = savedPapers[paperKey];
                    const isSaving = savingId === paperKey;

                    return (
                      <div
                        key={idx}
                        className="bg-zinc-900/10 border border-zinc-900 hover:border-zinc-800/80 transition rounded-2xl p-5 space-y-3.5 relative"
                      >
                        {/* Score & Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md ${
                              paper.match_score > 75 
                                ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20" 
                                : "bg-zinc-900 text-zinc-500 border-zinc-800"
                            }`}>
                              {paper.match_score}% Match Score
                            </span>
                            <span className="text-[10px] text-zinc-450 font-bold bg-zinc-950 border border-zinc-900 px-2 py-0.5 rounded-md">
                              {paper.why_recommended}
                            </span>
                          </div>

                          <div className="text-[10px] text-zinc-650 font-medium">
                            {paper.published ? new Date(paper.published).toLocaleDateString() : "Recent publication"}
                          </div>
                        </div>

                        {/* Paper Title & Authors */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-white leading-snug">{paper.title}</h4>
                          <p className="text-[11px] text-zinc-500">
                            By {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
                          </p>
                        </div>

                        {/* Summary / Abstract */}
                        <p className="text-xs text-zinc-450 leading-relaxed line-clamp-3">
                          {paper.summary}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3.5 mt-2 gap-4">
                          <div className="flex items-center gap-3">
                            <a
                              href={paper.arxiv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-zinc-450 hover:text-white transition flex items-center gap-1 cursor-pointer"
                            >
                              ArXiv Link
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </a>
                            
                            {paper.pdf_url && (
                              <a
                                href={paper.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-zinc-450 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              >
                                PDF Link
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => handleSaveToLibrary(paper, idx)}
                            disabled={isSaved || isSaving}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isSaved
                                ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                                : isSaving
                                ? "bg-zinc-800 text-zinc-550 border border-zinc-750 cursor-wait"
                                : "bg-indigo-600 hover:bg-indigo-500 border border-transparent text-white shadow-lg shadow-indigo-600/10"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                Saved to Library
                              </>
                            ) : isSaving ? (
                              "Saving..."
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add to Library
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-12 text-center text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-zinc-700 animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>
                    <p className="text-sm font-bold text-white">No recommended papers found.</p>
                    <p className="text-xs text-zinc-550 mt-1">Make sure you have registered followed topics/interests, or added papers to your library.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}
