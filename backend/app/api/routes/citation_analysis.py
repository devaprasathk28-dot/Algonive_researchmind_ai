from fastapi import APIRouter

from app.ai.citation_analysis.citation_extractor import (
    extract_citations
)

from app.ai.citation_analysis.author_extractor import (
    extract_authors
)

from app.ai.citation_analysis.citation_mapper import (
    map_citation_relationships
)

from app.ai.citation_analysis.impact_analyzer import (
    analyze_research_impact
)

from app.ai.citation_analysis.citation_graph import (
    build_citation_graph
)

from app.ai.citation_analysis.citation_cluster import (
    detect_citation_clusters
)

router = APIRouter()

@router.post("/citation-network-analysis")
def citation_analysis(payload: dict):

    text = payload["text"]

    # ---------------------------------
    # Citation Extraction
    # ---------------------------------

    citations = extract_citations(
        text
    )

    # ---------------------------------
    # Author Extraction
    # ---------------------------------

    authors = extract_authors(
        text
    )

    # ---------------------------------
    # Relationship Mapping
    # ---------------------------------

    relationships = (
        map_citation_relationships(
            citations
        )
    )

    # ---------------------------------
    # Impact Analysis
    # ---------------------------------

    impact_analysis = (
        analyze_research_impact(
            citations,
            authors
        )
    )

    # ---------------------------------
    # Citation Graph
    # ---------------------------------

    graph = build_citation_graph(
        relationships
    )

    # ---------------------------------
    # Cluster Detection
    # ---------------------------------

    clusters = (
        detect_citation_clusters(
            citations
        )
    )

    return {

        "citations":
            citations,

        "authors":
            authors,

        "relationships":
            relationships,

        "impact_analysis":
            impact_analysis,

        "citation_clusters":
            clusters,

        "total_nodes":
            len(graph.nodes),

        "total_edges":
            len(graph.edges)
    }
