import { Card } from "@/components/ui/card";
import React from "react";

interface Props {
  title: string;
  content: string | string[];
}

export default function CritiqueCard({
  title,
  content,
}: Props) {
  const renderContent = () => {
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-3 text-zinc-300 list-none">
          {content.map((item, idx) => (
            <li key={idx} className="flex gap-2.5 items-start text-xs font-medium">
              <span className="text-indigo-400 mt-0.5 font-black">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof content === "string") {
      const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        return (
          <ul className="space-y-3 text-zinc-300 list-none">
            {lines.map((line, idx) => {
              const cleaned = line.replace(/^[\s*\-•+]+/, "").trim();
              return (
                <li key={idx} className="flex gap-2.5 items-start text-xs font-medium">
                  <span className="text-indigo-400 mt-0.5 font-black">•</span>
                  <span className="leading-relaxed">{cleaned}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
          {content}
        </p>
      );
    }

    return null;
  };

  return (
    <Card className="bg-[#18181b] border-zinc-800 p-6 rounded-3xl">
      <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-4">
        {title}
      </h3>
      {renderContent()}
    </Card>
  );
}
