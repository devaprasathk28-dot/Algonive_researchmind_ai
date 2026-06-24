"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer
} from "recharts";

interface Props {
  scores: {
    novelty: number;
    clarity: number;
    technical_depth: number;
    innovation: number;
    reproducibility: number;
    dataset_quality: number;
  };
}

export default function ResearchRadar({
  scores,
}: Props) {

  const data = [

    {
      metric: "Novelty",
      value: scores.novelty,
    },

    {
      metric: "Clarity",
      value: scores.clarity,
    },

    {
      metric: "Technical",
      value: scores.technical_depth,
    },

    {
      metric: "Innovation",
      value: scores.innovation,
    },

    {
      metric: "Dataset",
      value: scores.dataset_quality,
    },

    {
      metric: "Reproducibility",
      value: scores.reproducibility,
    },
  ];

  return (

    <div className="h-[400px] w-full flex items-center justify-center">

      <ResponsiveContainer width="100%" height="100%">

        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>

          <PolarGrid stroke="#3f3f46" />

          <PolarAngleAxis
            dataKey="metric"
            stroke="#a1a1aa"
            fontSize={12}
          />

          <Radar
            name="Score"
            dataKey="value"
            stroke="#818cf8"
            fill="#6366f1"
            fillOpacity={0.3}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  );
}
