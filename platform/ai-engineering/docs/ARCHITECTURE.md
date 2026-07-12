# Architecture

## 1. Compatibility-first overlay

The platform lives under a dedicated namespace:

```text
openclaw/
├── existing files and agents
└── platform/
    └── ai-engineering/
```

Existing agents do not need to move.

The orchestrator discovers:

- current agent folders
- current role files
- current `soul.md`
- current `curiosity.md`
- memory and context files
- repository conventions
- build commands
- deployment procedures
- secrets and environment conventions

It then creates adapter references rather than rewriting the originals.

## 2. Precedence model

When instructions conflict, use this order:

1. User's current explicit instruction
2. Repository-specific operational instructions
3. Existing agent personality and role constraints
4. Existing build/deploy/context conventions
5. Platform safety and quality gates
6. General platform recommendations

The platform may never erase personality merely to improve consistency.

## 3. Agent contract

Every specialist agent receives:

- task scope
- source project path
- current agent identity
- existing personality references
- existing project conventions
- applicable skills
- prohibited actions
- expected deliverable
- review evidence requirements

Specialists review or advise. The project-owner agent remains accountable for integration.

## 4. Context preservation

Each project receives a generated context index:

```text
.openclaw/
├── context/
│   ├── project-summary.md
│   ├── architecture-decisions.md
│   ├── build-and-run.md
│   ├── deployment.md
│   ├── product-language.md
│   └── personality-bindings.yaml
```

These files summarize existing behavior; they do not replace original sources.

## 5. Project lifecycle

```text
Discover
  -> Plan
  -> Design
  -> Build
  -> Verify
  -> Visual Review
  -> Security/Performance Review
  -> Release
  -> Learn
```

## 6. Minimal routing

Do not invoke every agent for every change.

Examples:

- copy change: UX Designer only
- responsive component: UX Designer + Art Director + QA
- authentication feature: Product Architect + Senior Engineer + Security + QA
- production deployment: QA + Security + Release Manager
