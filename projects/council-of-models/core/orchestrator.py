"""
Council of Models - Debate Orchestrator

Manages the flow of multi-agent debates including turn-taking,
consensus tracking, and unified output generation.
"""

from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
import json
from datetime import datetime
from enum import Enum

from ..agents.agent import CouncilAgent, AgentConfig, AgentMessage
from ..agents.roles import get_role_names


class DebateStatus(Enum):
    """Status of a debate session."""
    PENDING = "pending"
    ACTIVE = "active"
    CONSENSUS_REACHED = "consensus_reached"
    MAX_ROUNDS_REACHED = "max_rounds_reached"
    PAUSED = "paused"
    ABORTED = "aborted"


class ConsensusLevel(Enum):
    """Level of agreement among agents."""
    UNANIMOUS = "unanimous"
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"
    NONE = "none"


@dataclass
class ConsensusReport:
    """Report on the consensus status."""
    level: ConsensusLevel
    agreement_score: float  # 0.0 to 1.0
    supporting_agents: List[str]
    opposing_agents: List[str]
    neutral_agents: List[str]
    key_agreements: List[str]
    key_disagreements: List[str]


@dataclass
class DebateConfig:
    """Configuration for a debate session."""
    topic: str
    max_rounds: int = 3
    min_rounds: int = 2
    consensus_threshold: float = 0.7
    speaking_order: Optional[List[str]] = None
    require_unanimity: bool = False
    auto_advance: bool = True
    pause_between_turns: bool = False
    consensus_check_interval: int = 1


@dataclass
class DebateSession:
    """A complete debate session."""
    id: str
    config: DebateConfig
    status: DebateStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    agents: List[CouncilAgent] = field(default_factory=list)
    messages: List[AgentMessage] = field(default_factory=list)
    current_round: int = 0
    consensus_reports: List[ConsensusReport] = field(default_factory=list)
    final_output: Optional[Dict] = None


@dataclass
class TurnProtocol:
    """Defines the turn-taking protocol for debates."""
    order: List[str]  # Order of agent role names
    allow_interruptions: bool = False
    max_time_per_turn: Optional[int] = None  # seconds
    allow_skipping: bool = False
    
    def get_next_agent(self, current_index: int) -> tuple:
        """Get the next agent in the rotation."""
        next_index = (current_index + 1) % len(self.order)
        if next_index == 0:
            return self.order[0], next_index, True  # New round
        return self.order[next_index], next_index, False


