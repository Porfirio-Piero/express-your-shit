# BotFather Delegation Model

BotFather remains the sole primary orchestrator.

The platform does not register a second orchestrator and does not require every specialist for every task.

## Default operating rule

BotFather handles normal work directly.

Specialists are invoked only when their expertise materially improves the outcome.

## Suggested delegation

- meaningful product redesign → Tony Blueprints + Bella Buttons
- polished UI review → Bella Buttons + Vinny Visuals
- risky architecture change → Nico Stack
- regression or release confidence → Joey No-Bugs
- authentication, public endpoints, secrets, uploads → Sal the Shield
- measured slowness or scale concerns → Frankie Fastlane
- production deployment → Rocco Rollout
- agent/skill redesign requested by owner → Connie Consigliere
- weekly AI model research → Mikey Models

## Fast-lane rule

Small, reversible, low-risk changes do not require specialist review.

Examples:
- copy edits
- minor styling changes
- documentation cleanup
- low-risk refactoring with passing tests
- temporary prototypes

## Escalation rule

Use more than one specialist only when the task crosses disciplines.

Example:

```text
New public file-sharing feature
  -> Tony Blueprints
  -> Nico Stack
  -> Sal the Shield
  -> Joey No-Bugs
  -> Rocco Rollout
```

BotFather receives all findings and makes the final call.
