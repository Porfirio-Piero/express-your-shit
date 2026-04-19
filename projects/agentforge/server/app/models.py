from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Association table for agent categories
agent_categories = Table(
    'agent_categories',
    Base.metadata,
    Column('agent_id', Integer, ForeignKey('agents.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(200))
    icon = Column(String(50))
    
    agents = relationship("Agent", secondary=agent_categories, back_populates="categories")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_org_id = Column(String(255), unique=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    avatar_url = Column(String(500))
    website = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    agents = relationship("Agent", back_populates="organization")
    members = relationship("User", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True)
    display_name = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(500))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organization = relationship("Organization", back_populates="members")
    agents = relationship("Agent", back_populates="author")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    readme = Column(Text)
    short_description = Column(String(200))
    version = Column(String(20), default="1.0.0")
    pricing_type = Column(String(20), default="free")  # free, paid, subscription
    price = Column(Float, default=0.0)
    pricing_unit = Column(String(20), default="request")  # request, page, month
    file_url = Column(String(500))
    docker_image = Column(String(200))
    api_endpoint = Column(String(500))
    framework = Column(String(50))
    language = Column(String(50), default="python")
    tags = Column(String(500))  # Comma-separated tags
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    rating_average = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    author = relationship("User", back_populates="agents")
    organization = relationship("Organization", back_populates="agents")
    categories = relationship("Category", secondary=agent_categories, back_populates="agents")

class AgentAnalytics(Base):
    __tablename__ = "agent_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    views = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    executions = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    
    agent = relationship("Agent")