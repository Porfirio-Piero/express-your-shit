from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import agents_router, categories_router, stats_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgentForge API",
    description="AI Agent Marketplace API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://agentforge.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router)
app.include_router(categories_router)
app.include_router(stats_router)

@app.get("/")
def root():
    return {
        "name": "AgentForge API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "agents": "/agents",
            "categories": "/categories",
            "stats": "/stats"
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy"}