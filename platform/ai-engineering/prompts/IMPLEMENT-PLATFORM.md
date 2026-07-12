# Implement the Open Claw AI Engineering Platform

You have full control of the local Open Claw setup, but this is a compatibility-first modernization.

## Objective

Audit the existing Open Claw installation and integrate the AI Engineering Platform without breaking:

- current agents
- agent names
- personalities
- `soul.md`
- `curiosity.md`
- memories
- schedules
- tools
- project context
- build workflows
- deployment workflows
- Codex usage
- Ollama usage
- cloud-model routing
- secrets and environment configuration

## Source package

Use the extracted `openclaw-ai-engineering-platform` directory as the proposed overlay.

## Mandatory rules

1. Do not overwrite any existing file during discovery.
2. Create a timestamped backup or Git branch before any mutation.
3. Audit the complete setup before proposing the final hierarchy.
4. Preserve all existing personalities.
5. Preserve original soul and curiosity files as authoritative.
6. Add extensions and bindings rather than replacing identity files.
7. Preserve existing build, run, manage, deploy, and rollback context.
8. Do not move files merely for aesthetic consistency.
9. Namespace all new platform files under:
   `platform/ai-engineering/`
10. Create a compatibility report before installation.
11. Stop and report conflicts that cannot be resolved additively.
12. Do not expose secrets to cloud models.
13. Keep Codex as the primary repository mutation agent.
14. Route private low-risk summarization to Ollama where suitable.
15. Route architecture, UX, security, and visual review to capable cloud models.
16. Verify all existing agents still load after installation.
17. Verify at least one existing project can build and run unchanged.
18. Do not change production deployment configuration without explicit approval.

## Phase 1 — Discover

Inventory:

- Open Claw root structure
- agent folders
- identity files
- skills
- schedules
- memories
- shared prompts
- project registries
- tool configurations
- model configurations
- Codex integration
- Ollama configuration
- cloud provider configuration
- environment variables by name only
- build scripts
- deployment scripts
- backup conventions
- logs and activity tracking
- permission model

Create:

`platform-modernization-audit.md`

Include:
- existing hierarchy
- agent inventory
- personality file inventory
- skill inventory
- context and memory inventory
- model-routing inventory
- build/deploy inventory
- conflicts
- risks
- obsolete or duplicated areas
- recommended target hierarchy
- migration plan
- rollback plan

## Phase 2 — Compatibility map

For each existing agent, create a proposed binding:

```yaml
agent: existing-name
preserve:
  soul: ...
  curiosity: ...
  memory: ...
  role: ...
apply:
  standards: ...
  skills: ...
reviewers: ...
model_policy: ...
```

Do not alter the agent identity.

## Phase 3 — Install overlay

Install the platform under:

```text
<openclaw-root>/platform/ai-engineering/
```

Create:

```text
<openclaw-root>/platform/ai-engineering/bindings/
<openclaw-root>/platform/ai-engineering/project-bindings/
<openclaw-root>/platform/ai-engineering/reports/
```

Copy the platform standards, skills, specialist agents, model routing, templates, and documentation.

## Phase 4 — Integrate orchestration

Update the existing orchestrator only through the least invasive supported mechanism.

Preferred order:

1. plugin or skill registration
2. additive include/reference
3. agent binding
4. wrapper prompt
5. minimal direct modification as last resort

If direct modification is required:
- back up the original
- show exact diff
- preserve original personality
- preserve existing tools
- preserve existing model behavior unless intentionally routed

## Phase 5 — Project context preservation

For each active project, generate:

```text
.openclaw/context/project-summary.md
.openclaw/context/build-and-run.md
.openclaw/context/deployment.md
.openclaw/context/architecture-decisions.md
.openclaw/context/product-language.md
.openclaw/context/personality-bindings.yaml
```

These are summaries and references. Original sources remain authoritative.

## Phase 6 — Verification

Verify:

- all existing agents load
- personalities remain recognizable
- soul and curiosity sources are unchanged
- schedules remain registered
- Codex can still operate
- Ollama can still operate
- cloud routing works
- no secret values were copied into reports
- an existing project builds unchanged
- a sample UI task invokes UX, visual review, and QA gates
- a sample backend task invokes engineering and QA gates
- release manager can produce a release decision
- uninstall or rollback works

## Phase 7 — Final recommendation

Return:

1. exact changes made
2. exact files added
3. any files modified
4. before/after hierarchy
5. agent bindings
6. model-routing decisions
7. preserved personality evidence
8. build/deploy preservation evidence
9. test results
10. unresolved risks
11. recommended next improvements

Do not mark complete if the compatibility verification fails.
