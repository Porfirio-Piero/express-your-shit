from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from app import models, schemas
import uuid

def generate_slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace("_", "-") + "-" + str(uuid.uuid4())[:6]

# Category CRUD
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_category_by_id(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

# Organization CRUD
def create_organization(db: Session, org: schemas.OrganizationCreate, clerk_org_id: str = None):
    slug = org.name.lower().replace(" ", "-")
    if clerk_org_id:
        slug = str(clerk_org_id)
    db_org = models.Organization(
        **org.dict(),
        clerk_org_id=clerk_org_id,
        slug=slug
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

def get_organization_by_clerk_id(db: Session, clerk_org_id: str):
    return db.query(models.Organization).filter(models.Organization.clerk_org_id == clerk_org_id).first()

def get_organization_by_slug(db: Session, slug: str):
    return db.query(models.Organization).filter(models.Organization.slug == slug).first()

# User CRUD
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_clerk_id(db: Session, clerk_user_id: str):
    return db.query(models.User).filter(models.User.clerk_user_id == clerk_user_id).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Agent CRUD
def create_agent(db: Session, agent: schemas.AgentCreate, author_id: int):
    db_agent = models.Agent(**agent.dict(exclude={"category_ids"}))
    db_agent.author_id = author_id
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    
    # Add categories if provided
    if agent.category_ids:
        for category_id in agent.category_ids:
            category = get_category_by_id(db, category_id)
            if category:
                db_agent.categories.append(category)
        db.commit()
    
    return db_agent

def get_agent_by_id(db: Session, agent_id: int):
    return db.query(models.Agent).options(
        joinedload(models.Agent.author),
        joinedload(models.Agent.organization),
        joinedload(models.Agent.categories)
    ).filter(models.Agent.id == agent_id).first()

def get_agent_by_slug(db: Session, slug: str):
    return db.query(models.Agent).options(
        joinedload(models.Agent.author),
        joinedload(models.Agent.organization),
        joinedload(models.Agent.categories)
    ).filter(models.Agent.slug == slug).first()

def update_agent(db: Session, agent_id: int, agent_update: schemas.AgentUpdate):
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not db_agent:
        return None
    
    update_data = agent_update.dict(exclude={"category_ids"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_agent, field, value)
    
    # Update categories if provided
    if agent_update.category_ids is not None:
        db_agent.categories = []
        for category_id in agent_update.category_ids:
            category = get_category_by_id(db, category_id)
            if category:
                db_agent.categories.append(category)
    
    db.commit()
    db.refresh(db_agent)
    return db_agent

def delete_agent(db: Session, agent_id: int):
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if db_agent:
        db.delete(db_agent)
        db.commit()
        return True
    return False

def get_agents(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    filters: Optional[schemas.AgentSearchFilters] = None
):
    query = db.query(models.Agent).options(
        joinedload(models.Agent.author),
        joinedload(models.Agent.categories)
    )
    
    # Filter for public agents only (unless specific user filter)
    if not (filters and filters.get("user_id")):
        query = query.filter(models.Agent.is_public == True)
    
    # Apply filters
    if filters:
        if filters.get("query"):
            query = query.filter(
                models.Agent.name.ilike(f"%{filters['query']}%") |
                models.Agent.description.ilike(f"%{filters['query']}%") |
                models.Agent.tags.ilike(f"%{filters['query']}%")
            )
        if filters.get("category"):
            query = query.join(models.Agent.categories).filter(
                models.Category.name == filters["category"]
            )
        if filters.get("framework"):
            query = query.filter(models.Agent.framework == filters["framework"])
        if filters.get("pricing_type"):
            query = query.filter(models.Agent.pricing_type == filters["pricing_type"])
        if filters.get("min_price") is not None:
            query = query.filter(models.Agent.price >= filters["min_price"])
        if filters.get("max_price") is not None:
            query = query.filter(models.Agent.price <= filters["max_price"])
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    if filters:
        sort_field = filters.get("sort_by", "created_at")
        sort_order = filters.get("sort_order", "desc")
        if sort_order == "desc":
            query = query.order_by(desc(getattr(models.Agent, sort_field, models.Agent.created_at)))
        else:
            query = query.order_by(getattr(models.Agent, sort_field, models.Agent.created_at))
    else:
        query = query.order_by(desc(models.Agent.created_at))
    
    # Pagination
    agents = query.offset(skip).limit(limit).all()
    
    return agents, total

def get_featured_agents(db: Session, limit: int = 6):
    return db.query(models.Agent).options(
        joinedload(models.Agent.author)
    ).filter(
        models.Agent.is_featured == True,
        models.Agent.is_public == True
    ).order_by(desc(models.Agent.created_at)).limit(limit).all()

def increment_agent_views(db: Session, agent_id: int):
    db_agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if db_agent:
        db_agent.view_count += 1
        db.commit()
        db.refresh(db_agent)
    return db_agent

# Analytics
def get_platform_stats(db: Session):
    total_agents = db.query(func.count(models.Agent.id)).filter(models.Agent.is_public == True).scalar()
    total_users = db.query(func.count(models.User.id)).scalar()
    total_downloads = db.query(func.sum(models.Agent.download_count)).scalar() or 0
    return {
        "total_agents": total_agents,
        "total_users": total_users,
        "total_executions": total_downloads * 3,  # Estimated
        "total_revenue": total_downloads * 0.01    # Estimated
    }

def get_user_agents(db: Session, user_id: int, skip: int = 0, limit: int = 20):
    query = db.query(models.Agent).options(
        joinedload(models.Agent.author),
        joinedload(models.Agent.categories)
    ).filter(models.Agent.author_id == user_id)
    
    total = query.count()
    agents = query.order_by(desc(models.Agent.created_at)).offset(skip).limit(limit).all()
    return agents, total