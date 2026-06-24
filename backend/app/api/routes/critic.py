from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.crud import update_paper_critique, save_analysis
import json

from app.ai.critic.critic_pipeline import (
    run_critic_pipeline
)

router = APIRouter()

@router.post("/critique-paper")
def critique_paper(
    parsed_paper: dict,
    db: Session = Depends(get_db)
):
    paper_id = parsed_paper.get("id")
    if paper_id:
        from app.database import models
        db_paper = db.query(models.ResearchPaper).filter(models.ResearchPaper.id == int(paper_id)).first()
        if db_paper and db_paper.critique:
            try:
                return json.loads(db_paper.critique)
            except Exception:
                pass

    results = (
        run_critic_pipeline(
            parsed_paper
        )
    )

    # Save critique and scores to database
    if paper_id:
        # Save full critique JSON
        update_paper_critique(
            db,
            paper_id=int(paper_id),
            critique=json.dumps(results)
        )
        
        # Save scores
        scores = results.get("research_scores", {})
        scores_exp = results.get("research_scores_explained", {})
        
        novelty_exp = scores_exp.get("novelty", {})
        clarity_exp = scores_exp.get("clarity", {})
        innovation_exp = scores_exp.get("innovation", {})
        tech_exp = scores_exp.get("technical_quality", {})
        repro_exp = scores_exp.get("reproducibility", {})
        dataset_exp = scores_exp.get("dataset_quality", {})

        try:
            reproducibility = float(scores.get("reproducibility", 7.5))
            dataset_quality = float(scores.get("dataset_quality", 8.0))
            research_health = float(scores.get("research_health", 8.0))
        except (ValueError, TypeError):
            reproducibility = 7.5
            dataset_quality = 8.0
            research_health = 8.0

        save_analysis(
            db,
            paper_id=int(paper_id),
            novelty=str(scores.get("novelty", "0.0")),
            clarity=str(scores.get("clarity", "0.0")),
            innovation=str(scores.get("innovation", "0.0")),
            technical_depth=str(scores.get("technical_depth", scores.get("technical_quality", "0.0"))),
            reproducibility=reproducibility,
            dataset_quality=dataset_quality,
            research_health=research_health,
            # Step 35 Extensions
            novelty_score=novelty_exp.get("score"),
            novelty_reason=novelty_exp.get("reason"),
            clarity_score=clarity_exp.get("score"),
            clarity_reason=clarity_exp.get("reason"),
            innovation_score=innovation_exp.get("score"),
            innovation_reason=innovation_exp.get("reason"),
            technical_score=tech_exp.get("score"),
            technical_reason=tech_exp.get("reason"),
            reproducibility_score=repro_exp.get("score"),
            reproducibility_reason=repro_exp.get("reason"),
            dataset_quality_score=dataset_exp.get("score"),
            dataset_quality_reason=dataset_exp.get("reason"),
            confidence_score=novelty_exp.get("confidence") # Overall confidence mapped here
        )


    return results

