"""
Example Debate 2: Complex Multi-Factor Decision

This example demonstrates the Council of Models debating a complex decision
with multiple factors: whether to migrate from a monolithic architecture
to microservices.
"""

EXAMPLE_DEBATE_2 = {
    "session_id": "demo-002",
    "topic": "Should we migrate our monolithic application to a microservices architecture?",
    "status": "completed",
    "rounds": 4,
    "agents": [
        "Critic (The Critic)",
        "Planner (The Planner)",
        "Builder (The Builder)",
        "Tester (The Tester)",
        "Historian (The Historian)"
    ],
    "transcript": """
=== COUNCIL OF MODELS DEBATE TRANSCRIPT ===
Topic: Should we migrate our monolithic application to a microservices architecture?
Session ID: demo-002
Rounds: 4
Status: completed
Agents: Critic, Planner, Builder, Tester, Historian
==================================================

THE CONTEXT:
- Current system: 5-year-old monolithic Java app, 500k lines of code
- Team: 15 developers
- Traffic: 10k requests/minute, growing 20% YoY
- Pain points: Slow deployments (2 hours), risky rollbacks, tight coupling
- Proposed solution: Incremental migration to containerized microservices

--- ROUND 1: Problem Definition ---

[Turn 1] Critic: Before we even discuss solutions, I need to challenge the premise. Is microservices actually the right answer? Many organizations adopted it because it was trendy, only to regret the complexity. What's the specific problem we're solving? Slow deployments could be fixed with better CI/CD practices in the monolith.

[Turn 2] Planner: Strategically, this is a critical inflection point. We're at 500k lines with 15 developers - that's entering the "modular monolith" zone. If we continue growing at 20% YoY, we'll hit scalability issues within 18 months. The question isn't IF to change, but WHAT to change to. Microservices vs modular monolith is the real debate.

[Turn 3] Builder: From an implementation perspective, we're talking about a massive undertaking. A full rewrite is suicide - "The Big Rewrite" never works. Incremental migration is the only viable path. But that requires the monolith to be somewhat modular already. If it's a big ball of mud, we'd need to refactor first anyway.

[Turn 4] Tester: How do we validate this decision? We need metrics. Current deployment frequency? Mean time to recovery? Change failure rate? These DORA metrics will tell us if our monolith is actually the problem or if we're chasing a fad. Also, what's our testing strategy during migration? We can't afford regression.

[Turn 5] Historian: This story is as old as software engineering. I've seen three major migration patterns. Pattern 1: "Big Bang" - usually fails, 18+ months of pain. Pattern 2: "Strangler Fig" - incremental, safer but slower. Pattern 3: "Modular first" - extract modules within monolith, then split. The lesson: start with Pattern 3, aim for Pattern 2.

--- ROUND 2: Risk Assessment and Options ---

[Turn 1] Critic: The flaw in this logic is assuming microservices will solve our problems. At 15 developers, we're below the "two-pizza team" threshold. We'd be creating complexity without the organizational structure to support it. Each service adds: deployment pipelines, monitoring, service discovery, distributed tracing... 

[Turn 2] Planner: In the long term, we need to think about team growth and system ownership. At our current trajectory, we'll have 25+ developers in two years. That's when monolith pain becomes acute. The strategic move is to lay groundwork NOW: define bounded contexts, establish API contracts, build deployment automation.

[Turn 3] Builder: The practical challenge is: we don't have DevOps expertise. Microservices require: Kubernetes (or equivalent), service mesh, observability stack, circuit breakers, distributed transactions. To implement microservices, we need to invest heavily in platform capabilities first. Otherwise, we're trading code complexity for operational complexity.

[Turn 4] Tester: What happens when... a service goes down? Network partitions? Cascading failures? These are the edge cases of distributed systems. Our current monolith is "all or nothing" - simple but fragile in some ways. Microservices add failure modes we haven't dealt with. We need chaos engineering practices.

[Turn 5] Historian: A similar situation occurred when Company Y migrated at this scale. They underestimated the operational complexity. After 2 years, they ended up with distributed monolith - worst of both worlds. The lesson learned was: organizational readiness matters more than technical readiness. Do we have autonomous teams with clear ownership?

--- ROUND 3: Hybrid Approach Emerges ---

[Turn 1] Critic: I'm shifting to support a LIMITED microservices approach. Not wholesale migration, but targeted extraction. There's a clear flaw in our current architecture: the reporting module. It's read-heavy, has different scaling needs, and couples tightly to the main database. Extract that first as a proof of concept.

[Turn 2] Planner: This creates a foundation for incremental migration. I propose a phased approach: Phase 0 (3 months): Build platform capabilities - container orchestration, observability, CI/CD improvements. Phase 1 (2 months): Extract reporting service. Phase 2 (6 months): Evaluate and iterate. This way, we learn before committing fully.

[Turn 3] Builder: From a build perspective, this is achievable. To implement Phase 0, we need: containerize the monolith (no code changes, pure packaging), set up Kubernetes cluster, implement proper logging/metrics infrastructure. That's foundational work that benefits us even if we stay monolithic. I'm supportive of this cautious approach.

[Turn 4] Tester: How do we validate Phase 0 success? Metrics: deployment frequency should improve even with monolith. Rollback time should drop. Phase 1 validation: reporting service SLA must meet 99.9%, data consistency verified, failover tested. The edge case to consider is: what if reporting extraction reveals deeper coupling?

[Turn 5] Historian: This pattern has a name - it's called "Preparation Pattern." Companies that succeeded built infrastructure first, extracted low-risk services second, and only then touched critical paths. The lesson: each phase should provide value on its own. Containerization helps NOW. Observability helps NOW. Don't optimize only for the future.

--- ROUND 4: Final Consensus ---

[Turn 1] Critic: I've moved from opposed to supportive. The key was realizing we're NOT doing a big rewrite. We're doing infrastructure investment that pays off immediately, with optionality for future extraction. But let me add a constraint: we commit to ONE service extraction maximum for the next 6 months. No microservices proliferation.

[Turn 2] Planner: In alignment with The Critic's constraint. We should organize this into clear gates: Gate 0 - Platform ready (monitoring, containerization, CD). Gate 1 - Reporting service extracted and validated. Gate 2 - Organizational readiness assessment (team autonomy, ownership). Only then consider Gate 3: next service extraction.

[Turn 3] Builder: To implement this, resource-wise: we need a Platform Engineer for 3 months (hire or train). The practical challenge is parallel work - we can't stop feature development. Solution: 20% time allocation from 2-3 senior engineers. With proper task switching, this won't block product work.

[Turn 4] Tester: Validation strategy agreed: DORA metrics baseline → track improvement. Success criteria for Phase 0: deployment time < 15 min, MTTR < 30 min. For Phase 1: reporting service handles 10x current load in testing. I've verified no significant risks - if we fail, we still have containerized monolith, which is a win.

[Turn 5] Historian: Drawing from all our collective wisdom... this is the right approach at the right time. Historically, migrations fail when they try to do too much too fast. Our phased, reversible approach mitigates that. The key lesson: every step should be valuable in isolation. Platform work helps immediately. One extraction proves the concept.

*** Consensus reached in round 4! ***

==================================================
              FINAL UNIFIED DECISION
==================================================

📋 Topic: Should we migrate our monolithic application to a microservices architecture?
🎯 Decision: Proceed with a phased, incremental approach starting with infrastructure modernization
📊 Confidence: 82%
🤝 Consensus Level: strong

The Council's Unified Decision:

1. DO NOT undertake wholesale migration to microservices
2. DO invest in platform capabilities (containerization, observability, improved CI/CD)
3. AFTER infrastructure is ready, extract ONE low-risk service (reporting) as proof of concept
4. ONLY after organizational readiness is validated, consider further extractions

Key Agreement Points:
- Infrastructure investment is valuable independent of microservices decision
- "Strangler Fig" pattern with clear gates is the right approach
- Organizational readiness (team structure, DevOps culture) is critical
- Each phase must provide standalone value and be reversible

Key Disagreement Points (Now Resolved):
- Initial proposal for wholesale migration was too risky (Critic's concern, accepted)
- Organizational size (15 devs) is borderline for microservices (agreed to prepare for growth)

Action Items:
🔴 Hire/train Platform Engineer (Owner: Leadership - external hire or upskill)
🔴 Containerize monolith (no code changes) (Owner: Builder)
🟡 Set up Kubernetes cluster and basic observability (Owner: Builder + DevOps)
🟡 Extract reporting service (Owner: Builder + new Platform team)
🟡 Define DORA metrics baseline and tracking (Owner: Tester)
🟢 Create migration decision framework (Owner: Planner)
🟢 Document "lessons learned" from Phase 1 before Phase 2 (Owner: Historian)

Timeline:
- Phase 0 (Infrastructure): 3 months
- Phase 1 (One extraction): 2 months
- Phase 2 (Decision point): 1 month
- Total before next major decision: 6 months

Risk Assessment:
🔴 Timeline overrun - mitigation: clear gates, 20% time allocation
🟡 Platform complexity - mitigation: hire experienced Platform Engineer
🟢 Feature development stall - mitigation: parallel tracks with 20% allocation
🟢 Failed extraction - mitigation: reporting is read-only, low business risk

==================================================
QUOTES FROM THE COUNCIL:

"The flaw in this logic is assuming microservices will solve our problems." - Critic
"This creates a foundation for incremental migration." - Planner
"That's foundational work that benefits us even if we stay monolithic." - Builder
"Our current monolith is 'all or nothing' - simple but fragile." - Tester
"This pattern has a name - it's called 'Preparation Pattern.'" - Historian

==================================================
""",
    "decision": "Proceed with phased infrastructure modernization, then extract one service (reporting) as a proof of concept before considering further migration.",
    "confidence": 0.82,
    "consensus_level": "strong",

    "key_factors": [
        "Infrastructure investment provides immediate value",
        "Phased approach with clear gates reduces risk",
        "Organizational readiness is prerequisite",
        "One extraction proves the concept before scaling",
        "Each phase must be reversible and valuable standalone"
    ],

    "learning_outcomes": [
        "Critic learned that incremental migration differs from big-bang",
        "Planner accepted constraint of organizational readiness gates",
        "Builder identified need for dedicated Platform Engineer",
        "Tester emphasized DORA metrics for validation",
        "Historian's pattern language helped shape the approach"
    ]
}


def print_example_2():
    """Print the second example debate."""
    print(EXAMPLE_DEBATE_2["transcript"])


if __name__ == "__main__":
    print_example_2()