class ConsensusMechanism:
    """Handles consensus detection and resolution."""
    
    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold
        
    def analyze_consensus(self, messages: List[AgentMessage], 
                         topic: str) -> ConsensusReport:
        """Analyze the current state of agreement among agents."""
        
        # Get unique agents who have spoken
        agent_names = list(set([m.agent_name for m in messages]))
        
        # Count positions based on sentiment words in messages
        supporting, opposing, neutral = self._categorize_positions(messages)
        
        total = len(agent_names) if agent_names else 1
        max_agreement = max(len(supporting), len(opposing))
        agreement_score = max_agreement / total
        
        # Determine consensus level
        if agreement_score >= 0.95 and len(opposing) == 0:
            level = ConsensusLevel.UNANIMOUS
        elif agreement_score >= 0.8:
            level = ConsensusLevel.STRONG
        elif agreement_score >= self.threshold:
            level = ConsensusLevel.MODERATE
        elif agreement_score >= 0.5:
            level = ConsensusLevel.WEAK
        else:
            level = ConsensusLevel.NONE
            
        # Extract key agreements/disagreements
        key_agreements = self._extract_agreement_points(messages, topic)
        key_disagreements = self._extract_disagreement_points(messages, topic)
        
        return ConsensusReport(
            level=level,
            agreement_score=agreement_score,
            supporting_agents=supporting,
            opposing_agents=opposing,
            neutral_agents=neutral,
            key_agreements=key_agreements,
            key_disagreements=key_disagreements
        )
    
    def _categorize_positions(self, messages: List[AgentMessage]) -> tuple:
        """Categorize agent positions based on message content."""
        support_words = ['agree', 'support', 'recommend', 'proceed', 'yes', 'optimal', 
                        'best', 'should', 'favor', 'endorse', 'advocate']
        oppose_words = ['disagree', 'oppose', 'concern', 'risk', 'flaw', 'problem',
                       'avoid', 'not recommend', 'against', 'caution', 'hesitate']
        
        agent_positions = {}
        
        for msg in messages:
            name = msg.agent_name
            text = msg.content.lower()
            
            support_count = sum(1 for word in support_words if word in text)
            oppose_count = sum(1 for word in oppose_words if word in text)
            
            if support_count > oppose_count:
                agent_positions[name] = 'support'
            elif oppose_count > support_count:
                agent_positions[name] = 'oppose'
            else:
                agent_positions[name] = 'neutral'
        
        supporting = [n for n, p in agent_positions.items() if p == 'support']
        opposing = [n for n, p in agent_positions.items() if p == 'oppose']
        neutral = [n for n, p in agent_positions.items() if p == 'neutral']
        
        return supporting, opposing, neutral
    
    def _extract_agreement_points(self, messages: List[AgentMessage], 
                                  topic: str) -> List[str]:
        """Extract points where agents agree."""
        # Simplified implementation
        return [
            "General alignment on the importance of the decision",
            "Shared concern for quality and thoroughness"
        ]
    
    def _extract_disagreement_points(self, messages: List[AgentMessage],
                                     topic: str) -> List[str]:
        """Extract points where agents disagree."""
        # Simplified implementation
        return [
            "Different assessments of risk levels",
            "Varying priorities on short-term vs long-term outcomes"
        ]
    
    def is_consensus_sufficient(self, report: ConsensusReport, 
                                require_unanimity: bool = False) -> bool:
        """Check if consensus is sufficient to finalize."""
        if require_unanimity:
            return report.level == ConsensusLevel.UNANIMOUS
        return report.level in [ConsensusLevel.UNANIMOUS, ConsensusLevel.STRONG, 
                                ConsensusLevel.MODERATE]


