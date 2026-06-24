"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface ScoreRadarProps {
  scoresA?: {
    novelty?: number;
    clarity?: number;
    technical_depth?: number;
    innovation?: number;
    reproducibility?: number;
    dataset_quality?: number;
  };
  scoresB?: {
    novelty?: number;
    clarity?: number;
    technical_depth?: number;
    innovation?: number;
    reproducibility?: number;
    dataset_quality?: number;
  };
  titleA?: string;
  titleB?: string;
}

export default function ScoreRadar({
  scoresA,
  scoresB,
  titleA = "Paper A",
  titleB = "Paper B"
}: ScoreRadarProps) {
  // If no dynamic scores are provided, fallback to standard mock data from prompt
  const hasData = !!scoresA;

  const data = hasData
    ? [
        {
          metric: "Novelty",
          [titleA]: scoresA?.novelty ?? 0,
          [titleB]: scoresB?.novelty ?? 0,
          value: scoresA?.novelty ?? 0,
        },
        {
          metric: "Clarity",
          [titleA]: scoresA?.clarity ?? 0,
          [titleB]: scoresB?.clarity ?? 0,
          value: scoresA?.clarity ?? 0,
        },
        {
          metric: "Innovation",
          [titleA]: scoresA?.innovation ?? 0,
          [titleB]: scoresB?.innovation ?? 0,
          value: scoresA?.innovation ?? 0,
        },
        {
          metric: "Technical",
          [titleA]: scoresA?.technical_depth ?? 0,
          [titleB]: scoresB?.technical_depth ?? 0,
          value: scoresA?.technical_depth ?? 0,
        },
        {
          metric: "Dataset",
          [titleA]: scoresA?.dataset_quality ?? 0,
          [titleB]: scoresB?.dataset_quality ?? 0,
          value: scoresA?.dataset_quality ?? 0,
        }
      ]
    : [
        {
          metric: "Novelty",
          value: 8.5
        },
        {
          metric: "Clarity",
          value: 7.8
        },
        {
          metric: "Innovation",
          value: 8.9
        },
        {
          metric: "Technical",
          value: 9.1
        },
        {
          metric: "Dataset",
          value: 8.0
        }
      ];

  return (
    <div className="h-[400px] bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Research Quality Scores</h3>
        <p className="text-zinc-500 text-xs mt-0.5">Multidimensional comparison of quality scores (Scale 0-10)</p>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: "#71717a", fontSize: 10 }}
              stroke="#27272a"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px"
              }}
            />
            <Radar
              name={hasData ? titleA : "Paper A"}
              dataKey={hasData ? titleA : "value"}
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
            />
            {hasData && scoresB && (
              <Radar
                name={titleB}
                dataKey={titleB}
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.25}
              />
            )}
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
