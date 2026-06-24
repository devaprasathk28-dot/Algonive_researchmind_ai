export interface SummaryResponse {
  tldr: string;
  section_summaries: {
    [key: string]: string;
  };
  key_contributions: string;
}

export interface CritiqueResponse {
  strengths: string;
  weaknesses: string;
  novelty_analysis: string;
  reproducibility: {
    score: number;
    analysis: string;
  };
  bias_analysis: {
    risk_level: string;
    detected_biases: string[];
  };
  research_scores: {
    novelty: number;
    clarity: number;
    technical_depth: number;
    reproducibility: number;
    dataset_quality: number;
    innovation: number;
  };
}
