"""
Example Debate 1: Simple Decision - Programming Language Choice

This example demonstrates the Council of Models debating a straightforward
decision about which programming language to use for a new project.
"""

EXAMPLE_DEBATE_1 = {
    "session_id": "demo-001",
    "topic": "What programming language should we use for a new web API project?",
    "status": "completed",
    "rounds": 3,
    "agents": [
        "Critic (The Critic)",
        "Planner (The Planner)",
        "Builder (The Builder)",
        "Tester (The Tester)",
        "Historian (The Historian)"
    ],
    "transcript": """
=== COUNCIL OF MODELS DEBATE TRANSCRIPT ===
Topic: What programming language should we use for a new web API project?
Session ID: demo-001
Rounds: 3
Status: completed
Agents: Critic, Planner, Builder, Tester, Historian
==================================================

--- ROUND 1 ---

[Turn 1] Critic: I need to challenge the assumption that this approach scales well. What's our evidence? Before we even discuss languages, we need to understand the specific requirements. Are we building a simple CRUD API or something with complex business logic? What's the expected traffic volume?

[Turn 2] Planner: Strategically, this aligns with our long-term goals. Here's how we should phase it... Actually, let me step back. For a web API, we need to consider the ecosystem, hiring talent, and long-term maintenance. I'd recommend Python or JavaScript/TypeScript for their extensive libraries and large talent pools.

[Turn 3] Builder: From an implementation standpoint, we need these specific resources... Node.js or Python would let us move fast. Both have excellent frameworks (Express/Fastify vs FastAPI/Django). The practical challenge is: what's the team's existing expertise? Switching languages introduces overhead.

[Turn 4] Tester: We need to validate this with actual users before committing. Wait, let me reframe. We need to define our testing strategy. TypeScript with proper typing allows for better static analysis and catches bugs earlier. Python with mypy is good too, but JavaScript's dynamic nature is harder to test thoroughly.

[Turn 5] Historian: Historically, similar decisions in this domain have led to... I've seen this debate many times. Companies that chose trendy languages like Rust or Go for simple APIs often regretted the hiring difficulties. Conversely, those who picked standard options like Python or Node succeeded faster. The lesson: don't optimize prematurely.

--- ROUND 2 ---

[Turn 1] Critic: Have we considered what happens if our initial assumptions are wrong? What if we need to scale 10x? Node.js handles concurrency well with its event loop, but CPU-intensive tasks can block. FastAPI with async/await gives us the best of both worlds - Python's ecosystem with async performance.

[Turn 2] Planner: Looking ahead, this creates opportunities for expansion in these areas... FastAPI with Python makes sense for our use case. It has automatic OpenAPI documentation generation, which helps with adoption. In the long term, this decision sets us up for ML integration if needed.

[Turn 3] Builder: To implement this, we'd need approximately 2 weeks for a basic API with either choice. The practical challenge is deployment. Both have excellent Docker support and cloud deployment options. From a build perspective, Python with FastAPI has slightly less boilerplate.

[Turn 4] Tester: What happens when we hit scale? That's our edge case. FastAPI (Python) benchmarks very well - often comparable to Node.js for I/O bound operations. For testing, Python's pytest ecosystem is mature. How do we define success metrics? API response time < 100ms p95, 99.9% uptime.

[Turn 5] Historian: A similar situation occurred when Company X considered Go vs Python three years ago. They went with Python despite performance concerns. The lesson from that was: developer productivity and ecosystem mattered more than raw performance for a standard web API.

--- ROUND 3 ---

[Turn 1] Critic: Before we proceed, we need to address the hidden costs. Training existing staff on FastAPI specifics, setting up proper monitoring (Prometheus metrics are built-in, which helps), and ensuring we have Python expertise. I withdraw my objection - the evidence supports Python/FastAPI given our context.

[Turn 2] Planner: We should organize this into three phases: immediate, short-term, and long-term. Phase 1: Basic CRUD API. Phase 2: Authentication and rate limiting. Phase 3: Caching and optimization. This roadmap fits well with FastAPI's capabilities.

[Turn 3] Builder: The maintenance burden here is something we need to consider upfront. FastAPI's dependency injection system makes testing and modularity easier. We can leverage SQLAlchemy for ORM. The practical implementation involves: 1) Project structure, 2) Database models, 3) API endpoints, 4) Tests.

[Turn 4] Tester: I see a potential failure mode if the user context changes. But FastAPI's automatic validation with Pydantic models catches malformed requests early. We should add: unit tests (pytest), integration tests (httpx + pytest-asyncio), load tests (locust), and contract tests (schemathesis).

[Turn 5] Historian: Drawing from past experiences, we should be cautious about... Actually, I'm confident in this choice. The pattern is clear: for a team familiar with Python, building a standard web API, FastAPI is the proven choice. It combines Python's strengths with modern async patterns.

*** Consensus reached in round 3! ***

==================================================
              FINAL UNIFIED DECISION
==================================================

📋 Topic: What programming language should we use for a new web API project?
🎯 Decision: Proceed with Python and the FastAPI framework for building the web API.
📊 Confidence: 85%
🤝 Consensus Level: strong

Key Agreement Points:
- Python offers the best balance of developer productivity and ecosystem
- FastAPI provides modern async capabilities with minimal boilerplate
- Team's existing Python expertise reduces risk
- Built-in OpenAPI documentation generation aids adoption

Remaining Concerns:
- Need to ensure team training on FastAPI specifics
- Must implement comprehensive monitoring from day one
- Performance benchmarking required under production-like load

Action Items:
🔴 Create project structure and initial FastAPI setup (Owner: Builder)
🔴 Set up CI/CD pipeline with automated testing (Owner: Builder)
🟡 Document API design patterns and conventions (Owner: Planner)
🟡 Create training materials for FastAPI specifics (Owner: Historian)
🟢 Implement monitoring and alerting (Owner: Builder)
🟢 Conduct load testing before production deployment (Owner: Tester)

Risk Assessment:
🟡 Implementation challenges - FastAPI has a learning curve for advanced features
🟢 Resource constraints - Python/FastAPI has minimal resource requirements
🟡 Unforeseen edge cases - Need comprehensive testing strategy

==================================================
""",
    "decision": "Python with FastAPI is the recommended choice for the new web API project.",
    "confidence": 0.85,
    "consensus_level": "strong",
    "key_factors": [
        "Developer productivity with Python's ecosystem",
        "Modern async capabilities of FastAPI",
        "Team's existing Python expertise",
        "Built-in OpenAPI documentation",
        "Strong testing and validation capabilities"
    ]
}


def print_example_1():
    """Print the first example debate."""
    print(EXAMPLE_DEBATE_1["transcript"])


if __name__ == "__main__":
    print_example_1()
