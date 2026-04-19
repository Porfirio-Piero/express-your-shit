from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    clerk_org_id: Optional[str]
    slug: str
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    clerk_user_id: str

class UserResponse(UserBase):
    id: int
    clerk_user_id: str
    avatar_url: Optional[str]
    organization_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Agent Schemas
class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    readme: Optional[str] = None
    version: str = "1.0.0"
    pricing_type: str = "free"
    price: float = 0.0
    pricing_unit: str = "request"
    framework: Optional[str] = None
    language: str = "python"
    tags: Optional[str] = None
    is_public: bool = True
    docker_image: Optional[str] = None
    api_endpoint: Optional[str] = None

class AgentCreate(AgentBase):
    slug: str
    category_ids: Optional[List[int]] = []

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    readme: Optional[str] = None
    version: Optional[str] = None
    pricing_type: Optional[str] = None
    price: Optional[float] = None
    pricing_unit: Optional[str] = None
    framework: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[str] = None
    is_public: Optional[bool] = None
    docker_image: Optional[str] = None
    api_endpoint: Optional[str] = None
    category_ids: Optional[List[int]] = None

class AgentResponse(AgentBase):
    id: int
    slug: str
    file_url: Optional[str]
    author_id: int
    organization_id: Optional[int]
    view_count: int
    download_count: int
    rating_average: float
    rating_count: int
    is_featured: bool
    created_at: datetime
    updated_at: Optional[datetime]
    author: Optional[UserResponse]
    organization: Optional[OrganizationResponse]
    categories: List[CategoryResponse] = []
    
    class Config:
        from_attributes = True

class AgentCardResponse(BaseModel):
    id: int
    name: str
    slug: str
    short_description: Optional[str]
    framework: Optional[str]
    language: str
    pricing_type: str
    price: float
    rating_average: float
    rating_count: int
    download_count: int
    tags: Optional[str]
    author: Optional[UserResponse]
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Search/Filter
class AgentSearchFilters(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    framework: Optional[str] = None
    pricing_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 20

class PaginatedAgentResponse(BaseModel):
    items: List[AgentCardResponse]
    total: int
    page: int
    page_size: int
    pages: int

# Analytics
class AgentAnalyticsResponse(BaseModel):
    agent_id: int
    views: int
    downloads: int
    executions: int
    revenue: float
    date: datetime
    
    class Config:
        from_attributes = True

# Stats
class PlatformStatsResponse(BaseModel):
    total_agents: int
    total_users: int
    total_executions: int
    total_revenue: float