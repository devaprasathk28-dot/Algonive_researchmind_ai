from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.settings import settings
from app.core.rate_limiter import limiter
from app.core.logger import logger
import app.core.storage

from app.api.routes.upload import router as upload_router
from app.api.routes.summarize import router as summarize_router
from app.api.routes.critic import router as critic_router
from app.api.routes.rag import router as rag_router
from app.api.routes.auth import router as auth_router

from app.api.routes.multimodal import router as multimodal_router
from app.api.routes.knowledge_graph import router as knowledge_graph_router
from app.api.routes.comparison import router as comparison_router
from app.api.routes.agentic_ai import router as agentic_ai_router
from app.api.routes.agi_director import router as agi_director_router
from app.api.routes.agi_reasoning import router as agi_reasoning_router
from app.api.routes.autonomous_execution import router as autonomous_execution_router
from app.api.routes.benchmarking import router as benchmarking_router
from app.api.routes.chat import router as chat_router
from app.api.routes.citation_analysis import router as citation_analysis_router
from app.api.routes.copilot import router as copilot_router
from app.api.routes.dataset_discovery import router as dataset_discovery_router
from app.api.routes.deployment_engine import router as deployment_engine_router
from app.api.routes.experiment_design import router as experiment_design_router
from app.api.routes.future_work import router as future_work_router
from app.api.routes.hypothesis_generation import router as hypothesis_generation_router
from app.api.routes.literature_review import router as literature_review_router
from app.api.routes.live_alerts import router as live_alerts_router
from app.api.routes.memory import router as memory_router
from app.api.routes.advisor_api import router as advisor_api_router
from app.api.routes.meta_reasoning import router as meta_reasoning_router
from app.api.routes.multi_agent import router as multi_agent_router
from app.api.routes.nas_engine import router as nas_engine_router
from app.api.routes.orchestrator import router as orchestrator_router
from app.api.routes.realtime_research import router as realtime_research_router
from app.api.routes.recommendation import router as recommendation_router
from app.api.routes.recommendations import router as recommendations_router
from app.api.routes.reviewer import router as reviewer_router
from app.api.routes.self_learning import router as self_learning_router
from app.api.routes.semantic_search import router as semantic_search_router
from app.api.routes.training_automation import router as training_automation_router
from app.api.routes.trend_prediction import router as trend_prediction_router
from app.api.routes.voice import router as voice_router
from app.api.routes.world_model import router as world_model_router
from app.api.routes.export import router as export_router, new_router as export_new_router
from app.deployment_engine.api_gateway import router as api_gateway_router
from app.api.routes.classification import router as classification_router
from app.api.routes.metrics import (
    router as metrics_router
)
from app.api.routes.library import router as library_router
from app.workspaces.workspace_routes import router as workspaces_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.discovery import router as discovery_router
from app.api.routes.feed import router as feed_router
from app.api.routes.monitoring import router as monitoring_router


from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="ResearchMind AI",
    version="1.0.0"
)

# SlowAPI configuration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

from app.core.cache import cache

@app.middleware("http")
async def track_traffic_middleware(request: Request, call_next):
    if hasattr(cache, "enabled") and cache.enabled and cache.client:
        try:
            cache.client.incr("monitoring:requests:total")
        except Exception:
            pass
            
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        if hasattr(cache, "enabled") and cache.enabled and cache.client:
            try:
                cache.client.incr("monitoring:requests:errors")
            except Exception:
                pass
        raise exc

app.mount(
    "/generated_reports",
    StaticFiles(directory="generated_reports"),
    name="generated_reports"
)

app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage"
)

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Include Routers
# -----------------------------

routers = [
    upload_router,
    summarize_router,
    critic_router,
    rag_router,
    multimodal_router,
    knowledge_graph_router,
    comparison_router,
    agentic_ai_router,
    agi_director_router,
    agi_reasoning_router,
    autonomous_execution_router,
    benchmarking_router,
    chat_router,
    citation_analysis_router,
    copilot_router,
    dataset_discovery_router,
    deployment_engine_router,
    experiment_design_router,
    future_work_router,
    hypothesis_generation_router,
    literature_review_router,
    live_alerts_router,
    memory_router,
    advisor_api_router,
    meta_reasoning_router,
    multi_agent_router,
    nas_engine_router,
    orchestrator_router,
    realtime_research_router,
    recommendation_router,
    recommendations_router,
    reviewer_router,
    self_learning_router,
    semantic_search_router,
    training_automation_router,
    trend_prediction_router,
    voice_router,
    world_model_router,
    export_router,
    export_new_router,
    api_gateway_router,
    classification_router,
    metrics_router,
    library_router,
    auth_router,
    workspaces_router,
    dashboard_router,
    discovery_router,
    feed_router,
    monitoring_router,
]

# Include each router twice: once normally, once under "/api" prefix
for r in routers:
    app.include_router(r)
    app.include_router(r, prefix="/api")

# -----------------------------
# Root Route
# -----------------------------

@app.get("/")
def home():
    return {
        "message":
            "ResearchMind AI Backend Running"
    }

@app.get("/health")
def health():
    return {
        "status": "ok"
    }

