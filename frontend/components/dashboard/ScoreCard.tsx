import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  score: number;
  reason?: string;
  confidence?: number;
}

export default function ScoreCard({
  title,
  score,
  reason,
  confidence,
}: Props) {
  return (
    <Card className="bg-zinc-900 border-zinc-800/80 p-5 hover:border-zinc-700/80 hover:bg-zinc-900/90 transition-all duration-300 flex flex-col justify-between h-full min-h-[160px] group shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
            {title}
          </h3>
          {confidence !== undefined && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-mono font-bold whitespace-nowrap">
              {Math.round(confidence)}%
            </span>
          )}
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {score.toFixed(1)}<span className="text-xs font-semibold text-zinc-500 ml-0.5">/10</span>
        </div>
      </div>
      
      {reason && (
        <div className="text-[11px] text-zinc-400 font-normal leading-relaxed border-t border-zinc-800/60 pt-3 mt-3 italic group-hover:text-zinc-300 transition-colors">
          {reason}
        </div>
      )}
    </Card>
  );
}

