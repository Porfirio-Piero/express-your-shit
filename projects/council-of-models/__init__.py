"""
Council of Models - Multi-Agent Debate System

A framework for orchestrating structured debates between AI agents.
"""

__version__ = "1.0.0"
__author__ = "Council of Models"

from agents import (
    AgentRole,
    CouncilAgent,
    AgentConfig,
    AgentMessage,
    get_role,
    get_all_roles,
    get_role_names
)

from core import (
    DebateOrchestrator,
    DebateConfig,
    DebateSession,
    ConsensusMechanism,
    ConsensusReport,
    ConsensusLevel,
    UnifiedOutputGenerator,
    TurnProtocol,
    DebateStatus
)

__all__ = [
    # Version
    "__version__",
    
    # Agents
    "AgentRole",
    "CouncilAgent",
    "AgentConfig",
    "AgentMessage",
    
    # Core
    "DebateOrchestrator",
    "DebateConfig",
    "DebateSession",
    "ConsensusMechanism",
    "ConsensusReport",
    "ConsensusLevel",
    "UnifiedOutputGenerator",
    "TurnProtocol",
    "DebateStatus",
    
    # Utils
    "get_role",
    "get_all_roles",
    "get_role_names"
]
