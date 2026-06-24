"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ScoreDistribution({
  scores
}: any) {

  const data = [

    {
      name: "Novelty",
      value: scores.novelty,
    },

    {
      name: "Clarity",
      value: scores.clarity,
    },

    {
      name: "Technical",
      value: scores.technical_depth,
    },

    {
      name: "Innovation",
      value: scores.innovation,
    },

    {
      name: "Dataset",
      value: scores.dataset_quality,
    },

    {
      name: "Reproducibility",
      value: scores.reproducibility,
    },
  ];

  return (

    <div className="h-[350px] w-full">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>

          <XAxis 
            dataKey="name" 
            stroke="#a1a1aa" 
            fontSize={12}
            tickLine={false}
          />

          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12}
            tickLine={false}
            domain={[0, 10]}
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              borderColor: '#27272a',
              borderRadius: '8px',
              color: '#f4f4f5'
            }} 
          />

          <Bar 
            dataKey="value" 
            fill="#6366f1" 
            radius={[4, 4, 0, 0]} 
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}
