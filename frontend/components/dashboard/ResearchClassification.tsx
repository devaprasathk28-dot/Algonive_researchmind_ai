import { Card } from "@/components/ui/card";

interface Props {
  category: string;
  subCategory: string;
  domain: string;
  applicationArea: string;
  difficulty: string;
  keywords: string[];
  researchType?: string;
  confidence?: number | string;
  explanation?: string[];
}

export default function ResearchClassification({
  category,
  subCategory,
  domain,
  applicationArea,
  difficulty,
  keywords,
  researchType = "Experimental Research",
  confidence = 0.85,
  explanation = [],
}: Props) {
  // Convert confidence score to a normalized percentage integer
  let confidenceVal = 85;
  if (typeof confidence === "number") {
    confidenceVal = confidence <= 1.0 ? Math.round(confidence * 100) : Math.round(confidence);
  } else if (typeof confidence === "string") {
    const parsed = parseFloat(confidence);
    if (!isNaN(parsed)) {
      confidenceVal = parsed <= 1.0 ? Math.round(parsed * 100) : Math.round(parsed);
    }
  }

  // Determine confidence color badge class and indicator text
  let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let badgeText = "🟢 High Confidence";
  if (confidenceVal < 50) {
    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    badgeText = "🔴 Low Confidence";
  } else if (confidenceVal < 80) {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    badgeText = "🟡 Medium Confidence";
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-zinc-800/60 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Research Classification
        </h2>
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor} transition-all`}>
          {badgeText} ({confidenceVal}%)
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Research Domain
          </p>
          <p className="font-semibold text-zinc-200">
            {domain}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Category
          </p>
          <p className="font-semibold text-zinc-200">
            {category}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Sub Category
          </p>
          <p className="font-semibold text-zinc-200">
            {subCategory}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Research Type
          </p>
          <p className="font-semibold text-zinc-200">
            {researchType}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Complexity
          </p>
          <p className="font-semibold text-zinc-200">
            {difficulty}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Application Area
          </p>
          <p className="font-semibold text-zinc-200">
            {applicationArea}
          </p>
        </div>
      </div>

      {explanation && explanation.length > 0 && (
        <div className="mt-6 border-t border-zinc-800/80 pt-6">
          <p className="text-zinc-400 mb-3 text-xs uppercase tracking-wider font-bold">
            Why Classified? (Detected Target Entities)
          </p>
          <div className="flex flex-wrap gap-2">
            {explanation.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-md bg-zinc-850 text-xs font-semibold text-emerald-300 border border-emerald-950/40 flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
              >
                <span className="text-emerald-500">✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {keywords && keywords.length > 0 && (!explanation || explanation.length === 0) && (
        <div className="mt-6 border-t border-zinc-800/80 pt-6">
          <p className="text-zinc-500 mb-3 text-xs uppercase tracking-wider font-bold">
            Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 rounded-full bg-zinc-850 text-xs font-semibold text-zinc-300 border border-zinc-800/80"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
