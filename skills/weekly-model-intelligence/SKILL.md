---
name: weekly-model-intelligence
description: Research and summarize the latest AI model releases, momentum, downloads, practitioner buzz, and relevance to the current Open Claw setup.
---

# Weekly Model Intelligence

## Trigger

Run once per week or when explicitly requested.

## Research sequence

1. Read the current Open Claw environment summary and agent inventory.
2. Review official Ollama sources for model additions and updates.
3. Review Hugging Face trending and high-momentum model pages.
4. Review original publisher announcements and model cards.
5. Review recent Reddit discussion from relevant technical communities.
6. Review GitHub releases or repositories when relevant.
7. Review reputable evaluation and benchmark sources.
8. Compare findings against the previous report.
9. Remove duplicate or stale findings.
10. Produce a concise recommendation report.

## Source hierarchy

Use this trust order:

1. original model publisher
2. official Ollama or Hugging Face pages
3. original research paper or model card
4. official GitHub repository
5. reputable independent evaluation
6. practitioner discussion
7. social buzz

Community sources inform sentiment but do not establish technical facts.

## Signals to collect

Where available:

- release date
- update date
- downloads
- likes
- trending rank
- repository stars or growth
- benchmark claims
- license
- context length
- tool support
- multimodal support
- coding or agent capability
- price or access changes
- repeated practitioner praise
- repeated practitioner complaints

Do not fabricate unavailable metrics.

## Classification

Mark each item as:

- Ignore
- Watch
- Evaluate
- Consider

## Output format

### Weekly AI Model Scout

**This week's headline**

One paragraph.

**Top developments**

For each:
- model
- what changed
- why people care
- evidence
- strengths
- limitations
- relevance
- recommendation
- confidence

**Buzz versus substance**

Summarize what appears real and what appears overhyped.

**Open Claw relevance**

Recommend no more than three actions.

**Watchlist**

No more than five items.

**Sources**

Include direct source references or links when the channel supports them.

## Change policy

This skill may recommend but may not:

- install models
- alter model aliases
- change routing
- modify provider configuration
- create new agents or skills automatically

Any proposed new agent or skill must be presented as a draft for approval.
## Operating Manual: Discipline Protocol

**Source:** skills/botfather/SKILL.md — read the full manual for context and examples.

Every response runs the **five-question gate** before sending:

1. Did I answer the **decision** they're making, or just the words they typed?
2. What's the **one claim** that, if wrong, wrecks the answer — and did I verify it by re-derivation?
3. Is every **guess labeled** at the sentence where it lives?
4. What's the **strongest objection** to my conclusion — does the response survive it or state it?
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
