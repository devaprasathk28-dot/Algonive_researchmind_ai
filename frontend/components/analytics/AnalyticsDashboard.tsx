import ResearchRadar from "./ResearchRadar";
import ScoreDistribution from "./ScoreDistribution";
import ResearchHealth from "./ResearchHealth";

export default function AnalyticsDashboard({

  scores

}: any) {

  return (

    <div className="space-y-6">

      <ResearchHealth
        scores={scores}
      />

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">

          <h2 className="text-xl font-bold mb-4 text-white">

            Research Quality Radar
          </h2>

          <ResearchRadar
            scores={scores}
          />

        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">

          <h2 className="text-xl font-bold mb-4 text-white">

            Score Distribution
          </h2>

          <ScoreDistribution
            scores={scores}
          />

        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 lg:col-span-2">

          <h2 className="text-xl font-bold mb-4 text-white">

            Advanced Analytics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">

              <p className="text-zinc-500 text-sm font-medium">Research Maturity</p>

              <p className="text-xl font-bold mt-2 text-white">{(scores.technical_depth * 0.6 + scores.reproducibility * 0.4).toFixed(1)}/10</p>

            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">

              <p className="text-zinc-500 text-sm font-medium">Publication Readiness</p>

              <p className="text-xl font-bold mt-2 text-white">{(scores.clarity * 0.5 + scores.novelty * 0.3 + scores.dataset_quality * 0.2).toFixed(1)}/10</p>

            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">

              <p className="text-zinc-500 text-sm font-medium">Commercial Potential</p>

              <p className="text-xl font-bold mt-2 text-white">{(scores.innovation * 0.7 + scores.clarity * 0.3).toFixed(1)}/10</p>

            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">

              <p className="text-zinc-500 text-sm font-medium">Scalability Potential</p>

              <p className="text-xl font-bold mt-2 text-white">{(scores.technical_depth * 0.8 + scores.innovation * 0.2).toFixed(1)}/10</p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
