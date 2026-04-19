"""
Council Agent - Individual agent participant in debates
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import json
from .roles import AgentRole, get_role


@dataclass
class AgentConfig:
    """Configuration for an agent instance."""
    role_name: str
    model_provider: str = "ollama"
    model_name: str = "kimi-k2.5"
    temperature: float = 0.7
    custom_instructions: Optional[str] = None


@dataclass
class AgentMessage:
    """A message from an agent."""
    agent_name: str
    role: str
    content: str
    round: int
    turn: int
    metadata: Dict[str, Any] = field(default_factory=dict)


class CouncilAgent:
    """An individual agent in the council."""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.role = get_role(config.role_name)
        self.name = config.role_name.capitalize()
        self.message_history: List[AgentMessage] = []
        
    def get_system_prompt(self, topic: str, context: Optional[Dict] = None) -> str:
        """Generate the system prompt for this agent."""
        base_prompt = self.role.system_prompt
        
        # Add context-specific instructions
        context_section = ""
        if context:
            context_section = f"""

=== CURRENT CONTEXT ===
Topic: {topic}
"""
            if context.get('previous_messages'):
                context_section += "\nPrevious Discussion:\n"
                for msg in context['previous_messages'][-3:]:  # Last 3 messages
                    context_section += f"\n{msg.agent_name}: {msg.content[:200]}...\n"
            
            if context.get('consensus_so_far'):
                context_section += f"\nCurrent Consensus/Unresolved Issues:\n{context['consensus_so_far']}\n"
                
        custom = ""
        if self.config.custom_instructions:
            custom = f"\n\n=== SPECIAL INSTRUCTIONS ===\n{self.config.custom_instructions}\n"
        
        debate_instructions = """

=== DEBATE PROTOCOL ===
You are participating in a structured debate. Keep your response:
- Focused (2-5 sentences for most responses)
- Relevant to your role's perspective
- Constructive and collaborative
- Professional in tone

Address your comments to the council, not just the previous speaker.
If you agree with a point, say so and add your unique perspective.
If you disagree, explain why and offer an alternative view.
"""
        
        return base_prompt + context_section + custom + debate_instructions
    
    def generate_response(self, topic: str, round_num: int, turn_num: int, 
                         context: Optional[Dict] = None) -> AgentMessage:
        """Generate a response from this agent."""
        system_prompt = self.get_system_prompt(topic, context)
        
        # This is a placeholder - in production, this would call the LLM
        # We'll create a simulated response for now
        content = self._simulate_response(topic, context, round_num)
        
        message = AgentMessage(
            agent_name=self.name,
            role=self.role.name,
            content=content,
            round=round_num,
            turn=turn_num
        )
        
        self.message_history.append(message)
        return message
    
    def _simulate_response(self, topic: str, context: Optional[Dict], round_num: int) -> str:
        """Generate a simulated response based on role."""
        # In production, this would be replaced with actual LLM calls
        responses = {
            "critic": [
                "I need to challenge the assumption that this approach scales well. What's our evidence?",
                "Have we considered what happens if our initial assumptions are wrong?",
                "There's a risk we're overlooking... Let me point out the flaw in that logic.",
                "Before we proceed, we need to address the hidden costs."
            ],
            "planner": [
                "Strategically, this aligns with our long-term goals. Here's how we should phase it...",
                "Looking ahead, this creates opportunities for expansion in these areas...",
                "In the long term, this decision sets us up for...",
                "We should organize this into three phases: immediate, short-term, and long-term."
            ],
            "builder": [
                "From an implementation standpoint, we need these specific resources...",
                "The practical challenge is integrating this with existing systems.",
                "To build this, we'd need approximately X weeks and these skills...",
                "The maintenance burden here is something we need to consider upfront."
            ],
            "tester": [
                "We need to validate this with actual users before committing.",
                "What happens when we hit scale? That's our edge case.",
                "How do we define success metrics for this decision?",
                "I see a potential failure mode if the user context changes..."
            ],
            "historian": [
                "Historically, similar decisions in this domain have led to...",
                "A case study from the past shows us that...",
                "We've seen this pattern before. The lesson learned was...",
                "Drawing from past experiences, we should be cautious about..."
            ]
        }
        
        import random
        role_responses = responses.get(self.role.name, ["I have thoughts on this matter."])
        return random.choice(role_responses)
    
    def summarize_position(self, topic: str) -> str:
        """Summarize this agent's final position on the topic."""
        return f"{self.name}: Based on my analysis of '{topic}', I believe we should proceed with caution, ensuring we address [specific concerns related to {self.role.name} perspective]."
    
    def __str__(self) -> str:
        return f"{self.name} ({self.role.title})"
    
    def __repr__(self) -> str:
        return f"CouncilAgent(role={self.role.name})"
