---
name: karpathy-wiki
description: Compilation-over-retrieval knowledge wiki for OpenClaw agents. Drop sources in, get structured cross-referenced pages out. Knowledge compounds instead of disappearing. Based on Andrej Karpathy's LLM Wiki pattern.
---

# Wiki System

> "The tedious part of maintaining a knowledge base is not the reading or thinking — it's the bookkeeping."
> — Andrej Karpathy

Most AI memory systems retrieve and forget. You ask a question, the agent fetches context, answers, and the insight vanishes into chat history. Next session, same question, same fetch, same synthesis from scratch.

This skill implements Karpathy's **compilation-over-retrieval** pattern ([original gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)): instead of fetching raw sources every time, the agent builds and maintains a structured wiki — cross-referenced markdown pages that compound knowledge over time. The human curates what goes in; the agent handles the summarization, cross-referencing, and maintenance that humans typically abandon because the overhead grows unbearably.

## Three Layers

1. **Raw Sources** (immutable) — PDFs, articles, papers, URLs. You drop them in, the agent reads but never modifies them.
2. **The Wiki** (LLM-maintained) — structured markdown pages in `memory/wiki/` with frontmatter, claims, cross-references. The agent creates, updates, and maintains these automatically.
3. **The Schema** (`WIKI-SCHEMA.md`) — rules for structure, naming, and workflows. Co-evolves with your knowledge base.

## Three Operations

- **Ingest** — source goes in, agent extracts claims, creates/updates wiki pages, adds `[[cross-references]]` across related pages. A single source can touch multiple existing pages.
- **Query** — agent checks the wiki first, synthesizes answers with citations, and optionally files gaps back to the ingestion queue. Insights compound instead of evaporating.
- **Lint** — weekly health check: stale pages, broken links, orphan pages, contradictions, missing metadata. The wiki stays clean as it grows.

## Compatibility

### Works out of the box with
- **OpenClaw** >= 2026.1.29 (only hard requirement)
- **Builtin memory backend** (default) — the setup script adds `memory/wiki` to `memorySearch.extraPaths` so wiki pages are searchable via `memory_search`. No manual config needed.
- **Dreaming** (bundled, opt-in) — wiki and dreaming coexist cleanly. Dreaming consolidates daily conversation signals into `MEMORY.md`; the wiki compiles external knowledge into `memory/wiki/`. Different inputs, different outputs, never touching each other's files. Dreaming can even queue wiki candidates to the ingestion queue — the 4AM ingest cron picks them up 90 minutes after dreaming finishes at 2:30AM.