class UnifiedOutputGenerator:
    """Generates unified output from debate results."""
    
    def generate(self, session: DebateSession) -> Dict[str, Any]:
        """Generate a unified decision from the debate."""
        
        # Get final consensus report
        consensus = session.consensus_reports[-1] if session.consensus_reports else None
        
        # Compile key points from all agents
        agent_positions = self._compile_agent_positions(session.messages)
        
        # Generate final recommendation
        recommendation = self._generate_recommendation(session, consensus)
        
        # Identify key considerations
        considerations = self._extract_considerations(session.messages)
        
        # Generate action items
        action_items = self._generate_action_items(session, consensus)
        
        # Risk assessment
        risks = self._assess_risks(session.messages)
        
        return {
            "decision": recommendation,
            "confidence": consensus.agreement_score if consensus else 0.5,
            "consensus_level": consensus.level.value if consensus else "unknown",
            "topic": session.config.topic,
            "participants": [str(a) for a in session.agents],
            "rounds_completed": session.current_round,
            "agent_positions": agent_positions,
            "key_considerations": considerations,
            "action_items": action_items,
            "risk_assessment": risks,
            "timestamp": datetime.now().isoformat(),
            "debate_summary": self._generate_summary(session)
        }
    
    def _compile_agent_positions(self, messages: List[AgentMessage]) -> Dict[str, str]:
        """Compile final positions from each agent."""
        positions = {}
        for msg in messages:
            positions[msg.agent_name] = msg.content[:200] + "..."
        return positions
    
    def _generate_recommendation(self, session: DebateSession, 
                                 consensus: Optional[ConsensusReport]) -> str:
        """Generate the final recommendation."""
        if not consensus or consensus.level == ConsensusLevel.NONE:
            return "No clear consensus reached. Further discussion required."
        
        if consensus.level == ConsensusLevel.UNANIMOUS:
            return f"Proceed with full council support. Decision has unanimous backing."
        
        if len(consensus.supporting_agents) > len(consensus.opposing_agents):
            return f"Recommendation: Proceed with the proposal. Supported by {', '.join(consensus.supporting_agents)}."
        else:
            return f"Recommendation: Do not proceed at this time. Concerns raised by {', '.join(consensus.opposing_agents)} require resolution."
    
    def _extract_considerations(self, messages: List[AgentMessage]) -> List[str]:
        """Extract key considerations from the discussion."""
        # Simplified - in production would use NLU
        return [
            "Implementation timeline and resources",
            "Risk mitigation strategies",
            "Validation and testing requirements",
            "Long-term maintenance considerations"
        ]
    
    def _generate_action_items(self, session: DebateSession,
                              consensus: Optional[ConsensusReport]) -> List[Dict]:
        """Generate action items based on the decision."""
        items = []
        
        if consensus and consensus.level != ConsensusLevel.NONE:
            items.append({
                "action": "Document the decision and rationale",
                "owner": "All agents",
                "priority": "high"
            })
            items.append({
                "action": "Create implementation plan",
                "owner": "Builder",
                "priority": "high"
            })
            
        if consensus and consensus.opposing_agents:
            items.append({
                "action": "Address concerns raised by " + ", ".join(consensus.opposing_agents),
                "owner": "Planner",
                "priority": "medium"
            })
            
        return items
    
    def _assess_risks(self, messages: List[AgentMessage]) -> List[Dict]:
        """Assess risks mentioned in the debate."""
        return [
            {"risk": "Implementation challenges", "severity": "medium", "mitigation": "Early prototyping"},
            {"risk": "Resource constraints", "severity": "low", "mitigation": "Phased approach"},
            {"risk": "Unforeseen edge cases", "severity": "medium", "mitigation": "Comprehensive testing"}
        ]
    
    def _generate_summary(self, session: DebateSession) -> str:
        """Generate a human-readable summary of the debate."""
        summary = f"Debate on '{session.config.topic}'\n"
        summary += f"Duration: {session.current_round} rounds\n"
        summary += f"Participants: {', '.join(str(a) for a in session.agents)}\n\n"
        
        for msg in session.messages:
            summary += f"{msg.agent_name}: {msg.content[:100]}...\n"
        
        return summary


