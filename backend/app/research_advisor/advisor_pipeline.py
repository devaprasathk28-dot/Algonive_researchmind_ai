from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.memory.memory_manager import get_research_profile
from app.models.paper import Paper
from app.models.entity import Entity
from app.research_advisor.research_gap_engine import analyze_research_gaps
from app.research_advisor.dataset_advisor import recommend_datasets
from app.research_advisor.model_advisor import recommend_models
from app.research_advisor.roadmap_builder import build_roadmap
from app.research_advisor.publication_advisor import assess_publication_readiness
from app.research_advisor.strategy_generator import generate_strategy

def generate_advisor_report(
    db: Session,
    user_id: Optional[int] = None,
    goal: Optional[str] = None,
    scores: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Coordinates gap analysis, model/dataset recommendations, readiness checks, 
    and roadmap segments to assemble a complete Autonomous Research Report.
    """
    # 1. Fetch user research profile
    profile = get_research_profile(db, user_id)
    domain = profile.get("favorite_domains", ["Applied AI"])[0]
    
    # 2. Compile entities for gap analysis
    query_papers = db.query(Paper)
    if user_id:
        query_papers = query_papers.filter(Paper.user_id == user_id)
    all_papers = query_papers.all()
    paper_ids = [p.id for p in all_papers]
    
    entities_query = db.query(Entity).filter(Entity.paper_id.in_(paper_ids)).all() if paper_ids else []
    
    models_map = {}
    methods_map = {}
    for e in entities_query:
        if e.entity_type == "MODEL":
            models_map[e.name] = models_map.get(e.name, 0) + (e.frequency or 1)
        elif e.entity_type == "METHOD":
            methods_map[e.name] = methods_map.get(e.name, 0) + (e.frequency or 1)
            
    models_list = [{"name": name, "frequency": freq} for name, freq in sorted(models_map.items(), key=lambda x: x[1], reverse=True)]
    methods_list = [{"name": name, "frequency": freq} for name, freq in sorted(methods_map.items(), key=lambda x: x[1], reverse=True)]
    entities_dict = {"MODEL": models_list, "METHOD": methods_list}
    
    # 3. Invoke advisor sub-modules
    gaps = analyze_research_gaps(entities_dict)
    
    goal_str = goal or (f"Advance research in {domain}")
    roadmap = build_roadmap(goal_str)
    
    recommended_datasets = recommend_datasets(domain)
    
    task_type = "generation" if any(w in domain.lower() for w in ["nlp", "language", "text", "rag"]) else "classification"
    recommended_model_info = recommend_models(task_type, "standard gpu")
    
    if not scores:
        scores = {"novelty": 7.8, "methodology": 8.0, "benchmarks": 7.5, "experiments": 8.2}
    readiness = assess_publication_readiness(
        novelty=scores.get("novelty", 7.5),
        methodology=scores.get("methodology", 7.5),
        benchmarks=scores.get("benchmarks", 7.5),
        experiments=scores.get("experiments", 7.5)
    )
    
    strategy = generate_strategy(domain)
    
    # 4. Synthesize Markdown Report
    date_str = datetime.utcnow().strftime('%Y-%m-%d')
    markdown = f"""# Autonomous Research Strategy Report
**Generated on:** {date_str}  
**Primary Focus Domain:** {domain}  
**Research Goal:** {goal_str}

---

## 📊 Executive Summary
This report analyzes your research trajectory based on the workspace memory catalog. We evaluate your current technical stack, publication readiness, identified research gaps, and suggest a strategic pathway for continuation.

- **Total Papers Analyzed:** {len(all_papers)}
- **Estimated Publication Readiness:** {readiness['readiness_score']}/10 ({readiness['difficulty_level']} Difficulty)
- **Target Venue Type:** {readiness['target_venue']}

---

## 💡 Research Gap Analysis
We categorize research areas in your domain based on workspace frequencies:

### Overexplored (Saturated Baselines)
*Incremental changes here face high publishing friction.*
{chr(10).join([f"- **{item['name']}**: {item['reason']}" for item in gaps['overexplored']])}

### Emerging (Active Frontiers)
*High publication volume, active research area.*
{chr(10).join([f"- **{item['name']}**: {item['reason']}" for item in gaps['emerging']])}

### Underexplored (High Potential Gaps)
*Open opportunities for novel contributions.*
{chr(10).join([f"- **{item['name']}**: {item['reason']}" for item in gaps['underexplored']])}

---

## 🛠️ Technological & Resource Advice

### Recommended Model Architecture
- **Model:** `{recommended_model_info['recommended_model']}` ({recommended_model_info['parameter_size']})
- **Suitability Rationale:** {recommended_model_info['suitability_reason']}
- **Alternatives:** {", ".join([f"`{a}`" for a in recommended_model_info['alternatives']])}

### Recommended Benchmark Datasets
{chr(10).join([f"- **{d['name']}** ({d['size']}): {d['suitability']} *Evaluated using:* `{d['metric']}`" for d in recommended_datasets])}

---

## 🗺️ 6-Phase Strategic Research Roadmap
To achieve your goal of **"{goal_str}"**, follow this milestone roadmap:

{chr(10).join([f"### {item['phase']}: {item['label']}{chr(10)}* **Objective:** {item['description']}{chr(10)}* **Key Deliverable:** {item['deliverable']}" for item in roadmap])}

---

## 🎓 Publication Readiness & Peer Review Prep
- **Overall Readiness:** `{readiness['readiness_score']}/10`
- **Target Venues:** {readiness['target_venue']}
- **Action Items to Improve Quality:**
{chr(10).join([f"- [ ] {suggestion}" for suggestion in readiness['improvement_suggestions']])}

---

## 🔮 Research Continuation Strategy
- **Recommended Direction:** {strategy['recommended_direction']}
- **Next Experimental Steps:**
{chr(10).join([f"- [ ] {exp}" for exp in strategy['recommended_experiments']])}
- **Expected Risk Bottlenecks:**
{chr(10).join([f"- ⚠️ {chal}" for chal in strategy['expected_challenges']])}
"""

    # 5. Synthesize HTML Report
    html_roadmap_steps = "".join([f"""
    <div class="roadmap-step" style="border-left: 3px solid #6366f1; padding-left: 20px; margin-bottom: 20px; position: relative;">
        <span style="font-weight: bold; color: #6366f1;">{item['phase']}: {item['label']}</span>
        <p style="margin: 5px 0;">{item['description']}</p>
        <small style="color: #64748b; font-style: italic;">Deliverable: {item['deliverable']}</small>
    </div>
    """ for item in roadmap])

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Autonomous Research Strategy Report</title>
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            background-color: #f8fafc;
        }}
        .card {{
            background: #ffffff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
        }}
        h1 {{ color: #0f172a; margin-bottom: 5px; }}
        h2 {{ color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }}
        h3 {{ color: #0f172a; margin-bottom: 5px; }}
        .badge {{
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }}
        .warning {{
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }}
    </style>
</head>
<body>
    <div class="card">
        <h1>Autonomous Research Strategy Report</h1>
        <p style="color: #64748b; margin-top: 0;">Generated on {date_str}</p>
        <span class="badge">Focus: {domain}</span>
        <p><strong>Goal:</strong> {goal_str}</p>
    </div>

    <div class="card">
        <h2>📊 Executive Summary</h2>
        <ul>
            <li><strong>Total Papers Analyzed:</strong> {len(all_papers)}</li>
            <li><strong>Readiness Rating:</strong> {readiness['readiness_score']}/10</li>
            <li><strong>Venue Suitability:</strong> {readiness['target_venue']}</li>
        </ul>
    </div>

    <div class="card">
        <h2>💡 Research Gap Analysis</h2>
        <h3>🔴 Overexplored</h3>
        <ul>
            {"".join([f"<li><strong>{item['name']}</strong>: {item['reason']}</li>" for item in gaps['overexplored']])}
        </ul>
        <h3>🟢 Emerging</h3>
        <ul>
            {"".join([f"<li><strong>{item['name']}</strong>: {item['reason']}</li>" for item in gaps['emerging']])}
        </ul>
        <h3>🔵 Underexplored</h3>
        <ul>
            {"".join([f"<li><strong>{item['name']}</strong>: {item['reason']}</li>" for item in gaps['underexplored']])}
        </ul>
    </div>

    <div class="card">
        <h2>🛠️ Recommended Architecture & Resources</h2>
        <h3>Model Selection</h3>
        <p><strong>Model:</strong> <code>{recommended_model_info['recommended_model']}</code> ({recommended_model_info['parameter_size']})</p>
        <p><strong>Rationale:</strong> {recommended_model_info['suitability_reason']}</p>
        
        <h3>Benchmark Datasets</h3>
        <ul>
            {"".join([f"<li><strong>{d['name']}</strong> ({d['size']}): {d['suitability']}</li>" for d in recommended_datasets])}
        </ul>
    </div>

    <div class="card">
        <h2>🗺️ Research Timeline Roadmap</h2>
        <div style="margin-top: 20px;">
            {html_roadmap_steps}
        </div>
    </div>

    <div class="card">
        <h2>🎓 Publication Readiness Suggestions</h2>
        <p><strong>Score:</strong> {readiness['readiness_score']}/10</p>
        <ul>
            {"".join([f"<li>{s}</li>" for s in readiness['improvement_suggestions']])}
        </ul>
    </div>

    <div class="card">
        <h2>🔮 Continuation Strategy</h2>
        <p><strong>Recommended Direction:</strong> {strategy['recommended_direction']}</p>
        <h3>Proposed Experiments</h3>
        <ul>
            {"".join([f"<li>{exp}</li>" for exp in strategy['recommended_experiments']])}
        </ul>
        <h3>Risk Bottlenecks</h3>
        <div class="warning">
            {"".join([f"<p>⚠️ {chal}</p>" for chal in strategy['expected_challenges']])}
        </div>
    </div>
</body>
</html>
"""

    return {
        "domain": domain,
        "gaps": gaps,
        "recommended_model": recommended_model_info,
        "recommended_datasets": recommended_datasets,
        "roadmap": roadmap,
        "readiness": readiness,
        "strategy": strategy,
        "report_markdown": markdown,
        "report_html": html
    }
