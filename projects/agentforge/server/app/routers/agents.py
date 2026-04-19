from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, crud
from app.database import get_db
import os
import shutil

router = APIRouter(prefix="/agents", tags=["agents"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=schemas.PaginatedAgentResponse)
def list_agents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    query: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    framework: Optional[str] = Query(None),
    pricing_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    filters = {
        "query": query,
        "category": category,
        "framework": framework,
        "pricing_type": pricing_type,
        "min_price": min_price,
        "max_price": max_price,
        "sort_by": sort_by,
        "sort_order": sort_order
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    
    agents, total = crud.get_agents(db, skip=skip, limit=page_size, filters=filters)
    
    return {
        "items": agents,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

@router.get("/featured", response_model=List[schemas.AgentCardResponse])
def get_featured_agents(limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    return crud.get_featured_agents(db, limit=limit)

@router.get("/search", response_model=schemas.PaginatedAgentResponse)
def search_agents(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    filters = {"query": q}
    agents, total = crud.get_agents(db, skip=skip, limit=page_size, filters=filters)
    
    return {
        "items": agents,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

@router.get("/{agent_id}", response_model=schemas.AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = crud.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.get("/slug/{slug}", response_model=schemas.AgentResponse)
def get_agent_by_slug(slug: str, db: Session = Depends(get_db)):
    agent = crud.get_agent_by_slug(db, slug)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    # Increment view count
    crud.increment_agent_views(db, agent.id)
    return agent

@router.post("/", response_model=schemas.AgentResponse)
def create_agent(
    agent: schemas.AgentCreate,
    author_id: int = 1,  # Default author for MVP
    db: Session = Depends(get_db)
):
    return crud.create_agent(db, agent, author_id)

@router.put("/{agent_id}", response_model=schemas.AgentResponse)
def update_agent(
    agent_id: int,
    agent_update: schemas.AgentUpdate,
    db: Session = Depends(get_db)
):
    db_agent = crud.update_agent(db, agent_id, agent_update)
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    result = crud.delete_agent(db, agent_id)
    if not result:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

@router.post("/{agent_id}/upload")
def upload_agent_file(
    agent_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    agent = crud.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"agent_{agent_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update agent with file URL
    agent_update = schemas.AgentUpdate(file_url=file_path)
    crud.update_agent(db, agent_id, agent_update)
    
    return {"message": "File uploaded successfully", "file_url": file_path}

@router.post("/{agent_id}/download")
def download_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = crud.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Increment download count
    agent.download_count += 1
    db.commit()
    db.refresh(agent)
    
    return {
        "download_url": agent.file_url,
        "docker_image": agent.docker_image,
        "api_endpoint": agent.api_endpoint
    }