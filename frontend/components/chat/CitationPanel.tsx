import { Citation } from "@/types/chat";

interface Props {
  citations: Citation[];
}

export default function CitationPanel({
  citations,
}: Props) {
  if (!citations.length) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Citations
      </h2>
      <div className="space-y-4">
        {citations.map((citation) => (
          <div
            key={citation.chunk_id}
            className="bg-zinc-950 p-4 rounded-xl"
          >
            <div className="text-sm text-zinc-500 mb-2">
              Chunk #{citation.chunk_id}
            </div>
            <p className="text-zinc-300 leading-6">
              {citation.preview}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
