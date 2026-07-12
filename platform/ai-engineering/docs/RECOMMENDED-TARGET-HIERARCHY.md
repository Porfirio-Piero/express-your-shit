# Recommended Target Hierarchy

This is a target, not a mandatory migration.

```text
openclaw/
├── agents/                         # existing agents remain
│   ├── vinny/
│   │   ├── soul.md
│   │   ├── curiosity.md
│   │   ├── memory.md
│   │   └── ...
│   └── ...
├── projects/                       # existing project organization remains
├── skills/                         # existing skills remain
├── platform/
│   └── ai-engineering/
│       ├── agents/
│       ├── skills/
│       ├── standards/
│       ├── config/
│       ├── templates/
│       ├── bindings/
│       ├── project-bindings/
│       ├── reports/
│       └── docs/
├── backups/
├── logs/
└── existing runtime/config files
```

Each project may optionally add:

```text
project/
├── .openclaw/
│   ├── context/
│   ├── decisions/
│   ├── reviews/
│   └── project-binding.yaml
├── AGENTS.md
└── existing project files
```
