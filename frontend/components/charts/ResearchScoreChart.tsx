"use client";

import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { ResearchScores } from "@/services/api";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ResearchScoreChartProps {
  scores?: ResearchScores;
  label?: string;
}

export default function ResearchScoreChart({ scores, label = "Research Scores" }: ResearchScoreChartProps) {
  // Use scores from props or fallback to placeholder data if not provided
  const chartData = scores
    ? [
        scores.novelty,
        scores.clarity,
        scores.technical_quality,
        scores.innovation,
        scores.dataset_quality,
        scores.reproducibility,
      ]
    : [8, 7, 9, 8, 7, 6];

  const data = {
    labels: ["Novelty", "Clarity", "Technical Quality", "Innovation", "Dataset Quality", "Reproducibility"],
    datasets: [
      {
        label: label,
        data: chartData,
        backgroundColor: "rgba(99, 102, 241, 0.2)", // Indigo fill with transparency
        borderColor: "rgb(99, 102, 241)", // Indigo line
        borderWidth: 2,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(99, 102, 241)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend box since we have custom indicators
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 13, family: "var(--font-sans, sans-serif)", weight: "bold" },
        bodyFont: { size: 12, family: "var(--font-sans, sans-serif)" },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      r: {
        grid: {
          color: "rgba(148, 163, 184, 0.15)", // Light grid line
        },
        angleLines: {
          color: "rgba(148, 163, 184, 0.15)",
        },
        pointLabels: {
          font: {
            size: 11,
            family: "var(--font-sans, sans-serif)",
            weight: "bold",
          },
          color: "rgb(100, 116, 139)", // slate-500
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          color: "rgba(148, 163, 184, 0.5)",
          backdropColor: "transparent",
        },
      },
    },
  };

  return (
    <div className="relative w-full h-80 flex items-center justify-center p-2 bg-slate-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
      <Radar data={data} options={options} />
    </div>
  );
}
