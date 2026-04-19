# AgentForge - Marketplace for Agentic Agents & Skills

## Project Overview

**Name:** AgentForge  
**Tagline:** The Hub for AI Agents - Share, Rent, and Monetize Your Agents  
**Type:** Micro-SaaS Platform  
**Status:** PRD Ready for Development

---

## Executive Summary

AgentForge is a marketplace platform where developers and businesses can discover, share, rent, and sell AI agents and agentic skills. Similar to Hugging Face but specifically designed for the agent ecosystem with built-in monetization via Cloudflare's x402 protocol.

Key differentiators:
- **x402 Monetization:** Agents pay creators directly for access using the x402 protocol
- **Agent-Readable:** All content optimized for AI consumption (Markdown for Agents standard)
- **Security-First:** Multi-layer security for code execution and agent verification
- **Skill Exchange:** Trade `.md` skill files, not just models

---

## Core Features

### 1. Agent Discovery & Browse (Public)
- Search and filter agents by category, framework, pricing
- Agent cards with live demo capabilities
- Ratings, reviews, and usage statistics
- Similar to Hugging Face model cards

### 2. Agent Publishing (Creator Portal)
- Upload agents with metadata, documentation, pricing
- Support for multiple formats: Docker containers, Python packages, API endpoints
- Version control and changelog
- README.md optimized for both humans AND agents (Markdown for Agents)

### 3. Monetization & Billing (x402 Protocol)
- **Pay-per-use:** Agents charge per API call or task execution
- **Subscription:** Monthly access to premium agents
- **x402 Integration:** Cloudflare's x402 for agent-to-agent payments
- **Escrow:** Secure payment holding until service delivery
- **Revenue Split:** 85% to creator, 15% to platform

### 4. Agent Testing & Sandbox
- Live playground to test agents before purchasing
- Isolated sandbox environment (security-focused)
- Demo inputs/outputs shown in card view
- Performance metrics (latency, success rate)

### 5. Skills Marketplace
- `.md` skill files (like SKILL.md) exchangeable commodity
- Searchable skill library
- Skill composition (combine multiple skills)
- Version control for skills

### 6. Organization & Team Management
- Create organization profiles
- Team member access control
- Private agent repositories
- Usage analytics dashboard

### 7. API & Integration
- REST API for programmatic access
- SDKs: JavaScript, Python, Go
- Webhooks for agent events
- GraphQL for flexible queries

---

## Technical Requirements

### Frontend (Next.js 14)

**Layout Inspiration:** Hugging Face + LaunchPad hybrid
- Clean, professional design
- Dark/light mode toggle
- Card-based agent display
- Code syntax highlighting for skill files
- Live agent testing interface

**Key Pages:**
1. **Home:** Featured agents, categories, trending, stats
2. **Browse:** Search/filter results with agent cards
3. **Agent Detail:** Full info, README, pricing, test playground
4. **Create/Upload:** Multi-step form for publishing agents
5. **Dashboard:** Manage your agents, analytics, earnings
6. **Organization:** Team management, private repos
7. **Pricing/Plans:** Monetization setup and revenue tracking
8. **API Docs:** Integration documentation

**Tech Stack:**
- Next.js 14 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Radix UI for primitives
- Clerk for authentication
- Recharts for analytics graphs
- Sandpack or WebContainers for live testing

### Backend (FastAPI)

**Infrastructure:**
- FastAPI + Uvicorn
- PostgreSQL (Supabase) - Agent metadata, user data, transactions
- Redis (Upstash) - Session management, x402 token cache
- MinIO/S3 - Agent assets, Docker images, SKILLS.md files
- Celery + Redis - Async task queue, agent execution

**Core APIs:**

**Authentication:**
- OAuth via Clerk
- API key management
- Organization-level auth
- Rate limiting by tier

**Agent Management:**
- CRUD for agents
- Version control
- Deployment webhook handling
- Health check endpoints

**Monetization (x402):**
- Payment intent creation
- x402 token generation
- Usage tracking and metering
- Revenue distribution
- Invoice generation

**Execution:**
- Agent sandbox execution API
- Skill composition engine
- Test environment provisioning
- Result caching

**Security:**
- API request signing
- Sandboxed execution (gVisor/Firecracker)
- Content scanning (malware detection)
- Audit logging for all executions

### Cloudflare Integration

**x402 Protocol Implementation:**
- Payment negotiation middleware
- Token validation and verification
- Rate limiting per token
- Automatic retry/backoff handling

**Markdown for Agents:**
- Structured metadata headers
- Machine-readable documentation
- Agent capability descriptors
- Pricing and usage terms

**Example x402 Flow:**
```
1. Agent A wants to use Agent B's service
2. Agent A presents x402 token from Cloudflare
3. Agent B validates token with Cloudflare
4. Agent B executes request
5. Cloudflare settles payment automatically
```

---

## Security Requirements

Given this is a marketplace for executable AI agents:

