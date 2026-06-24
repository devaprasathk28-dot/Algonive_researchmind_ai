from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from app.memory.memory_manager import get_research_profile
from app.models.paper import Paper

def analyze_advisor_profile(db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Combines the research profile and paper catalog to recommend next reads and domains.
    """
    profile = get_research_profile(db, user_id)
    
    domain = profile["favorite_domains"][0] if profile["favorite_domains"] else "Applied AI"
    
    next_reads = []
    if "fintech" in domain.lower() or "defi" in domain.lower() or "crypto" in domain.lower():
        next_reads = [
            {
                "title": "Uniswap v3 Core: Concentrated Liquidity Telemetry",
                "authors": "Hayden Adams et al.",
                "reason": "Seminal paper outlining tick liquidity maps. Critical baseline for slip forecasting."
            },
            {
                "title": "SoK: Decentralized Exchange Liquidities and Arbitrage",
                "authors": "Lioba Heimbach et al.",
                "reason": "Outstanding overview of cross-dex arbitrage flows and capital efficiencies."
            }
        ]
    else:
        next_reads = [
            {
                "title": "Attention Is All You Need",
                "authors": "Ashish Vaswani et al.",
                "reason": "Seminal paper on Transformer architectures, relevant to all NLP work."
            },
            {
                "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
                "authors": "Patrick Lewis et al.",
                "reason": "Core study outlining RAG pipelines and dense retrieval mechanics."
            }
        ]
        
    return {
        "profile": profile,
        "primary_domain": domain,
        "recommended_next_reads": next_reads
    }
