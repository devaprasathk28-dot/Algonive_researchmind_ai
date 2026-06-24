import { Card } from "@/components/ui/card";

export default function ResearchHealth({
  scores
}: any) {

  const average = (
    scores.novelty +
    scores.clarity +
    scores.technical_depth +
    scores.innovation +
    scores.dataset_quality +
    scores.reproducibility
  ) / 6;

  let level = "Average";
  if (average > 8)
    level = "Excellent";
  else if (average > 6)
    level = "Good";

  const badges = [];
  if (average > 8) {
    badges.push({ text: "Excellent Research", icon: "🏆", bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20" });
  } else {
    badges.push({ text: "Solid Research", icon: "📄", bg: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20" });
  }

  if (scores.innovation >= 8) {
    badges.push({ text: "Strong Innovation", icon: "🚀", bg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" });
  }

  if (scores.technical_depth >= 8) {
    badges.push({ text: "High Technical Quality", icon: "📊", bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20" });
  }

  if (scores.reproducibility >= 8) {
    badges.push({ text: "Good Reproducibility", icon: "🧠", bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" });
  }

  return (

    <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">

      <div>

        <h2 className="text-2xl font-bold mb-4 text-white">

          Research Health
        </h2>

        <div className="flex items-baseline gap-3">

          <span className="text-5xl font-bold text-white">

            {average.toFixed(1)}
          </span>

          <span className="text-zinc-500 text-lg">/ 10</span>

        </div>

        <div className="mt-3 font-semibold text-lg text-green-400">

          {level} quality research
        </div>

      </div>

      <div className="flex flex-wrap gap-2 max-w-md">

        {badges.map((badge, index) => (

          <div
            key={index}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg}`}
          >

            <span>{badge.icon}</span>

            <span>{badge.text}</span>

          </div>

        ))}

      </div>

    </Card>
  );
}
