#!/usr/bin/env python3
"""
Council of Models - Multi-Agent Debate System

A system where multiple AI agents with different roles debate topics
and produce unified decisions.

Usage:
    python -m council_of_models "What programming language should we use?"
    python -m council_of_models --topic "Complex decision" --rounds 5
    python -m council_of_models --list-roles
"""

import argparse
import json
from typing import List, Optional
import sys

from agents import AgentConfig, CouncilAgent, get_all_roles, format_role_summary
from core import DebateOrchestrator, DebateConfig, DebateStatus


def create_default_agents() -> List[AgentConfig]:
    """Create the default set of agents for the council."""
    return [
        AgentConfig(role_name="critic", model_name="kimi-k2.5"),
        AgentConfig(role_name="planner", model_name="kimi-k2.5"),
        AgentConfig(role_name="builder", model_name="kimi-k2.5"),
        AgentConfig(role_name="tester", model_name="kimi-k2.5"),
        AgentConfig(role_name="historian", model_name="kimi-k2.5"),
    ]


def run_debate(topic: str, rounds: int = 3, 
              require_consensus: bool = False,
              verbose: bool = False) -> dict:
    """
    Run a complete debate on the given topic.
    
    Args:
        topic: The topic to debate
        rounds: Maximum number of rounds
        require_consensus: Whether to require strong consensus to end
        verbose: Whether to print detailed output during debate
        
    Returns:
        The unified decision output
    """
    
    # Create orchestrator
    orchestrator = DebateOrchestrator()
    
    # Create debate configuration
    config = DebateConfig(
        topic=topic,
        max_rounds=rounds,
        min_rounds=2,
        consensus_threshold=0.7,
        require_unanimity=False,
        auto_advance=True
    )
    
    # Create agents
    agent_configs = create_default_agents()
    
    # Create the debate session
    session = orchestrator.create_debate(config, agent_configs)
    
    print(f"\n{'='*60}")
    print(f"  COUNCIL OF MODELS - DEBATE SESSION")
    print(f"{'='*60}")
    print(f"\nTopic: {topic}")
    print(f"Session ID: {session.id}")
    print(f"Council Members: {', '.join(str(a) for a in session.agents)}")
    print(f"Configuration: {rounds} rounds max, {config.consensus_threshold:.0%} consensus threshold")
    print(f"\n{'='*60}\n")
    
    # Start the debate
    orchestrator.start_debate(session.id)
    
    # Message callback for verbose mode
    def on_message(msg):
        if verbose:
            print(f"\n[{msg.agent_name}] {msg.role.upper()}")
            print(f"{msg.content}")
    
    # Run rounds
    for round_num in range(1, rounds + 1):
        print(f"\n--- ROUND {round_num} ---\n")
        messages = orchestrator.run_debate_round(session.id, on_message)
        
        for msg in messages:
            print(f"{msg.agent_name}: {msg.content}")
        
        # Check if consensus reached
        current_session = orchestrator.get_session(session.id)
        if current_session.status == DebateStatus.CONSENSUS_REACHED:
            print(f"\n*** Consensus reached in round {round_num}! ***")
            break
    
    # Finalize and get output
    print(f"\n{'='*60}")
    print(f"  FINALIZING DEBATE")
    print(f"{'='*60}\n")
    
    output = orchestrator.finalize_debate(session.id)
    
    return output, session.id


def print_output(output: dict, format: str = "pretty"):
    """Print the unified output in various formats."""
    
    if format == "json":
        print(json.dumps(output, indent=2))
        return
    
    # Pretty format
    print(f"\n{'='*60}")
    print(f"  UNIFIED DECISION OUTPUT")
    print(f"{'='*60}\n")
    
    print(f"📋 Topic: {output['topic']}")
    print(f"🎯 Decision: {output['decision']}")
    print(f"📊 Confidence: {output['confidence']:.0%}")
    print(f"🤝 Consensus Level: {output['consensus_level']}")
    print(f"🔄 Rounds Completed: {output['rounds_completed']}")
    print(f"👥 Participants: {', '.join(output['participants'])}")
    
    print(f"\n{'─'*60}")
    print(f"  KEY CONSIDERATIONS")
    print(f"{'─'*60}")
    for consideration in output['key_considerations']:
        print(f"  • {consideration}")
    
    print(f"\n{'─'*60}")
    print(f"  ACTION ITEMS")
    print(f"{'─'*60}")
    for item in output['action_items']:
        owner = item.get('owner', 'TBD')
        priority = item.get('priority', 'medium')
        priority_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(priority, '⚪')
        print(f"  {priority_emoji} {item['action']} (Owner: {owner})")
    
    print(f"\n{'─'*60}")
    print(f"  RISK ASSESSMENT")
    print(f"{'─'*60}")
    for risk in output['risk_assessment']:
        severity = risk.get('severity', 'unknown')
        severity_emoji = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(severity, '⚪')
        print(f"  {severity_emoji} {risk['risk']}")
        print(f"     Mitigation: {risk['mitigation']}")
    
    print(f"\n{'─'*60}")
    print(f"  AGENT POSITIONS")
    print(f"{'─'*60}")
    for agent, position in output['agent_positions'].items():
        print(f"  • {agent}: {position[:80]}...")
    
    print(f"\n{'='*60}")
    print(f"  Timestamp: {output['timestamp']}")
    print(f"{'='*60}\n")


def list_roles():
    """List all available agent roles."""
    print("\n" + "="*60)
    print("  AVAILABLE COUNCIL ROLES")
    print("="*60 + "\n")
    
    for role_name, role in get_all_roles().items():
        print(format_role_summary(role))
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Council of Models - Multi-Agent Debate System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "What programming language for a new project?"
  %(prog)s --topic "Should we adopt microservices?" --rounds 5
  %(prog)s --list-roles
  %(prog)s "Simple question" --output output.json
        """
    )
    
    parser.add_argument('topic', nargs='?', 
                       help='The topic to debate')
    parser.add_argument('-t', '--topic-flag', dest='topic_arg',
                       help='Alternative way to specify topic')
    parser.add_argument('-r', '--rounds', type=int, default=3,
                       help='Maximum number of debate rounds (default: 3)')
    parser.add_argument('-c', '--consensus', action='store_true',
                       help='Require strong consensus to end debate')
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Show detailed debate output')
    parser.add_argument('-l', '--list-roles', action='store_true',
                       help='List available agent roles')
    parser.add_argument('-o', '--output',
                       help='Save output to JSON file')
    parser.add_argument('--format', choices=['pretty', 'json'], 
                       default='pretty',
                       help='Output format (default: pretty)')
    
    args = parser.parse_args()
    
    # Handle list roles
    if args.list_roles:
        list_roles()
        return 0
    
    # Get topic
    topic = args.topic or args.topic_arg
    if not topic:
        parser.print_help()
        print("\nError: Topic is required (unless using --list-roles)")
        return 1
    
    try:
        # Run the debate
        output, session_id = run_debate(
            topic=topic,
            rounds=args.rounds,
            require_consensus=args.consensus,
            verbose=args.verbose
        )
        
        # Print output
        print_output(output, format=args.format)
        
        # Save to file if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(output, f, indent=2)
            print(f"Output saved to: {args.output}")
        
        # Also save transcript
        orchestrator = DebateOrchestrator()
        orchestrator.active_sessions[session_id] = output  # Restore session reference
        # Note: In real implementation, we'd persist the session
        
        return 0
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
