interface Props {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({
  role,
  content,
}: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 mb-4 ${
          isUser
            ? "bg-white text-black"
            : "bg-zinc-900 text-white border border-zinc-800"
        }`}
      >
        <p className="leading-7 whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
