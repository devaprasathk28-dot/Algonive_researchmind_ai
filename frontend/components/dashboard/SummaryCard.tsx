import { Card } from "@/components/ui/card";

interface Props {
  summary: string;
}

export default function SummaryCard({
  summary,
}: Props) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        AI Summary
      </h2>
      <p className="text-zinc-300 leading-7">
        {summary}
      </p>
    </Card>
  );
}
