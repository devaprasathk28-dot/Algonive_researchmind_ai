import { Card } from "@/components/ui/card";

interface Props {
  domain: string;
  researchType: string;
  complexity: string;
  relevance: string;
  innovation: string;
}

export default function ResearchInsights({
  domain,
  researchType,
  complexity,
  relevance,
  innovation,
}: Props) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">

      <h2 className="text-2xl font-bold mb-6 text-white">
        Research Insights
      </h2>

      <div className="grid md:grid-cols-2 gap-6 text-sm">

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Domain
          </p>
          <p className="font-semibold text-zinc-100">
            {domain}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Research Type
          </p>
          <p className="font-semibold text-zinc-100">
            {researchType}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Complexity
          </p>
          <p className="font-semibold text-zinc-100">
            {complexity}
          </p>
        </div>

        <div>
          <p className="text-zinc-500 font-medium mb-1">
            Industry Relevance
          </p>
          <p className="font-semibold text-zinc-100">
            {relevance}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-zinc-500 font-medium mb-1">
            Innovation Level
          </p>
          <p className="font-semibold text-zinc-100">
            {innovation}
          </p>
        </div>

      </div>

    </Card>
  );
}
