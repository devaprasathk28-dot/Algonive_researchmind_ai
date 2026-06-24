from fastapi import APIRouter
from app.comparison.comparison_pipeline import compare_two_papers
from app.ai.comparison.comparison_engine import compare_papers as old_compare_papers

router = APIRouter()

@router.post("/compare-papers")
@router.post("/api/compare-papers")
def compare_papers(
    payload: dict
):
    paper_a = payload.get("paper_a", "")
    paper_b = payload.get("paper_b", "")

    # Check if input papers are strings or dicts
    is_str = isinstance(paper_a, str) and isinstance(paper_b, str)

    if is_str:
        paper_a_dict = {
            "title": "Paper A",
            "sections": {
                "abstract": paper_a,
                "methodology": paper_a
            }
        }
        paper_b_dict = {
            "title": "Paper B",
            "sections": {
                "abstract": paper_b,
                "methodology": paper_b
            }
        }
    else:
        paper_a_dict = paper_a
        paper_b_dict = paper_b

    # Run new pipeline
    result = compare_two_papers(
        paper_a_dict,
        paper_b_dict
    )

    # Convert to text and run old compare_papers to merge accuracy, architecture and dataset flags for tests
    text_a = paper_a if is_str else "\n".join(paper_a_dict.get("sections", {}).values())
    text_b = paper_b if is_str else "\n".join(paper_b_dict.get("sections", {}).values())
    old_result = old_compare_papers(text_a, text_b)

    # Merge results
    result.update(old_result)

    return result
