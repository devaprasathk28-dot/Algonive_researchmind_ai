from typing import List, Dict, Any

def build_roadmap(goal: str) -> List[Dict[str, Any]]:
    """
    Generate a 6-phase research roadmap to accomplish a publishing goal.
    """
    goal_clean = goal.strip() if goal else "Advance State-of-the-Art in AI"
    
    return [
        {
            "phase": "Phase 1",
            "label": "Literature Review & Grounding",
            "description": f"Gather and analyze at least 10 seminal papers related to '{goal_clean}'. Map the citation topology and extract shared methodologies.",
            "deliverable": "Synthesized literature survey document and structured research gap map."
        },
        {
            "phase": "Phase 2",
            "label": "Dataset & Benchmark Acquisition",
            "description": "Select and acquire standard benchmarks or reconstruct telemetry scraping tools (e.g., Uniswap data, SQuAD text pools). Run sanity checking distributions.",
            "deliverable": "Processed training/validation schemas and baseline statistics reports."
        },
        {
            "phase": "Phase 3",
            "label": "Baseline Model Ingestion",
            "description": "Configure the core baseline architectures (e.g. BERT, all-MiniLM, or standard CNNs) and verify training/inference loops on target hardware.",
            "deliverable": "Runnable baseline scripts scoring reproducible benchmark metrics."
        },
        {
            "phase": "Phase 4",
            "label": "Experimental Modifications",
            "description": "Implement your novel contributions (e.g. infusing sparse graphs into attention heads, removing redundant layers, adding specialized loss functions).",
            "deliverable": "Custom model source scripts and initial training run telemetry logs."
        },
        {
            "phase": "Phase 5",
            "label": "Evaluation & Ablation Studies",
            "description": "Execute comprehensive parameter searches, ablation tests, and cross-dataset evaluations. Document slippage or accuracy tradeoffs.",
            "deliverable": "Comparative performance grids, error analysis charts, and ablation validation figures."
        },
        {
            "phase": "Phase 6",
            "label": "Publication Drafting & Submissions",
            "description": "Format findings into standard IEEE/ACM double-column templates. Check novelty indices, citation centralities, and publish code repository.",
            "deliverable": "Camera-ready manuscript ready for workshop or conference submission."
        }
    ]