class DebateOrchestrator:
    """Orchestrates multi-agent debates."""
    
    def __init__(self):
        self.consensus_mechanism = ConsensusMechanism()
        self.output_generator = UnifiedOutputGenerator()
        self.active_sessions: Dict[str, DebateSession] = {}
        
    def create_debate(self, config: DebateConfig,
                     agent_configs: List[AgentConfig]) -> DebateSession:
        """Create a new debate session."""
        
        # Create agents
        agents = [CouncilAgent(cfg) for cfg in agent_configs]
        
        # Validate speaking order
        if not config.speaking_order:
            config.speaking_order = [a.config.role_name for a in agents]
        
        # Generate session ID
        import uuid
        session_id = str(uuid.uuid4())[:8]
        
        session = DebateSession(
            id=session_id,
            config=config,
            status=DebateStatus.PENDING,
            created_at=datetime.now(),
            agents=agents,
            current_round=0
        )
        
        self.active_sessions[session_id] = session
        return session
    
    def start_debate(self, session_id: str) -> bool:
        """Start a debate session."""
        session = self.active_sessions.get(session_id)
        if not session:
            return False
            
        session.status = DebateStatus.ACTIVE
        session.started_at = datetime.now()
        session.current_round = 1
        return True
    
    def run_debate_round(self, session_id: str, 
                        message_callback: Optional[Callable] = None) -> List[AgentMessage]:
        """Run one round of the debate."""
        session = self.active_sessions.get(session_id)
        if not session or session.status != DebateStatus.ACTIVE:
            return []
        
        messages = []
        turn_protocol = TurnProtocol(order=session.config.speaking_order)
        
        # Build context from previous messages
        context = {
            'previous_messages': session.messages,
            'consensus_so_far': self._get_current_consensus_summary(session)
        }
        
        for i, role_name in enumerate(turn_protocol.order):
            # Find agent with this role
            agent = next((a for a in session.agents 
                        if a.config.role_name == role_name), None)
            if not agent:
                continue
            
            # Generate response
            msg = agent.generate_response(
                topic=session.config.topic,
                round_num=session.current_round,
                turn_num=i + 1,
                context=context
            )
            
            messages.append(msg)
            session.messages.append(msg)
            
            if message_callback:
                message_callback(msg)
        
        # Check consensus if needed
        if session.current_round % session.config.consensus_check_interval == 0:
            self._check_consensus(session)
        
        return messages
    
    def _get_current_consensus_summary(self, session: DebateSession) -> str:
        """Get a summary of current consensus."""
        if session.consensus_reports:
            report = session.consensus_reports[-1]
            return f"Current agreement: {report.level.value} ({report.agreement_score:.0%})"
        return "No consensus check yet."
    
    def _check_consensus(self, session: DebateSession) -> ConsensusReport:
        """Check and record current consensus."""
        report = self.consensus_mechanism.analyze_consensus(
            session.messages, session.config.topic
        )
        session.consensus_reports.append(report)
        
        # Check if we should end debate
        if (session.current_round >= session.config.min_rounds and 
            self.consensus_mechanism.is_consensus_sufficient(
                report, session.config.require_unanimity)):
            session.status = DebateStatus.CONSENSUS_REACHED
            
        return report
    
    def finalize_debate(self, session_id: str) -> Optional[Dict]:
        """Finalize a debate and generate output."""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        if session.status not in [DebateStatus.CONSENSUS_REACHED,
                                  DebateStatus.MAX_ROUNDS_REACHED]:
            # Force final consensus check
            self._check_consensus(session)
        
        session.status = DebateStatus.CONSENSUS_REACHED if \
            session.status == DebateStatus.ACTIVE else session.status
        session.ended_at = datetime.now()
        
        # Generate unified output
        output = self.output_generator.generate(session)
        session.final_output = output
        
        return output
    
    def get_session(self, session_id: str) -> Optional[DebateSession]:
        """Get a session by ID."""
        return self.active_sessions.get(session_id)
    
    def get_transcript(self, session_id: str, 
                      format: str = "text") -> Optional[str]:
        """Get the debate transcript in various formats."""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        if format == "text":
            lines = [f"=== COUNCIL OF MODELS DEBATE TRANSCRIPT ===\n"]
            lines.append(f"Topic: {session.config.topic}\n")
            lines.append(f"Session ID: {session_id}\n")
            lines.append(f"Rounds: {session.current_round}\n")
            lines.append(f"Status: {session.status.value}\n")
            lines.append(f"Agents: {', '.join(str(a) for a in session.agents)}\n")
            lines.append("=" * 50 + "\n\n")
            
            for msg in session.messages:
                lines.append(f"[Round {msg.round}, Turn {msg.turn}]\n")
                lines.append(f"{msg.agent_name}: {msg.content}\n\n")
            
            return "".join(lines)
        
        elif format == "json":
            return json.dumps({
                "session_id": session_id,
                "topic": session.config.topic,
                "status": session.status.value,
                "rounds": session.current_round,
                "agents": [str(a) for a in session.agents],
                "messages": [
                    {
                        "agent": m.agent_name,
                        "role": m.role,
                        "content": m.content,
                        "round": m.round,
                        "turn": m.turn
                    }
                    for m in session.messages
                ]
            }, indent=2)
        
        return None
