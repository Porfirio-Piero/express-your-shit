"""Application configuration."""
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    # App
    APP_NAME: str = "LaunchPad API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/launchpad"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/launchpad"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = Field(default="", description="Clerk secret key")
    CLERK_PUBLISHABLE_KEY: str = Field(default="", description="Clerk publishable key")
    CLERK_WEBHOOK_SECRET: str = Field(default="", description="Clerk webhook secret")
    
    # OpenAI
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    
    # Product Hunt OAuth
    PRODUCT_HUNT_CLIENT_ID: str = ""
    PRODUCT_HUNT_CLIENT_SECRET: str = ""
    PRODUCT_HUNT_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/ph/callback"
    
    # Security - no defaults, must be set via environment
    SECRET_KEY: str = Field(..., min_length=32, description="Required: App secret key (min 32 chars)")
    ENCRYPTION_KEY: str = Field(..., min_length=32, description="Required: Encryption key for tokens (min 32 chars)")
    
    # CORS
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:8000", description="Comma-separated list of allowed origins")
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Get allowed origins as list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # Rate Limiting
    RATE_LIMIT_ANONYMOUS: int = 30  # requests per minute
    RATE_LIMIT_AUTHENTICATED: int = 1000  # requests per minute
    
    # Feature Flags
    ENABLE_CELERY: bool = True
    ENABLE_OPENAI: bool = True
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.ENVIRONMENT.lower() == "development"
    
    @model_validator(mode='after')
    def validate_secrets(self):
        """Validate that secrets are not using insecure patterns."""
        insecure_patterns = [
            "change-me", "change-this", "placeholder", "default",
            "example", "password", "secret", "admin", "123456",
            "qwerty", "test", "dev", "local"
        ]
        
        # Check SECRET_KEY
        secret_lower = self.SECRET_KEY.lower()
        for pattern in insecure_patterns:
            if pattern in secret_lower:
                raise ValueError(
                    f"SECRET_KEY contains insecure pattern '{pattern}'. "
                    "Please set a secure random secret key via environment variable."
                )
        
        # Check ENCRYPTION_KEY
        enc_lower = self.ENCRYPTION_KEY.lower()
        for pattern in insecure_patterns:
            if pattern in enc_lower:
                raise ValueError(
                    f"ENCRYPTION_KEY contains insecure pattern '{pattern}'. "
                    "Please set a secure encryption key via environment variable."
                )
        
        return self


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
