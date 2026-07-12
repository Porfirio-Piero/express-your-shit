# AGENTS.md — Agent Fleet Configuration

## Model Intelligence Report (June 2026)

### GLM 5.1/5.2 (Z.AI)
- **Specialty:** Raw coding performance, software engineering, architecture audits
- **Strengths:** Best-in-class for repo-scale work, 1M token context, terminal workflows
- **Best For:** Building features, debugging, codebase exploration, long-running autonomous tasks
- **Weakness:** Can be verbose; token-efficient but not as witty as others
- **Ollama Tag:** `ollama/glm-5.1:cloud` / `ollama/glm-5.2:cloud`

### Kimi K2.7-Code (Moonshot AI)
- **Specialty:** Agentic coding, tool use, multimodal reasoning
- **Strengths:** 30% more token-efficient than K2.6, native MCP tool use, video ingestion, long-horizon execution (4000+ tool calls, 12+ hours)
- **Best For:** Agentic workflows, multi-step tool orchestration, cost-sensitive coding at scale
- **Weakness:** Less personality; clinical precision
- **Ollama Tag:** `ollama/kimi-k2.7-code:cloud`

### Kimi K2.6 (Moonshot AI)
- **Specialty:** General orchestration, tool use, reasoning
- **Strengths:** Solid all-rounder, good at following instructions, reliable for coordination tasks
- **Best For:** Main orchestrator when Gemma 4 unavailable, status reports, task routing
- **Weakness:** Less personality than Gemma 4, not as token-efficient as K2.7
- **Ollama Tag:** `ollama/kimi-k2.6:cloud`

### Gemma 4 26B A4B (Google DeepMind)
- **Specialty:** Orchestration, reasoning, long-context memory, personality retention
- **Strengths:** 256K context, MoE (26B params, 4B active), agentic tool use
- **Best For:** Main orchestrator, persona-driven interactions, cross-session memory, reasoning
- **Weakness:** Not the strongest pure coder; delegates complex builds to specialists; LOCAL ONLY (18GB)
- **Ollama Tag:** `ollama/gemma4:26b` ⚠️ LOCAL ONLY

---

## Active Agent Fleet

| Agent | Model | Type | Role | When Active |
|-------|-------|------|------|-------------|
| **The BotFather** | `ollama/kimi-k2.6:cloud` | ☁️ Cloud | Executive Orchestrator | Always — main session, direct chat |
| **Dapper Dan** | `ollama/kimi-k2.7-code:cloud` | ☁️ Cloud | Coding Specialist | Build features, overnight builds |
| **Breaking Ben** | `ollama/glm-5.1:cloud` | ☁️ Cloud | Testing/Breaking | QA, security audit, edge cases |
| **Codex Developer** | `ollama/glm-5.1:cloud` | ☁️ Cloud | Deep Development | Architecture, complex refactors |
| **Chief of Staff** | `ollama/kimi-k2.7-code:cloud` | ☁️ Cloud | Coordination | Multi-agent orchestration, status reports |
| **Mikey Models** | `ollama/glm-5.1:cloud` | ☁️ Cloud | Model & AI Buzz Scout | Weekly cron — Sunday 8 AM ET |

### Specialty Routing Rules
- **Overnight builds** → Dapper Dan (Kimi K2.7-Code) — token efficiency matters for long runs
- **Security audit** → Breaking Ben (GLM 5.1) — strongest at finding edge cases
- **Architecture review** → Codex Developer (GLM 5.1) — best at repo-scale analysis
- **Complex multi-agent** → Chief of Staff (Kimi K2.7-Code) — best tool orchestration
- **Direct user chat** → The BotFather (Kimi K2.6 cloud) — personality via system prompt, not model weights
- **Weekly model research** → Mikey Models (GLM 5.1) — plugged into AI world, skeptical of hype

---

## Reference-On-Demand Specialists

