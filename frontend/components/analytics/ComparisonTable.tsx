"use client";

interface ComparisonTableProps {
  titleA?: string;
  titleB?: string;
  comparisonResult?: {
    methodology?: {
      paper_a_methodology: string;
      paper_b_methodology: string;
    };
    datasets?: {
      paper_a_datasets: string[];
      paper_b_datasets: string[];
    };
    performance?: {
      paper_a_metrics: string[];
      paper_b_metrics: string[];
    };
    accuracy_comparison?: {
      better_paper: string;
      paper_a_best_accuracy: number;
      paper_b_best_accuracy: number;
    };
  };
}

export default function ComparisonTable({
  titleA = "Paper A",
  titleB = "Paper B",
  comparisonResult
}: ComparisonTableProps) {
  if (!comparisonResult) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-zinc-500">
        Upload or select papers to generate a detailed comparison table.
      </div>
    );
  }

  const methodologyA = comparisonResult.methodology?.paper_a_methodology || "No methodology section parsed.";
  const methodologyB = comparisonResult.methodology?.paper_b_methodology || "No methodology section parsed.";

  const datasetsA = comparisonResult.datasets?.paper_a_datasets || [];
  const datasetsB = comparisonResult.datasets?.paper_b_datasets || [];

  const metricsA = comparisonResult.performance?.paper_a_metrics || [];
  const metricsB = comparisonResult.performance?.paper_b_metrics || [];

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/10 transition-all duration-300">
      <div className="p-6 border-b border-zinc-800/80">
        <h3 className="text-lg font-bold text-white tracking-tight">Technical Comparison Matrix</h3>
        <p className="text-zinc-500 text-xs mt-0.5">Granular feature-by-feature breakdown</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/45 text-xs text-zinc-400 font-bold uppercase tracking-wider">
              <th className="py-4 px-6 w-1/4">Feature / Metric</th>
              <th className="py-4 px-6 w-3/8 text-indigo-400">{titleA}</th>
              <th className="py-4 px-6 w-3/8 text-pink-400">{titleB}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-sm">
            {/* Title */}
            <tr>
              <td className="py-4 px-6 font-semibold text-zinc-300 bg-zinc-950/20">Document Title</td>
              <td className="py-4 px-6 text-zinc-200">{titleA}</td>
              <td className="py-4 px-6 text-zinc-200">{titleB}</td>
            </tr>

            {/* Methodology */}
            <tr className="align-top">
              <td className="py-4 px-6 font-semibold text-zinc-300 bg-zinc-950/20">Methodology</td>
              <td className="py-4 px-6 text-zinc-400 leading-relaxed italic text-xs">
                "{methodologyA.length > 250 ? methodologyA.substring(0, 250) + "..." : methodologyA}"
              </td>
              <td className="py-4 px-6 text-zinc-400 leading-relaxed italic text-xs">
                "{methodologyB.length > 250 ? methodologyB.substring(0, 250) + "..." : methodologyB}"
              </td>
            </tr>

            {/* Datasets */}
            <tr className="align-top">
              <td className="py-4 px-6 font-semibold text-zinc-300 bg-zinc-950/20">Detected Datasets</td>
              <td className="py-4 px-6">
                {datasetsA.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {datasetsA.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">None detected</span>
                )}
              </td>
              <td className="py-4 px-6">
                {datasetsB.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {datasetsB.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">None detected</span>
                )}
              </td>
            </tr>

            {/* Performance Metrics */}
            <tr className="align-top">
              <td className="py-4 px-6 font-semibold text-zinc-300 bg-zinc-950/20">Performance Metrics</td>
              <td className="py-4 px-6">
                {metricsA.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {metricsA.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-zinc-850 text-zinc-200 border border-zinc-700/50">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">No metrics extracted</span>
                )}
              </td>
              <td className="py-4 px-6">
                {metricsB.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {metricsB.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-zinc-850 text-zinc-200 border border-zinc-700/50">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-600 text-xs">No metrics extracted</span>
                )}
              </td>
            </tr>

            {/* Accuracy Summary */}
            {comparisonResult.accuracy_comparison && (
              <tr>
                <td className="py-4 px-6 font-semibold text-zinc-300 bg-zinc-950/20">Verdict (Accuracy)</td>
                <td className="py-4 px-6 text-zinc-200" colSpan={2}>
                  {comparisonResult.accuracy_comparison.better_paper === "Equal" ? (
                    <span className="text-amber-400 font-semibold">Equal accuracy performance</span>
                  ) : (
                    <span>
                      <strong className={comparisonResult.accuracy_comparison.better_paper === "Paper A" ? "text-indigo-400" : "text-pink-400"}>
                        {comparisonResult.accuracy_comparison.better_paper === "Paper A" ? titleA : titleB}
                      </strong>{" "}
                      leads with{" "}
                      <span className="text-emerald-400 font-bold">
                        {Math.max(
                          comparisonResult.accuracy_comparison.paper_a_best_accuracy,
                          comparisonResult.accuracy_comparison.paper_b_best_accuracy
                        )}
                        %
                      </span>{" "}
                      compared to{" "}
                      <span className="text-zinc-400">
                        {Math.min(
                          comparisonResult.accuracy_comparison.paper_a_best_accuracy,
                          comparisonResult.accuracy_comparison.paper_b_best_accuracy
                        )}
                        %
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
