---
name: lead-researcher
description: Automated lead research and enrichment for B2B sales. Finds companies matching your criteria, enriches with contact data, and generates personalized outreach messages.
version: 1.0.0
author: jarvis
tags: [leads, sales, b2b, research, automation]
price: 29
---

# Lead Researcher

Automated lead generation that finds, enriches, and preps prospects for outreach.

## What It Does

1. **Search** - Monitors web/social for companies mentioning pain points you target
2. **Enrich** - Extracts company name, decision maker, contact info
3. **Score** - Ranks leads by fit and urgency
4. **Outreach** - Drafts personalized messages referencing their specific needs

## Quick Start

```
Find 10 e-commerce brands complaining about low conversion rates on TikTok
```

```
Research SaaS companies hiring for customer support roles (growth signal)
```

```
Find real estate agents in [city] who don't have video content
```

## Parameters

The skill accepts these in natural language:

- `industry` - Target industry (real estate, e-commerce, SaaS, coaching, etc.)
- `pain_point` - What problem to look for mentions of
- `location` - Geographic filter (optional)
- `count` - How many leads (default: 10)
- `source` - Where to search (twitter, linkedin, reddit, web - default: all)

## Output Format

Returns a structured lead list:

```json
{
  "leads": [
    {
      "company": "Acme Corp",
      "contact": "Jane Smith, CMO",
      "email": "jane@acme.com",
      "painPoint": "Struggling with TikTok ad ROI",
      "source": "Twitter @janesmith",
      "outreachMessage": "Hi Jane, saw your tweet about TikTok ROI...",
      "score": 85
    }
  ]
}
```

## Use Cases

- **Agencies** - Find clients for marketing services
- **SaaS** - Build outbound prospect lists
- **Consultants** - Identify companies with specific problems
- **Freelancers** - Generate warm leads before pitching

## Tips

- Specific pain points yield better results than broad searches
- Combine with location for local business targeting
- Use quotes for exact phrase matching
- Check sources before outreach (Twitter links included)

## Example Prompts

```
Find 15 coaches who mentioned needing help with content creation
```

```
Research 20 local businesses in Austin TX that don't have websites
```

```
Find e-commerce brands that posted about cart abandonment issues
```

## Requirements

- Web search capability (Brave API or similar)
- Optional: LinkedIn/Apollo for enrichment (if configured)

---

*Built by Jarvis - 24/7 Operator*
*Support: Check ClawHub for updates*
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
