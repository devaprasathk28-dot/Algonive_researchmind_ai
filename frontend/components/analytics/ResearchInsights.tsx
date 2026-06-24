"use client";

interface ResearchInsightsProps {
  titleA?: string;
  titleB?: string;
  comparisonResult?: {
    accuracy_comparison?: {
      better_paper: string;
      paper_a_best_accuracy: number;
      paper_b_best_accuracy: number;
    };
    datasets?: {
      paper_a_datasets: string[];
      paper_b_datasets: string[];
    };
    methodology?: {
      paper_a_methodology: string;
      paper_b_methodology: string;
    };
  };
  scoresA?: any;
  scoresB?: any;
}

export default function ResearchInsights({
  titleA = "Paper A",
  titleB = "Paper B",
  comparisonResult,
  scoresA,
  scoresB
}: ResearchInsightsProps) {
  if (!comparisonResult) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-zinc-500">
        Upload or select papers to generate comparative research insights.
      </div>
    );
  }

  // Derived insights
  const accuracyWinner = comparisonResult.accuracy_comparison?.better_paper;
  const datasetsA = comparisonResult.datasets?.paper_a_datasets || [];
  const datasetsB = comparisonResult.datasets?.paper_b_datasets || [];

  const scoreAVal = scoresA
    ? (scoresA.novelty + scoresA.clarity + scoresA.technical_depth + scoresA.innovation + scoresA.reproducibility) / 5
    : 8.5;
  const scoreBVal = scoresB
    ? (scoresB.novelty + scoresB.clarity + scoresB.technical_depth + scoresB.innovation + scoresB.reproducibility) / 5
    : 8.3;

  const qualityWinner = scoreAVal > scoreBVal ? titleA : titleB;

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 hover:border-indigo-500/10 transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight">AI Synthesis & Insights</h3>
        <p className="text-zinc-500 text-xs mt-0.5">Automated high-level research analysis</p>
      </div>

      <div className="space-y-4">
        {/* Insight 1: Methodology Comparison */}
        <div className="p-4 rounded-xl bg-zinc-950/35 border border-zinc-800/60 flex items-start gap-3">
          <div className="p-2 bg-indigo-500/15 rounded-lg text-indigo-400 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18ZM12 18c-2.29 0-3.5-1.43-3.5-2.5s1.66-3 3.5-3a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Methodological Architecture</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              <strong>{titleA}</strong> focuses heavily on sections parsing methodology.
              <strong> {titleB}</strong> addresses sequential or baseline setups. The technical complexity index points to{" "}
              {scoreAVal > scoreBVal ? titleA : titleB} having a more robust structural framework.
            </p>
          </div>
        </div>

        {/* Insight 2: Performance Leads */}
        <div className="p-4 rounded-xl bg-zinc-950/35 border border-zinc-800/60 flex items-start gap-3">
          <div className="p-2 bg-pink-500/15 rounded-lg text-pink-400 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Empirical Performance Edge</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {accuracyWinner === "Equal" ? (
                <span>Both papers report equivalent metric benchmarks. Neither holds a distinct statistical margin.</span>
              ) : (
                <span>
                  <strong>{accuracyWinner === "Paper A" ? titleA : titleB}</strong> demonstrates a performance advantage in numerical indicators. If reproducibility is verified, this approach provides the state-of-the-art benchmark standard.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Insight 3: Dataset Scale */}
        <div className="p-4 rounded-xl bg-zinc-950/35 border border-zinc-800/60 flex items-start gap-3">
          <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V10.125M3.75 10.312v3.75m16.5-3.75v3.75m-16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75M3.75 14.063v3.75" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Dataset Divergence</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {datasetsA.length === 0 && datasetsB.length === 0 ? (
                <span>No major public datasets were identified in the primary text blocks. The evaluations may rely on proprietary/unnamed datasets.</span>
              ) : (
                <span>
                  Paper A references: <span className="text-indigo-300 font-semibold">{datasetsA.slice(0, 3).join(", ") || "None"}</span>.
                  Paper B references: <span className="text-pink-300 font-semibold">{datasetsB.slice(0, 3).join(", ") || "None"}</span>.
                  This indicates differing testing environments which might limit direct model-to-model comparisons.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Insight 4: Overall Quality Verdict */}
        <div className="p-4 rounded-xl bg-zinc-950/35 border border-zinc-800/60 flex items-start gap-3">
          <div className="p-2 bg-purple-500/15 rounded-lg text-purple-400 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Decision Intelligence Verdict</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-semibold">
              Recommendation: Synthesized scores recommend prioritising {qualityWinner} for deployment due to superior overall technical balance and novelty metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
