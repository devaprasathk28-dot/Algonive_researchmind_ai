interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function CopilotMessage({ role, content }: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-none"
            : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none whitespace-pre-line"
        }`}
      >
        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
          {isUser ? "You" : "ResearchMind Assistant"}
        </span>
        {content}
      </div>
    </div>
  );
}