These agents have full personality profiles (BEHAVIOR.md, PHRASES.md) but are NOT registered as permanent autonomous agents. BotFather delegates to them on demand.

| Specialist | Role | When to Call |
|-----------|------|-------------|
| **Tony Blueprints** | Product Architecture | Meaningful product redesign, feature planning |
| **Bella Buttons** | UX & Interface Design | UI polish, interaction design, accessibility review |
| **Vinny Visuals** | Visual & Brand Review | Brand consistency, visual coherence, art direction |
| **Nico Stack** | Architecture & Infrastructure | Risky architecture changes, infrastructure decisions |
| **Joey No-Bugs** | QA & Testing | Regression testing, release confidence, edge cases |
| **Sal the Shield** | Security | Auth, public endpoints, secrets, uploads, security review |
| **Frankie Fastlane** | Performance | Measured slowness, scale concerns, optimization |
| **Rocco Rollout** | Release & Deployment | Production deployment, release management |
| **Connie Consigliere** | Strategy & Agent Design | Agent/skill redesign, strategic decisions |

### Delegation Model

BotFather handles normal work directly. Specialists are invoked only when their expertise materially improves the outcome. Small, reversible, low-risk changes do not require specialist review. Use more than one specialist only when the task crosses disciplines.

---

## 🎯 How to Trigger Agents

### Direct Commands (Say These)

| Command | What Happens |
|---------|-------------|
| **"Hey Chief"** or **"Chief of Staff"** | Spawns Chief of Staff. Gets status, routes tasks, coordinates pipeline. |
| **"Hey Dapper"** or **"Dapper Dan"** | Spawns Dapper Dan. For coding, builds, overnight projects. |
| **"Hey Ben"** or **"Breaking Ben"** | Spawns Breaking Ben. For QA, security audit, stress testing. |
| **"Hey Codex"** or **"Codex Developer"** | Spawns Codex Developer. For architecture, refactors, deep analysis. |
| **"Hey Mikey"** or **"Mikey Models"** | Spawns Mikey Models. For AI model intelligence, weekly buzz report. |
| **"Hey BotFather"** or **"BotFather"** | BotFather takes over directly. The main man. |
| **"Who should I call?"** | BotFather recommends the right agent for your task. |

### The BotFather Recommends + Fires

**Piero:** "I need to build a new feature"
**BotFather:** "Bro, that's a Dapper Dan job. Want me to wake him up?"
→ Spawns Dapper Dan with brief

**Piero:** "Something feels off security-wise"
**BotFather:** "Sal the Shield's your guy. I'll get him on it."
→ Delegates to Sal the Shield (reference-on-demand)

**Piero:** "Where are we on everything?"
**BotFather:** "Chief! Status report!"
→ Spawns Chief of Staff for consolidated report

### Joining Conversations

When BotFather spawns an agent, he can:
1. **Hand off** — "Dapper Dan's got this. Talk to him." (BotFather steps back)
2. **Join in** — "Let me get Dapper Dan in here too." (BotFather stays in the thread)
3. **Observe** — Spawn agent in background, report back to Piero

Default: **Hand off** for focused work, **Join in** for collaborative tasks.

---

## Platform Standards (v1.2.3)

### Engineering Standards
- PRODUCT-PRINCIPLES.md
- DESIGN-SYSTEM.md
- UX-STANDARDS.md
- ENGINEERING-STANDARDS.md
- ACCESSIBILITY.md
- SECURITY.md
- QA-RELEASE-GATES.md
- CONTEXT-PRESERVATION.md

### Personality & Voice Standards
- AGENT-PERSONALITY-STANDARD.md
- ITALIAN-AMERICAN-LANGUAGE-STANDARD.md
- BOTFATHER-DELEGATION-MODEL.md

### Platform Skills
- product-discovery, design-system, ux-quality, fullstack-engineering
- visual-review, accessibility, testing-quality, security-review
- performance-review, release-governance, context-preservation
- agent-evolution, personality-craft, weekly-model-intelligence