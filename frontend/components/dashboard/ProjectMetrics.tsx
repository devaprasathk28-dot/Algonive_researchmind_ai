import { Card } from "@/components/ui/card";

interface Props {
  pages: number;
  words: number;
  sections: number;
  figures: number;
  tables: number;
  references: number;
  readingTime: number;
  complexity: string;
  
  // New metrics added in Step 34
  equations?: number;
  technicalDensity?: number;
  documentIntelligence?: number;
  researchHealth?: number;
  readability?: string;
  methodology?: string;
  experimentalCoverage?: string;
  citationCoverage?: string;
}

export default function ProjectMetrics({
  pages,
  words,
  sections,
  figures,
  tables,
  references,
  readingTime,
  complexity,
  equations = 0,
  technicalDensity = 0.0,
  documentIntelligence = 8.0,
  researchHealth = 8.0,
  readability = "Advanced",
  methodology = "Strong",
  experimentalCoverage = "Moderate",
  citationCoverage = "Moderate",
}: Props) {

  // Convert technical density to percentage
  const techDensityPct = (technicalDensity * 100).toFixed(1);

  // Health text mapping
  let healthLabel = "Excellent Quality";
  let healthColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (researchHealth < 4.0) {
    healthLabel = "Weak Research Structure";
    healthColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
  } else if (researchHealth < 7.0) {
    healthLabel = "Moderate Quality";
    healthColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
  }

  // Intelligence text mapping
  let docIntelLabel = "High Intelligence";
  let docIntelColor = "text-indigo-400 border-indigo-500/20 bg-indigo-500/10";
  if (documentIntelligence < 4.0) {
    docIntelLabel = "Basic Indexing";
    docIntelColor = "text-zinc-400 border-zinc-500/20 bg-zinc-500/10";
  } else if (documentIntelligence < 7.0) {
    docIntelLabel = "Standard Indexing";
    docIntelColor = "text-blue-400 border-blue-500/20 bg-blue-500/10";
  }

  const basicMetrics = [
    { label: "Pages", value: pages },
    { label: "Words", value: words.toLocaleString() },
    { label: "References", value: references },
    { label: "Figures", value: figures },
    { label: "Tables", value: tables },
    { label: "Equations", value: equations },
    { label: "Reading Time", value: `${readingTime} min` },
    { label: "Complexity", value: complexity },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Basic document metrics (2/3 width on desktop) */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 lg:col-span-2 shadow-xl flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">
            Document Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {basicMetrics.map((item) => (
              <div
                key={item.label}
                className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/60 hover:border-zinc-700/80 transition-colors"
              >
                <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-xl font-bold mt-2 text-zinc-100">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology & Readability advanced insights */}
        <div className="mt-6 border-t border-zinc-800/80 pt-6">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">
            Advanced Research Insights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 font-medium mb-1">Technical Density</p>
              <p className="font-semibold text-indigo-400">{techDensityPct}%</p>
            </div>
            <div>
              <p className="text-zinc-500 font-medium mb-1">Methodology Depth</p>
              <p className="font-semibold text-emerald-400">{methodology}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-medium mb-1">Experimental Coverage</p>
              <p className="font-semibold text-purple-400">{experimentalCoverage}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-medium mb-1">Readability Level</p>
              <p className="font-semibold text-zinc-200">{readability}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Intelligence & Health Score panel (1/3 width on desktop) */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-xl flex flex-col justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">
            Research Quality Index
          </h2>
          
          <div className="space-y-6">
            {/* Document Intelligence Score */}
            <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800/60 flex items-center justify-between">
              <div>
                <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  Document Intelligence
                </div>
                <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded border inline-block ${docIntelColor}`}>
                  {docIntelLabel}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-indigo-400 tracking-tight">
                {documentIntelligence}<span className="text-sm font-semibold text-zinc-600">/10</span>
              </div>
            </div>

            {/* Research Health Score */}
            <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800/60 flex items-center justify-between">
              <div>
                <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                  Research Health
                </div>
                <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded border inline-block ${healthColor}`}>
                  {healthLabel}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {researchHealth}<span className="text-sm font-semibold text-zinc-600">/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-4">
          Scores are derived directly from citation coverage, methodology section density, math equation density, and scientific entities distribution.
        </div>
      </Card>

    </div>
  );
}
