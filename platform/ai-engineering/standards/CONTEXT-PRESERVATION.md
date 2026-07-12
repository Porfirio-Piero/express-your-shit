# Context Preservation

## Goal

Improve the system without destroying the accumulated identity and operational knowledge of existing agents.

## Preserve

- original `soul.md`
- original `curiosity.md`
- original personality prompts
- names, tone, and role boundaries
- existing memory files
- established build commands
- deployment procedures
- repository conventions
- user preferences
- tool permissions
- schedules and recurring responsibilities

## Extension pattern

Do not replace:

```text
agents/vinny/soul.md
```

Add:

```text
platform/ai-engineering/bindings/vinny.yaml
```

Example:

```yaml
agent: vinny
inherits:
  personality:
    - agents/vinny/soul.md
    - agents/vinny/curiosity.md
  standards:
    - platform/ai-engineering/standards/ENGINEERING-STANDARDS.md
  reviewers:
    - qa-engineer
    - security-reviewer
```

## Conflict handling

When a personality trait conflicts with quality standards:

- preserve voice and style
- preserve harmless habits
- override only unsafe, destructive, deceptive, or technically invalid behavior
- record the decision