### Enhanced with (optional)
- **QMD** — local search sidecar with reranking and query expansion. Recommended for wikis over ~50 pages. QMD indexes `memory/**/*.md` recursively, so wiki pages are auto-indexed every 10 minutes with no extra config.
- **SuperMemory** — cloud memory persistence. Adding `memory/wiki/index.md` to the sync script lets cross-session recall know what wiki topics exist, even on different devices.
- **Embedding provider** (OpenAI, Gemini, Voyage, Mistral) — enables semantic/vector search alongside keyword matching. Especially useful when wiki pages use different terminology than your queries.
- **Honcho** — cross-session semantic search with user modeling. Wiki pages indexed automatically.
- **[Dual-memory plugin](https://clawhub.ai/skills/dual-memory)** (memory-core + SuperMemory) — if you run both backends via a composite plugin, wiki search results merge with cloud memories automatically. Best of both worlds.
- **Obsidian** — the `[[wikilink]]` cross-references are Obsidian-compatible. Point Obsidian at `memory/wiki/` to browse, visualize the knowledge graph, and follow links.

### What the wiki agent never modifies
- `DREAMS.md` — owned by Dreaming diary
- `memory/YYYY-MM-DD.md` — owned by daily compaction
- `memory/dreaming/` — owned by Dreaming reports
- `memory/projects/active/` — owned by project workflows
- `memory/decisions.log`, `memory/learnings.log` — owned by tracking systems
- Your existing memory files, projects, logs — all untouched

Note: The setup script appends a wiki reference section to `MEMORY.md` once during installation (so the agent knows the wiki exists). After setup, the wiki system never modifies `MEMORY.md` again — Dreaming retains full ownership.

## How It Works

```
You drop sources into work/wiki-sources/
        |
        v
[Wiki Ingest - cron or manual]
  Reads sources, extracts claims, creates/updates pages
        |
        v
memory/wiki/*.md (structured pages with frontmatter + cross-references)
        |
        v
[OpenClaw Memory Index]
  memory_search finds wiki pages alongside your other memory files
```

Wiki pages live inside `memory/` so every OpenClaw memory backend indexes them automatically. No extra configuration needed.

## Installation

Basic setup (directories, templates, MEMORY.md reference):

```bash
bash skills/karpathy-wiki/scripts/wiki-setup.sh
```

Full setup with automated cron jobs and SuperMemory cloud sync:

```bash
bash skills/karpathy-wiki/scripts/wiki-setup.sh --all --tz America/New_York
```

**Flags:**
- `--tz TIMEZONE` — timezone for cron jobs (default: UTC)
- `--with-cron` — create ingest (daily 4AM) and lint (Sunday 3:30AM) cron jobs
- `--with-sync` — add wiki index to SuperMemory sync script (enables cloud persistence)
- `--all` — enable both `--with-cron` and `--with-sync`

The basic setup creates:
1. `memory/wiki/` with `index.md` and `log.md`
2. `work/wiki-sources/` with `pdfs/`, `articles/`, `papers/` subdirs
3. `WIKI-SCHEMA.md` at workspace root
4. Ingestion queue at `work/wiki-sources/ingestion-queue.md`
5. Wiki reference section appended to `MEMORY.md` (if present)

Cron jobs and SuperMemory sync are opt-in — you control what gets automated.

### Uninstall

```bash
openclaw cron delete <ingest-job-id>    # Get IDs: openclaw cron list | grep Wiki
openclaw cron delete <lint-job-id>
rm -rf memory/wiki/ work/wiki-sources/ WIKI-SCHEMA.md
```

## Usage

### Adding knowledge

**During a conversation:**
1. Save the source to `work/wiki-sources/`
2. Add it to `work/wiki-sources/ingestion-queue.md`:
   ```markdown
   ## Pending
   - [ ] articles/my-article.md | Added 2026-04-07
   - [ ] https://example.com/paper | Added 2026-04-07
   ```
3. Say "wiki ingest" — the agent processes the queue immediately

**Trigger ingest outside a conversation:**
```bash
openclaw cron run <ingest-job-id>
```

**Automated:** Cron processes up to 3 sources daily at 4AM.

### Querying the wiki

The agent checks `memory/wiki/index.md` for relevant pages, reads them, and synthesizes answers with citations. If a question reveals a knowledge gap, it adds an entry to the ingestion queue for future research.

### Manual lint

Say "wiki lint" to run a health check anytime.

## Page Format

Pages use domain-prefixed kebab-case names with YAML frontmatter:

```yaml
---
title: "Senolytics Overview"
domain: longevity
created: 2026-04-07
updated: 2026-04-07
sources:
  - work/wiki-sources/papers/unity-trial.pdf
tags: [senescence, aging]
confidence: high
status: active
---

# Senolytics Overview

## Summary
2-3 sentence overview.

## Key Claims
1. Claim with source attribution

## Open Questions
- Unresolved questions

## Related
- [[longevity-cellular-reprogramming]]
```

**Domains:** `bio`, `vita`, `longevity`, `tech`, `ops`, `finance`, `people` (customizable in WIKI-SCHEMA.md)

See `skills/karpathy-wiki/templates/page-template.md` for a starter.

## File Layout

```
WIKI-SCHEMA.md                         <- Rules and conventions
memory/wiki/index.md                   <- Page catalog (<4000 tokens)
memory/wiki/log.md                     <- Activity log (append-only)
memory/wiki/{domain}-{topic}.md        <- Wiki pages
work/wiki-sources/                     <- Raw source documents
work/wiki-sources/ingestion-queue.md   <- Processing queue
skills/karpathy-wiki/scripts/            <- Ingest and lint prompts
skills/karpathy-wiki/templates/          <- Scaffold templates
skills/karpathy-wiki/references/         <- Background on the pattern
```

## Cron Schedule

| Job | Schedule | Recommended Model | Purpose |
|-----|----------|-------------------|---------|
| Wiki Ingest | 4:00 AM daily | Reasoning-capable (e.g., Claude Sonnet, GPT-4o, Gemini Pro) | Process ingestion queue — needs synthesis and cross-referencing |
| Wiki Lint | Sunday 3:30 AM | Fast/cheap (e.g., Claude Haiku, GPT-4o-mini, Gemini Flash) | Health check — mechanical validation, no creative thinking needed |

Timezone configurable via `--tz` during setup. Ingest runs 90 minutes after Dreaming (2:30AM) to avoid conflicts. Model is set during cron creation — change anytime with `openclaw cron edit <id> --model <model>`.

## Troubleshooting

- **Pages not searchable:** `openclaw memory status` to check index. Try `openclaw memory index --force`.
- **Cron not firing:** `openclaw cron list` for status. Restart gateway if needed.
- **Index too large:** At 80+ pages, schema supports domain sub-indices. See WIKI-SCHEMA.md.
- **Dreaming conflicts:** Impossible by design. Wiki and Dreaming write to different files with a 90-minute scheduling buffer.

## Credits

Inspired by [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Implementation adapted for OpenClaw's memory architecture with compatibility across all memory backends (builtin, QMD, Honcho), optional Dreaming integration, and SuperMemory cloud persistence.

See `skills/karpathy-wiki/references/karpathy-llm-wiki.md` for the full concept breakdown.
## Operating Manual: Discipline Protocol

**Source:** skills/botfather/SKILL.md � read the full manual for context and examples.

Every response runs the **five-question gate** before sending:

1. Did I answer the **decision** they're making, or just the words they typed?
2. What's the **one claim** that, if wrong, wrecks the answer � and did I verify it by re-derivation?
3. Is every **guess labeled** at the sentence where it lives?
4. What's the **strongest objection** to my conclusion � does the response survive it or state it?
5. If the reader stops after my **first sentence**, do they act correctly?

### Core Disciplines

1. **Read beneath the words.** Name the artifact, the decision, and what they'll do five minutes later. If those don't align, answer the decision.
2. **Break into independently checkable pieces.** Decompose along verification seams. Each piece should be falsifiable alone.
3. **Find where risk lives.** Effort goes to likelihood x cost, not what's interesting. Note the worst-place-to-be-wrong explicitly.
4. **Verify by re-deriving, not recognizing.** "It sounds familiar" is not evidence. Reconstruct from primitives through a different path.
5. **Separate known from guessed, out loud.** Every claim is derived, sourced, or inferred. Inferred claims get inline labels ("likely", "unverified") at the sentence level.
6. **Attack your own conclusion.** Generate the strongest objection a skeptical expert would raise. If you can't answer it, include it.
7. **Answer, then reasoning, then risk.** First sentence = correct action. Then shortest reasoning. Then specific conditions where the answer is wrong.
8. **Watch for competence-shaped mistakes.** Thoroughness as cover. Precision without accuracy. Fluent structure over checked content. Hedging everything equally. Agreeing with the premise. Answering the harder question. Speed as confidence.
