"""
Council of Models - Agent Module

This module provides agent definitions and configurations for the debate system.
"""

from .roles import (
    AgentRole,
    get_role,
    get_all_roles,
    get_role_names,
    format_role_summary,
    ROLES
)

from .agent import (
    CouncilAgent,
    AgentConfig,
    AgentMessage
)

__all__ = [
    'AgentRole',
    'get_role',
    'get_all_roles',
    'get_role_names',
    'format_role_summary',
    'ROLES',
    'CouncilAgent',
    'AgentConfig',
    'AgentMessage'
]
