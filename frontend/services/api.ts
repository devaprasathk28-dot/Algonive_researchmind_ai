import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Interceptor to inject JWT token in outgoing requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export interface ResearchScores {
  novelty: number;
  clarity: number;
  technical_quality: number;
  reproducibility: number;
  dataset_quality: number;
  innovation: number;
  overall_score: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  subject?: string;
  keywords?: string;
  pages?: number;
}

export interface AISummary {
  tldr: string;
  beginner_summary: string;
  key_contributions: string[];
}

export interface ResearchCritique {
  strengths: { point: string; explanation: string }[];
  weaknesses: { point: string; explanation: string }[];
  reproducibility: { score: number; issues: string[]; suggestions: string[] };
}

export interface ImageAnalysis {
  image_path: string;
  ocr_text: string;
  chart_analysis?: string;
  table_analysis?: string;
  diagram_analysis?: string;
}

export interface ParsedResearchData {
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  doi: string;
  sections: { [key: string]: string };
  references_count: number;
  references_sample: string[];
  word_count: number;
  ai_summary: AISummary;
}

export interface AnalysisResponse {
  error?: string;
  filename: string;
  message: string;
  path: string;
  title: string;
  abstract: string;
  sections: { [key: string]: string };
  extracted_text: string;
  pdf_metadata: PDFMetadata;
  ai_summary: AISummary;
  research_critique: ResearchCritique;
  research_scores: ResearchScores;
  image_analysis: ImageAnalysis[];
  parsed_research_data: ParsedResearchData;
  full_text_length: number;
}

export interface UploadsListResponse {
  uploads: string[];
  total_count: number;
}

export interface FutureWorkResponse {
  future_work_suggestions: string[];
  improvement_recommendations: string[];
  innovation_opportunities: string[];
}

export interface Entity {
  text: string;
  label: string;
}

export interface Relationship {
  source: string;
  target: string;
  relation: string;
  relations?: string[];
  weight?: number;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  mention_count: number;
  frequency?: number;
  confidence?: number;
  centrality?: number;
  community?: number;
}

export interface KnowledgeGraphPaper {
  title?: string;
  authors?: string[];
  sections?: { [key: string]: string };
  text?: string;
  extracted_text?: string;
}

export interface KnowledgeGraphResponse {
  nodes: KnowledgeGraphNode[];
  edges: Relationship[];
  entities: Entity[];
  relationships: Relationship[];
  total_nodes: number;
  total_edges: number;
  metrics?: {
    density: number;
    quality_score: number;
    typed_nodes_ratio: number;
    total_nodes: number;
    total_edges: number;
  };
  ecosystem?: {
    top_model: string;
    top_dataset: string;
    top_framework: string;
    top_method: string;
  };
}

export const uploadPaper = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post<AnalysisResponse>("/upload-paper", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const listUploads = async (): Promise<UploadsListResponse> => {
  const response = await api.get<UploadsListResponse>("/uploads-list");
  return response.data;
};

export const comparePapers = async (paperA: string, paperB: string): Promise<string> => {
  const response = await api.post<string>("/compare-papers", {
    paper_a: paperA,
    paper_b: paperB,
  });
  return response.data;
};

export const generateKnowledgeGraph = async (
  paper: KnowledgeGraphPaper | string
): Promise<KnowledgeGraphResponse> => {
  const payload = typeof paper === "string" ? { text: paper } : paper;
  const response = await api.post<KnowledgeGraphResponse>(
    "/generate-knowledge-graph",
    payload
  );
  return response.data;
};

export const generateFutureWork = async (text: string): Promise<FutureWorkResponse> => {
  const response = await api.post<FutureWorkResponse>("/generate-future-work", {
    text,
  });
  return response.data;
};

export const initializeRAG = async (text: string): Promise<{ message: string; chunks: number }> => {
  const response = await api.post<{ message: string; chunks: number }>("/initialize-rag", {
    text,
  });
  return response.data;
};

export const chatWithPaper = async (
  query: string
): Promise<{ query: string; retrieved_chunks: string[]; answer: string }> => {
  const response = await api.post<{ query: string; retrieved_chunks: string[]; answer: string }>("/chat-with-paper", {
    query,
  });
  return response.data;
};

export const analyzeExistingPaper = async (filename: string): Promise<AnalysisResponse> => {
  const response = await api.post<AnalysisResponse>("/analyze-existing", {
    filename,
  });
  return response.data;
};

export const voiceSummary = async (summary: string): Promise<{ message: string; spoken_summary: string }> => {
  const response = await api.post<{ message: string; spoken_summary: string }>("/voice-summary", {
    summary,
  });
  return response.data;
};

export const voiceRecognize = async (): Promise<{ success: boolean; text?: string; error?: string }> => {
  const response = await api.post<{ success: boolean; text?: string; error?: string }>("/voice-recognize");
  return response.data;
};

export interface ExportResponse {
  message: string;
  reports: {
    pdf: string;
    docx: string;
    pptx: string;
  };
}

export interface TrendResponse {
  detected_topics: string[];
  topic_frequency: Record<string, number>;
  growth_predictions: Record<string, { growth_score: number; growth_level: string }>;
  trend_classifications: Record<string, string>;
  future_forecasts: string[];
}

export interface RecommendationResponse {
  detected_interests: string[];
  personalized_feed: {
    recommended_paper: string;
    authors: string[];
    summary: string;
    published_date: string;
    similarity_score: number;
    pdf_link: string;
  }[];
}

export const exportReports = async (
  title: string,
  summary: string,
  critique: string
): Promise<ExportResponse> => {
  const response = await api.post<ExportResponse>("/export/reports", {
    title,
    summary,
    critique,
  });
  return response.data;
};

export const predictResearchTrends = async (papers: string[]): Promise<TrendResponse> => {
  const response = await api.post<TrendResponse>("/predict-research-trends", {
    papers,
  });
  return response.data;
};

export const getLiveRecommendations = async (
  history: string[]
): Promise<RecommendationResponse> => {
  const response = await api.post<RecommendationResponse>("/live-recommendations", {
    research_history: history,
  });
  return response.data;
};

export interface MonitoringMetrics {
  status: string;
  database: {
    users: number;
    papers: number;
    workspaces: number;
    failures: number;
  };
  system: {
    memory_usage_mb: number;
    cpu_usage_percent: number;
    redis_connected: boolean;
    chroma_connected: boolean;
  };
  traffic: {
    api_requests: number;
    api_errors: number;
    avg_response_time_ms: number;
  };
}

export const getMonitoringMetrics = async (): Promise<MonitoringMetrics> => {
  const response = await api.get<MonitoringMetrics>("/admin/monitoring/metrics");
  return response.data;
};



