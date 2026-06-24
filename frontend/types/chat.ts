export interface Citation {
  chunk_id: number;
  preview: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
  citations: Citation[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
