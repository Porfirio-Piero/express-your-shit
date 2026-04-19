"""
Council of Models - Test Suite

Unit tests for the debate system.
"""

import unittest
from unittest.mock import Mock, patch
import json

# Import system components
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents import AgentRole, get_role, get_all_roles, get_role_names
from agents import CouncilAgent, AgentConfig, AgentMessage
from core import (
    DebateOrchestrator, DebateConfig, DebateSession, DebateStatus,
    ConsensusMechanism, ConsensusLevel, ConsensusReport,
    UnifiedOutputGenerator, TurnProtocol
)


class TestAgentRoles(unittest.TestCase):
    """Test agent role definitions."""
    
    def test_all_roles_exist(self):
        """Test that all five roles are defined."""
        roles = get_all_roles()
        self.assertEqual(len(roles), 5)
        self.assertIn("critic", roles)
        self.assertIn("planner", roles)
        self.assertIn("builder", roles)
        self.assertIn("tester", roles)
        self.assertIn("historian", roles)
    
    def test_role_attributes(self):
        """Test that roles have required attributes."""
        for role_name in get_role_names():
            role = get_role(role_name)
            self.assertIsNotNone(role.name)
            self.assertIsNotNone(role.title)
            self.assertIsNotNone(role.description)
            self.assertIsNotNone(role.system_prompt)
            self.assertIsInstance(role.responsibilities, list)
            self.assertGreater(len(role.responsibilities), 0)
            self.assertIsNotNone(role.speaking_style)
    
    def test_critic_role(self):
        """Test critic role specifics."""
        role = get_role("critic")
        self.assertIn("skeptical", role.system_prompt.lower())
        self.assertIn("flaw", role.system_prompt.lower())
        self.assertIn("responsibilities", [r.lower() for r in role.responsibilities])
    
    def test_planner_role(self):
        """Test planner role specifics."""
        role = get_role("planner")
        self.assertIn("strategic", role.system_prompt.lower())
        self.assertIn("long-term", role.system_prompt.lower())
    
    def test_builder_role(self):
        """Test builder role specifics."""
        role = get_role("builder")
        self.assertIn("implement", role.system_prompt.lower())
        self.assertIn("practical", role.system_prompt.lower())
    
    def test_tester_role(self):
        """Test tester role specifics."""
        role = get_role("tester")
        self.assertIn("test", role.system_prompt.lower())
        self.assertIn("edge case", role.system_prompt.lower())
    
    def test_historian_role(self):
        """Test historian role specifics."""
        role = get_role("historian")
        self.assertIn("histor", role.system_prompt.lower())
        self.assertIn("past", role.system_prompt.lower())


class TestCouncilAgent(unittest.TestCase):
    """Test CouncilAgent class."""
    
    def test_agent_creation(self):
        """Test agent initialization."""
        config = AgentConfig(role_name="critic")
        agent = CouncilAgent(config)
        
        self.assertEqual(agent.config.role_name, "critic")
        self.assertEqual(agent.name, "Critic")
        self.assertEqual(agent.role.name, "critic")
        self.assertEqual(len(agent.message_history), 0)
    
    def test_agent_system_prompt(self):
        """Test system prompt generation."""
        config = AgentConfig(role_name="planner")
        agent = CouncilAgent(config)
        
        prompt = agent.get_system_prompt("Test topic")
        self.assertIn("Planner", prompt)
        self.assertIn("Test topic", prompt)
        self.assertIn("DEBATE PROTOCOL", prompt)
    
    def test_agent_response_generation(self):
        """Test response generation (simulated)."""
        config = AgentConfig(role_name="critic")
        agent = CouncilAgent(config)
        
        msg = agent.generate_response(
            topic="What language?",
            round_num=1,
            turn_num=1
        )
        
        self.assertEqual(msg.agent_name, "Critic")
        self.assertEqual(msg.role, "critic")
        self.assertEqual(msg.round, 1)
        self.assertEqual(msg.turn, 1)
        self.assertIsNotNone(msg.content)
        self.assertGreater(len(msg.content), 0)


class TestTurnProtocol(unittest.TestCase):
    """Test turn-taking protocol."""
    
    def test_protocol_creation(self):
        """Test protocol initialization."""
        protocol = TurnProtocol(order=["critic", "planner", "builder"])
        self.assertEqual(protocol.order, ["critic", "planner", "builder"])
    
    def test_next_agent_rotation(self):
        """Test agent rotation."""
        protocol = TurnProtocol(order=["critic", "planner", "builder"])
        
        # First agent
        next_agent, idx, new_round = protocol.get_next_agent(-1)
        self.assertEqual(next_agent, "critic")
        self.assertFalse(new_round)
        
        # Rotation
        next_agent, idx, new_round = protocol.get_next_agent(0)
        self.assertEqual(next_agent, "planner")
        
        next_agent, idx, new_round = protocol.get_next_agent(1)
        self.assertEqual(next_agent, "builder")
        
        # Wrap around
        next_agent, idx, new_round = protocol.get_next_agent(2)
        self.assertEqual(next_agent, "critic")
        self.assertTrue(new_round)