1. **Sandbox Execution:** All agents run in isolated containers (gVisor/Firecracker)
2. **Code Scanning:** Static analysis for malicious code before publishing
3. **Dependency Audit:** Track and audit all dependencies
4. **Secret Detection:** Prevent credential leaks in published agents
5. **Rate Limiting:** Multi-tier rate limiting (global, per-org, per-agent)
6. **Authentication:** Strong auth with MFA for creators
7. **Data Isolation:** Strict tenant isolation for multi-tenant SaaS
8. **Audit Logging:** All agent executions logged with full traceability
9. **DDoS Protection:** Cloudflare integration for edge protection
10. **Backup/Recovery:** Automated backups of all agent code and metadata

---

## Design Specifications

### Visual Style
- **Primary:** Deep blue/indigo (#4F46E5) - Trust, technology
- **Secondary:** Orange (#F97316) - Creativity, energy
- **Background:** White/Light gray (clean, professional)
- **Cards:** Subtle shadows, rounded corners (like Hugging Face)
- **Code Blocks:** Dark theme with syntax highlighting

### Layout
**Homepage:**
- Hero section: "Share. Discover. Monetize. The Home for AI Agents"
- Search bar (prominent)
- Category tabs: Agents, Skills, Organizations
- Featured agents carousel
- Trending / New arrivals
- Stats bar: X agents, Y executions, Z$ paid to creators
- CTA: "Publish Your Agent"

**Browse Page:**
- Sidebar filters (category, price, rating, framework)
- Agent cards (logo, name, description, price, rating)
- Grid view (default) / List view toggle
- Pagination/infinite scroll

**Agent Detail:**
- Header: Name, author, rating, price
- Tabs: Overview / README / Try It / Pricing / Versions
- Live test panel (right side)
- Action buttons: "Use This Agent" / "Rent" / "Buy"
- Similar agents carousel

**Dashboard:**
- Side navigation
- Analytics: Views, downloads, revenue
- Agent management table
- Organization settings
- Earnings payout

---

## User Stories

### Agent Creator
1. Alice builds a PDF processing agent
2. She uploads it to AgentForge with pricing ($0.01 per page)
3. Bob's agent discovers Alice's agent via API
4. Bob's agent pays via x402 to use PDF processing
5. Alice earns revenue automatically

### Agent Consumer  
1. Bob needs image recognition for his workflow
2. He searches AgentForge, finds "VisionPro v2"
3. He tests it in the sandbox (5 free calls)
4. He subscribes for $9/month
5. His agents can now call VisionPro via API

### Skill Trader
1. Carol writes `web-scraping.skill.md` with best practices
2. She lists it for $5 (one-time purchase)
3. Dave buys the skill and uses it in his agents
4. Carol earns $4.25 (after platform fee)

---

## Revenue Model

1. **Transaction Fee:** 15% on all paid agent usages
2. **Premium Listings:** $29/month for featured placement
3. **Enterprise:** Custom pricing for private marketplaces
4. **Skill Marketplace:** 10% fee on skill purchases

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
- Basic agent browsing and profiles
- Simple file upload (agents as Docker images)
- Manual payment (Stripe) - x402 comes later
- Clerk auth
- Basic dashboard

### Phase 2: x402 Integration (Week 3)
- Cloudflare x402 protocol integration
- Automatic payment settlement
- Usage metering
- Revenue dashboard

### Phase 3: Skills Marketplace (Week 4)
- SKILL.md upload and display
- Skill composition engine
- Version control

### Phase 4: Execution Sandbox (Week 5-6)
- Live agent testing
- Sandboxed execution environment
- Performance metrics

### Phase 5: Polish (Week 7-8)
- Advanced search/filtering
- Analytics improvements
- API rate limits
- Security hardening

---

## Success Metrics

- **Agents Published:** Target 100 in first month
- **Active Users:** Target 500 in first quarter
- **x402 Transactions:** Target $10,000 GMV in first quarter
- **Uptime:** 99.9%
- **Security:** Zero major incidents

---

## References

**UI Inspiration:**
- [Hugging Face](https://huggingface.co/) - Model cards, clean interface
- [LaunchPad](https://launchpad-frontend-mocha.vercel.app) - Professional SaaS layout
- [Vercel Templates](https://vercel.com/templates) - Card-based discovery
- [Stripe Apps](https://marketplace.stripe.com/) - Marketplace design

**Technology:**
- [Cloudflare x402](https://blog.cloudflare.com/markdown-for-agents/) - Agent monetization
- [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) - Standard format
- [Hugging Face Hub](https://huggingface.co/docs/hub/index) - Reference architecture

---

## Files to Create

1. `agentforge/` - Root folder
2. `client/` - Next.js frontend
3. `server/` - FastAPI backend
4. `docker/` - Container definitions
5. `docs/` - API documentation
6. `.github/workflows/` - CI/CD

---

**Priority:** HIGH  
**Tier:** 1-Core  
**Estimated Build Time:** 2 months (full platform)
**MVP:** 2 weeks
