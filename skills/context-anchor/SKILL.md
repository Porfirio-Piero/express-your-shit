---
name: context-anchor
version: 1.0.0
description: Recover from context compaction by scanning memory files and surfacing where you left off. Use when waking up fresh, after compaction, or when you feel lost about what you were doing.
---

# Context Anchor Skill

Helps agents recover context after compaction by scanning memory files and generating a "here's where you are" briefing.

## Why This Exists

Context compaction loses memory. Files survive. But after waking up fresh, you need to:
1. Know what you were working on
2. See decisions that were made
3. Find open loops that need closing
4. Get oriented fast

This skill automates that recovery.

---

## Quick Start

```bash
# Full briefing (default)
./scripts/anchor.sh

# Just show current task
./scripts/anchor.sh --task

# Just show active context files
./scripts/anchor.sh --active

# Just show recent decisions
./scripts/anchor.sh --decisions

# Show open loops / questions
./scripts/anchor.sh --loops

# Scan specific number of days back
./scripts/anchor.sh --days 3
```

---

## What It Scans

| Source | What It Extracts |
|--------|------------------|
| `memory/current-task.md` | Current task status, blockers, next steps |
| `memory/YYYY-MM-DD.md` | Recent daily logs (last 2 days by default) |
| `context/active/*.md` | In-progress task files |
| Daily logs | Decisions (lines with "Decision:", "Decided:", "✅") |
| Daily logs | Open loops (lines with "?", "TODO:", "Blocker:", "Need to") |

---

## Output Format

The script outputs a structured briefing:

```
═══════════════════════════════════════════════════════════
                    CONTEXT ANCHOR
              Where You Left Off
═══════════════════════════════════════════════════════════

📋 CURRENT TASK
───────────────────────────────────────────────────────────
[Contents of memory/current-task.md or "No current task set"]

📂 ACTIVE CONTEXT FILES
───────────────────────────────────────────────────────────
• context/active/project-name.md (updated 2h ago)
  └─ First line preview...

🎯 RECENT DECISIONS (last 2 days)
───────────────────────────────────────────────────────────
[2026-01-30] Decision: Use Cloudflare Pages for hosting
[2026-01-30] ✅ Completed email capture setup

❓ OPEN LOOPS
───────────────────────────────────────────────────────────
[2026-01-30] Need to enable SFTP on NAS
[2026-01-30] TODO: Create Product Hunt account

═══════════════════════════════════════════════════════════
```

---

## Integration with AGENTS.md

Add to your "Every Session" routine:

```markdown
## Every Session

Before doing anything else:
1. Run `./skills/context-anchor/scripts/anchor.sh` for orientation
2. Read `SOUL.md` — this is who you are
3. Read `USER.md` — this is who you're helping
...
```

Or use it manually when you feel lost about context.

---

## Customization

### Change workspace root

```bash
WORKSPACE=/path/to/workspace ./scripts/anchor.sh
```

### Change days to scan

```bash
./scripts/anchor.sh --days 5  # Scan 5 days back
```

---

## No Dependencies

Pure bash. Uses only:
- `find`, `grep`, `head`, `tail`, `date`, `stat`
- Works on macOS and Linux
- No external tools required

---

## When to Use

- **Session start**: Quick orientation on what's happening
- **After compaction**: Recover lost context
- **Feeling lost**: "Wait, what was I doing?"
- **Handoff**: Show another agent where things stand
- **Daily review**: See what decisions were made
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