class TestConsensusMechanism(unittest.TestCase):
    """Test consensus mechanism."""
    
    def setUp(self):
        self.mechanism = ConsensusMechanism(threshold=0.7)
    
    def test_unanimous_consensus(self):
        """Test unanimous consensus detection."""
        messages = [
            AgentMessage("Critic", "critic", "I support this fully", 1, 1),
            AgentMessage("Planner", "planner", "I agree completely", 1, 2),
            AgentMessage("Builder", "builder", "I endorse this", 1, 3),
            AgentMessage("Tester", "tester", "I recommend this", 1, 4),
            AgentMessage("Historian", "historian", "I support this", 1, 5),
        ]
        
        report = self.mechanism.analyze_consensus(messages, "Test")
        self.assertEqual(report.level, ConsensusLevel.UNANIMOUS)
        self.assertEqual(report.agreement_score, 1.0)
        self.assertEqual(len(report.supporting_agents), 5)
        self.assertEqual(len(report.opposing_agents), 0)
    
    def test_strong_consensus(self):
        """Test strong consensus detection."""
        messages = [
            AgentMessage("Critic", "critic", "I have concerns", 1, 1),  # Minor dissent
            AgentMessage("Planner", "planner", "I agree", 1, 2),
            AgentMessage("Builder", "builder", "I support", 1, 3),
            AgentMessage("Tester", "tester", "I agree", 1, 4),
            AgentMessage("Historian", "historian", "I support", 1, 5),
        ]
        
        report = self.mechanism.analyze_consensus(messages, "Test")
        self.assertIn(report.level, [ConsensusLevel.STRONG, ConsensusLevel.MODERATE])
        self.assertGreater(report.agreement_score, 0.6)
    
    def test_weak_consensus(self):
        """Test weak consensus detection."""
        messages = [
            AgentMessage("Critic", "critic", "I oppose this", 1, 1),
            AgentMessage("Planner", "planner", "I support this", 1, 2),
            AgentMessage("Builder", "builder", "I agree", 1, 3),
            AgentMessage("Tester", "tester", "I disagree", 1, 4),
            AgentMessage("Historian", "historian", "I agree", 1, 5),
        ]
        
        report = self.mechanism.analyze_consensus(messages, "Test")
        self.assertIn(report.level, [ConsensusLevel.WEAK, ConsensusLevel.MODERATE])
    
    def test_sufficient_consensus_check(self):
        """Test consensus sufficiency check."""
        # Unanimous
        report = ConsensusReport(
            level=ConsensusLevel.UNANIMOUS,
            agreement_score=1.0,
            supporting_agents=["All"],
            opposing_agents=[],
            neutral_agents=[],
            key_agreements=[],
            key_disagreements=[]
        )
        self.assertTrue(self.mechanism.is_consensus_sufficient(report, require_unanimity=True))
        
        # Strong without unanimity requirement
        report.level = ConsensusLevel.STRONG
        self.assertTrue(self.mechanism.is_consensus_sufficient(report, require_unanimity=False))
        self.assertFalse(self.mechanism.is_consensus_sufficient(report, require_unanimity=True))


class TestUnifiedOutputGenerator(unittest.TestCase):
    """Test output generation."""
    
    def setUp(self):
        self.generator = UnifiedOutputGenerator()
    
    def test_output_structure(self):
        """Test output has all required fields."""
        from datetime import datetime
        
        # Create mock session
        session = Mock()
        session.config.topic = "Test"
        session.current_round = 3
        session.agents = [Mock(__str__=Mock(return_value="Agent1"))]
        session.messages = []
        session.consensus_reports = []
        
        output = self.generator.generate(session)
        
        required_fields = [
            "decision", "confidence", "consensus_level", "topic",
            "participants", "rounds_completed", "agent_positions",
            "key_considerations", "action_items", "risk_assessment",
            "timestamp", "debate_summary"
        ]
        
        for field in required_fields:
            self.assertIn(field, output, f"Missing field: {field}")


