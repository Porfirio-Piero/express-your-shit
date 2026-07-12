# Implement the Weekly Model & AI Buzz Scout

Integrate the Model & AI Buzz Scout into the existing Open Claw setup.

## Critical architecture fact

This setup uses Ollama Cloud models.

It does not run Ollama models locally.

Do not:
- inspect local GPU suitability for Ollama models
- query a local Ollama API
- recommend local quantization
- recommend local model sizes
- pull or install models
- create local benchmark jobs
- assume model files exist on this machine

## Preserve

- all existing agents
- personalities
- AGENTS.md
- SOUL.md and soul.md
- CURIOSITY.md and curiosity.md
- MEMORY.md and memory files
- TOOLS.md
- skills
- jobs
- Codex configuration
- Ollama Cloud configuration
- other cloud model providers
- build and deployment workflows
- secrets and environment variables

## Add

- Model & AI Buzz Scout agent
- weekly-model-intelligence skill
- weekly scheduled research job
- report storage
- previous-report comparison
- Telegram summary delivery

## Web research capability

Confirm that the agent can search the public internet.

Use:
- official Ollama sources
- Hugging Face
- original model publishers
- official GitHub repositories
- reputable AI and developer sources
- relevant Reddit discussions
- public benchmark or evaluation sources

If internet search is not configured, report the missing capability and the safest supported way to add it. Do not invent results.

## Schedule

Register the job using the actual Open Claw scheduler supported by this installation.

Recommended:
- Sunday at 8:00 AM America/New_York
- one full report
- one concise Telegram summary

## Reporting

Store reports by date.

The weekly Telegram summary must include:
- headline
- top three developments
- buzz versus substance
- relevance to the existing setup
- up to three recommended actions
- watchlist
- source links

## Approval policy

The Scout is recommendation-only.

It cannot:
- install or remove models
- change agent routing
- modify provider settings
- create agents or skills
- alter production configuration

without explicit owner approval.

## Verification

Demonstrate:

1. the agent can search current public sources
2. dates and sources are included
3. facts and community sentiment are separated
4. the report references the current setup without exposing private details
5. Telegram delivery works
6. no model or routing changes occur
7. previous reports are used to reduce repetition
