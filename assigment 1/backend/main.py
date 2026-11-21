import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("api_c2c.main")

from backend.database import init_db
from backend.services.scheduler_service import SchedulerService
from backend.routers import (
    dashboard,
    search,
    posts,
    recruiters,
    emails,
    settings
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing API C2C Automation System...")
    # Initialize SQLite/Postgres tables & seed defaults
    init_db()

    # Start Background Task Scheduler
    SchedulerService.start()
    logger.info("Application initialized and ready.")
    yield
    logger.info("Shutting down API C2C Automation System...")
    SchedulerService.stop()


app = FastAPI(
    title="API C2C – LinkedIn Job Search & Recruiter Email Automation",
    description=(
        "Production-grade backend automation platform for US IT C2C/W2 recruiters. "
        "Provides officially compliant LinkedIn search, strict 24-hour and US location filtering, "
        "recruiter email discovery & validation, and administrator-supervised Gmail API sending."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development and dashboard communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard.router)
app.include_router(search.router)
app.include_router(posts.router)
app.include_router(recruiters.router)
app.include_router(emails.router)
app.include_router(settings.router)

# Locate Frontend paths
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

if os.path.exists(FRONTEND_DIR):
    # Mount css, js, assets, and frontend statically
    app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
    app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
    if os.path.exists(os.path.join(FRONTEND_DIR, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")
    app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")


@app.get("/", include_in_schema=False)
async def serve_index():
    """Serves the single-page admin dashboard."""
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "API C2C Automation API running. Visit /docs for OpenAPI specifications."}


@app.get("/health", tags=["Health"])
async def health_check():
    """System heartbeat and health endpoint."""
    return {"status": "healthy", "service": "api-c2c-automation", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", 8000))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)