class TestDebateOrchestrator(unittest.TestCase):
    """Test debate orchestration."""
    
    def setUp(self):
        self.orchestrator = DebateOrchestrator()
    
    def test_debate_creation(self):
        """Test debate session creation."""
        config = DebateConfig(
            topic="Test",
            max_rounds=3
        )
        agent_configs = [
            AgentConfig(role_name="critic"),
            AgentConfig(role_name="planner"),
        ]
        
        session = self.orchestrator.create_debate(config, agent_configs)
        
        self.assertIsNotNone(session.id)
        self.assertEqual(session.config.topic, "Test")
        self.assertEqual(session.status, DebateStatus.PENDING)
        self.assertEqual(len(session.agents), 2)
        self.assertEqual(session.current_round, 0)
        self.assertIn(session.id, self.orchestrator.active_sessions)
    
    def test_debate_start(self):
        """Test debate start."""
        config = DebateConfig(topic="Test")
        agent_configs = [AgentConfig(role_name="critic")]
        
        session = self.orchestrator.create_debate(config, agent_configs)
        result = self.orchestrator.start_debate(session.id)
        
        self.assertTrue(result)
        self.assertEqual(session.status, DebateStatus.ACTIVE)
        self.assertEqual(session.current_round, 1)
        self.assertIsNotNone(session.started_at)
    
    def test_debate_run_round(self):
        """Test running a debate round."""
        config = DebateConfig(topic="Test")
        agent_configs = [
            AgentConfig(role_name="critic"),
            AgentConfig(role_name="planner"),
        ]
        
        session = self.orchestrator.create_debate(config, agent_configs)
        self.orchestrator.start_debate(session.id)
        
        messages = self.orchestrator.run_debate_round(session.id)
        
        self.assertEqual(len(messages), 2)  # One per agent
        self.assertEqual(len(session.messages), 2)
    
    def test_debate_finalization(self):
        """Test debate finalization."""
        config = DebateConfig(topic="Test")
        agent_configs = [
            AgentConfig(role_name="critic"),
            AgentConfig(role_name="planner"),
            AgentConfig(role_name="builder"),
            AgentConfig(role_name="tester"),
            AgentConfig(role_name="historian"),
        ]
        
        session = self.orchestrator.create_debate(config, agent_configs)
        self.orchestrator.start_debate(session.id)
        
        # Run one round
        self.orchestrator.run_debate_round(session.id)
        
        output = self.orchestrator.finalize_debate(session.id)
        
        self.assertIsNotNone(output)
        self.assertIn("decision", output)
        self.assertEqual(session.status, DebateStatus.CONSENSUS_REACHED)
        self.assertIsNotNone(session.ended_at)
    
    def test_transcript_generation(self):
        """Test transcript export."""
        config = DebateConfig(topic="Test")
        agent_configs = [AgentConfig(role_name="critic")]
        
        session = self.orchestrator.create_debate(config, agent_configs)
        self.orchestrator.start_debate(session.id)
        self.orchestrator.run_debate_round(session.id)
        
        # Text format
        text_transcript = self.orchestrator.get_transcript(session.id, "text")
        self.assertIsNotNone(text_transcript)
        self.assertIn("Test", text_transcript)
        
        # JSON format
        json_transcript = self.orchestrator.get_transcript(session.id, "json")
        self.assertIsNotNone(json_transcript)
        data = json.loads(json_transcript)
        self.assertEqual(data["topic"], "Test")


class TestIntegration(unittest.TestCase):
    """Integration tests for complete flow."""
    
    def test_simple_debate_flow(self):
        """Test a complete simple debate."""
        orchestrator = DebateOrchestrator()
        
        # Configure
        config = DebateConfig(
            topic="Should we use Python or JavaScript?",
            max_rounds=2,
            min_rounds=1
        )
        agent_configs = [
            AgentConfig(role_name="critic"),
            AgentConfig(role_name="planner"),
            AgentConfig(role_name="builder"),
        ]
        
        # Create and run
        session = orchestrator.create_debate(config, agent_configs)
        orchestrator.start_debate(session.id)
        
        # Run rounds
        for _ in range(2):
            orchestrator.run_debate_round(session.id)
        
        # Finalize
        output = orchestrator.finalize_debate(session.id)
        
        # Verify
        self.assertIsNotNone(output)
        self.assertIn("decision", output)
        self.assertIn("confidence", output)
        self.assertEqual(output["rounds_completed"], 2)
        self.assertEqual(len(output["participants"]), 3)


def run_tests():
    """Run all tests."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestAgentRoles))
    suite.addTests(loader.loadTestsFromTestCase(TestCouncilAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestTurnProtocol))
    suite.addTests(loader.loadTestsFromTestCase(TestConsensusMechanism))
    suite.addTests(loader.loadTestsFromTestCase(TestUnifiedOutputGenerator))
    suite.addTests(loader.loadTestsFromTestCase(TestDebateOrchestrator))
    suite.addTests(loader.loadTestsFromTestCase(TestIntegration))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
