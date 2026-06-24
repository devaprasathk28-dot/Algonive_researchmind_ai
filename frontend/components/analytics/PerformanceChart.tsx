"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts";

interface PerformanceChartProps {
  metricsA?: string[];
  metricsB?: string[];
  titleA?: string;
  titleB?: string;
}

export default function PerformanceChart({
  metricsA,
  metricsB,
  titleA = "Paper A",
  titleB = "Paper B"
}: PerformanceChartProps) {
  const parseHighestMetric = (metrics?: string[]): number => {
    if (!metrics || metrics.length === 0) return 0;
    const values = metrics
      .map((m) => parseFloat(m.replace("%", "")))
      .filter((v) => !isNaN(v));
    return values.length > 0 ? Math.max(...values) : 0;
  };

  const hasData = !!(metricsA || metricsB);

  const accuracyA = hasData ? parseHighestMetric(metricsA) : 94;
  const accuracyB = hasData ? parseHighestMetric(metricsB) : 97;

  const data = [
    {
      paper: titleA,
      accuracy: accuracyA,
      color: "#6366f1"
    },
    {
      paper: titleB,
      accuracy: accuracyB,
      color: "#ec4899"
    }
  ];

  return (
    <div className="h-[400px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Performance Comparison</h3>
        <p className="text-zinc-500 text-xs mt-0.5">Highest reported performance metric (%)</p>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#db2777" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="paper"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
              contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px"
              }}
              formatter={(value: any) => [`${value}%`, "Accuracy / Metric"]}
            />
            <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} maxBarSize={60}>
              <Cell fill="url(#colorA)" />
              <Cell fill="url(#colorB)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
