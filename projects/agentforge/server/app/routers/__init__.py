from .agents import router as agents_router
from .categories import router as categories_router
from .stats import router as stats_router

__all__ = ["agents_router", "categories_router", "stats_router"]