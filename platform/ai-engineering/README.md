# Open Claw AI Engineering Platform

A non-destructive standards and agent overlay for an existing Open Claw setup using Codex, Ollama, and cloud-hosted models.

This package does **not** replace existing agents, personalities, memories, deployment conventions, or project workflows. It adds a professional software-delivery operating system around them.

## What this adds

- product architecture standards
- modern UX and design-system rules
- visual-review loops
- engineering and testing standards
- accessibility, security, and performance gates
- release governance
- specialized review agents
- a compatibility-first orchestrator
- reusable project templates
- safe installation and audit scripts
- an implementation prompt for your local Open Claw agent

## Core principle

Existing personality files remain authoritative.

This overlay may read and extend:

- `soul.md`
- `curiosity.md`
- `memory.md`
- role or persona files
- local project conventions
- deployment instructions
- repository-specific `AGENTS.md`

It must never silently overwrite them.

## Recommended installation

1. Extract this package outside your current Open Claw directory.
2. Run:

```powershell
.\scripts\audit-existing-setup.ps1 -OpenClawRoot "C:\path\to\openclaw"
```

3. Review the generated compatibility report.
4. Run:

```powershell
.\scripts\install-overlay.ps1 -OpenClawRoot "C:\path\to\openclaw"
```

The installer copies files into a namespaced directory:

```text
<openclaw-root>\platform\ai-engineering\
```

and creates no replacements unless explicitly approved.

## Operating model

The original agent remains the personality and project owner.

The platform supplies specialist reviewers:

```text
Existing Agent / Project Owner
        |
        v
Compatibility Orchestrator
        |
        +-- Product Architect
        +-- UX Designer
        +-- Art Director
        +-- Senior Engineer
        +-- QA Engineer
        +-- Security Reviewer
        +-- Performance Reviewer
        +-- Release Manager
```

The orchestrator chooses the smallest review team needed for a task.

## Model routing

- Codex: repository changes, refactors, testing, terminal workflows
- Strong cloud reasoning model: product architecture, UX critique, complex debugging
- Ollama Cloud models: private context summarization, routine checks, low-risk transformations
- Vision-capable cloud model: screenshot critique and visual QA
- Small/fast model: lint triage, documentation checks, repetitive review passes

See `config/model-routing.yaml`.

## Start here

Give your Open Claw agent:

```text
prompts/IMPLEMENT-PLATFORM.md
```

That prompt instructs it to audit your current setup, preserve personalities and context, propose the final folder hierarchy, install the overlay safely, and verify that nothing breaks.


## Cloud-model architecture

This setup assumes:

- Codex is used for repository and coding work
- Ollama is used through Ollama Cloud
- no Ollama model is run locally
- the platform contains no fixed model recommendations
- model selection and routing remain owner-controlled

The included Model & AI Buzz Scout performs weekly public internet research and reports:

- new releases
- important updates
- download and adoption momentum
- practitioner buzz
- Hugging Face activity
- Ollama announcements
- relevant Reddit discussion
- strong or unusual capabilities
- practical relevance to the current Open Claw setup

It never installs models or changes routing.
