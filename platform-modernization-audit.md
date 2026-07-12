# OpenClaw AI Engineering Platform v1.2 — Compatibility Audit & Installation Plan

**Date:** 2026-07-12
**Auditor:** The BotFather
**Status:** PENDING OWNER APPROVAL — no files modified yet

---

## 1. EXISTING SETUP INVENTORY

### OpenClaw Root
- **Root:** `C:\Users\devpi\.openclaw\`
- **Workspace:** `C:\Users\devpi\.openclaw\workspace\`
- **Config:** `config.yaml` (security: high, exec/shell/read/write/process/subagents all enabled, elevated allowed from Telegram)
- **Default model:** `ollama/glm-5.1:cloud` (cloud only, no local models)
- **Git branch:** `platform-overlay-pre-install-20260712-094024` (checkpoint created)

### Identity & Personality Files (PRESERVED — SHA256 checksums recorded)
| File | Size | SHA256 (first 16) |
|------|------|--------------------|
| SOUL.md | 4,547B | 4B915C03A17E03AC |
| IDENTITY.md | 3,566B | C996497407BD8B02 |
| CURIOSITY.md | 8,640B | 57A555D90B6AAA9E |
| MEMORY.md | 22,034B | B912A9F69560E130 |
| USER.md | 1,641B | 91137342225428BF |
| TOOLS.md | 6,357B | 72ECA53699F658C6 |
| AGENTS.md | 8,658B | B7DFE7FCD2024C24 |
| HEARTBEAT.md | 4,489B | DFE8E370DBCD4A5C |
| COMPANY.md | 9,927B | 8F62325902CAEE69 |
| TOOL-REGISTRY.md | 1,035B | 271A0B2A179903D4 |

### Existing Agent Fleet (in openclaw.json)
| Agent | Model |
|-------|-------|
| The BotFather | ollama/glm-5.1:cloud |
| Breaking Ben | ollama/glm-5.1:cloud |
| Codex Developer | ollama/glm-5.1:cloud |
| Chief of Staff | ollama/glm-5.1:cloud |

### Existing Agent Workspaces
**.openclaw/agents/ (runtime):** breaking-ben (23 files), chief-of-staff (6), codex-developer (2), dapper-dan (16), hourly-updater (1), main (1997), scout (1), vinny-vault (1)

**workspace/agents/ (templates):** 56 agent template directories including the-botfather, dapper-dan, breaking-ben, chief-of-staff, codex-developer, plus many project-specific agents

### Existing Skills (61 total)
**workspace/skills/ (38):** api-integration, botfather, breaking-ben, calendar-sync, cc-godmode, chief-of-staff, codex-developer, context-anchor, daily-briefing, dapper-dan, data-analysis, database, devops, document, email, exa-search, lead-researcher, meeting-prep, memory, ollama-local, ollama-memory-embeddings, openclaw-stealth-browser, overnight-complexity-validator, overnight-development-checkpoints, proactive-soul, scheduler, security, skill-vetter, swarmclaw, tavily, testing, uptime-kuma, web-research, wiki-system, +3 without SKILL.md

**.openclaw/skills/ (23):** brand-guidelines, canvas-design, changelog-generator, content-research-writer, context-master, feishu-*, file-organizer, here-now, image-enhancer, lead-research-assistant, mcp-builder, notion-*, obsidian-vault-maintainer, openai-api, self-evolver-pro, super-reviewer, universal-hooks, webapp-testing

### Existing Jobs/Crons
- Active cron config in `.openclaw/cron/jobs.json`
- Vinny Vault weekly audit (Sunday 9:00 AM ET)
- Morning briefing (7:00 AM weekdays)
- Various other scheduled tasks

### Build/Deploy Context
- Vercel deployment (rate-limited, prefer GitHub push)
- Camera system (OBSBOT, BRIO, Integrated) on ports 3196-3202
- Security watchdog (port 3198)
- External drive D:\ for camera storage
- Vinny Vault on D:\VinnyVault\

### Cloud Model Configuration
- **All models are Ollama Cloud only** — NO local inference
- Primary: ollama/glm-5.1:cloud
- Configured in openclaw.json under agents.defaults.model
- Codex: ollama/qwen2.5-coder:7b (with thinking:on)

---

## 2. COMPATIBILITY ASSESSMENT

### ✅ FULLY COMPATIBLE (No Conflicts)
| Platform Component | Status | Notes |
|--------------------|--------|-------|
| Standards files | ✅ No conflict | New files only, no overwrites |
| Skills (12 new) | ✅ No conflict | No name collisions with existing 61 skills |
| Model routing config | ✅ No conflict | Reference only, won't override openclaw.json |
| Templates | ✅ No conflict | New files under platform/ namespace |
| Scripts (4) | ✅ No conflict | New files, PowerShell, Windows-compatible |
| Docs | ✅ No conflict | New files only |
| Job templates | ✅ No conflict | New YAML files, need manual registration |

### ⚠️ NEEDS ADAPTATION (Conflicts or Overlaps)
| Platform Component | Issue | Resolution |
|--------------------|-------|------------|
| Orchestrator agent | Overlaps with BotFather's orchestration role | **SKIP** — BotFather remains primary orchestrator. Platform orchestrator installed as reference only. |
| 10 specialist agents | Our fleet uses different names/models | Install as platform agents, don't register in openclaw.json. Use on-demand via BotFather delegation. |
| model-buzz-scout agent | Needs weekly cron + web research | Install as skill + agent. Register cron manually. Verify Tavily/web-research capability. |
| capability-evolution agent | Monthly analysis | Install but don't auto-register cron. BotFather triggers on demand. |
| personality-craft skill | Could conflict with existing SOUL.md | Install as reference only. Never auto-modify SOUL.md. |
| agent-evolution skill | Could conflict with existing agent fleet | Install as reference only. Never auto-modify agents without approval. |

### ❌ MUST NOT INSTALL (Would Break Existing Setup)
| Component | Reason |
|-----------|--------|
| None | The overlay is designed as non-destructive. All additions are namespaced. |

### 🔒 CLOUD-ONLY VIOLATIONS (Fixed in Package)
| Issue | Status |
|-------|--------|
| References to local Ollama API | ✅ Package explicitly states Ollama Cloud only |
| Model size/quantization recommendations | ✅ Package says no hard-coded model recs |
| Local GPU/hardware fit | ✅ Package excludes local model sizing |

---

## 3. PROPOSED FOLDER HIERARCHY

```
.openclaw/workspace/platform/ai-engineering/
├── README.md                              (existing, from package)
├── PLATFORM-MANIFEST.yaml                 (existing, from package)
├── FILE-MANIFEST.json                     (existing, from package)
├── START-HERE.md                          (existing, from package)
├── INSTALLATION-RECORD.md                 (generated on install)
├── bindings/                              (generated — agent compatibility bindings)
│   ├── the-botfather.yaml                 (BotFather → platform standards binding)
│   ├── breaking-ben.yaml                  (Breaking Ben → platform review binding)
│   ├── chief-of-staff.yaml                (Chief of Staff → platform coordination binding)
│   └── codex-developer.yaml                (Codex Developer → platform engineering binding)
├── project-bindings/                      (generated — per-project bindings)
├── reports/                               (generated — audit + weekly reports)
│   └── existing-setup-audit-20260712.md   (this report)
├── standards/                             (from package)
│   ├── PRODUCT-PRINCIPLES.md
│   ├── DESIGN-SYSTEM.md
│   ├── UX-STANDARDS.md
│   ├── ENGINEERING-STANDARDS.md
│   ├── ACCESSIBILITY.md
│   ├── SECURITY.md
│   ├── QA-RELEASE-GATES.md
│   └── CONTEXT-PRESERVATION.md
├── skills/                                (from package)
│   ├── product-discovery/
│   ├── design-system/
│   ├── ux-quality/
│   ├── fullstack-engineering/
│   ├── visual-review/
│   ├── accessibility/
│   ├── testing-quality/
│   ├── security-review/
│   ├── performance-review/
│   ├── release-governance/
│   ├── context-preservation/
│   ├── agent-evolution/
│   ├── personality-craft/
│   └── weekly-model-intelligence/
├── agents/                                (from package — reference only)
│   ├── art-director/
│   ├── product-architect/
│   ├── ux-designer/
│   ├── senior-engineer/
│   ├── qa-engineer/
│   ├── security-reviewer/
│   ├── performance-reviewer/
│   ├── release-manager/
│   ├── orchestrator/
│   ├── capability-evolution/
│   └── model-buzz-scout/
├── prompts/                               (from package)
│   ├── IMPLEMENT-PLATFORM.md
│   ├── BUILD-PROFESSIONAL-APP.md
│   └── IMPLEMENT-WEEKLY-MODEL-SCOUT.md
├── config/                                (from package)
│   └── model-routing.yaml
├── docs/                                  (from package)
│   ├── ARCHITECTURE.md
│   ├── ROLLBACK.md
│   ├── RECOMMENDED-TARGET-HIERARCHY.md
│   └── TELEGRAM-IMPORT.md
├── jobs/                                  (from package)
│   ├── capability-evolution-monthly.yaml
│   └── model-buzz-scout-weekly.yaml
├── scripts/                               (from package)
│   ├── audit-existing-setup.ps1
│   ├── install-overlay.ps1
│   ├── uninstall-overlay.ps1
│   └── generate-agent-bindings.ps1
└── templates/                             (from package)
    ├── agent/
    └── project/
```

**Total new files:** 78 (from package) + ~5 (generated bindings/reports)
**Total modified files:** 0 (overlay is non-destructive)
**Total deleted files:** 0

---

## 4. EXACT DIFF — WHAT CHANGES

### FILES ADDED (78 new files, 0 modifications)

All files go under `.openclaw/workspace/platform/ai-engineering/` — **NO existing files are modified.**

### FILES MODIFIED

| File | Change | Reason |
|------|--------|--------|
| **None** | — | The overlay is 100% additive |

### AGENT BINDINGS (Generated, Not Overwriting)

| Existing Agent | Platform Binding | What It Gets |
|----------------|-----------------|-------------|
| The BotFather | the-botfather.yaml | Access to all platform standards, orchestrator role, model-buzz-scout delegation |
| Breaking Ben | breaking-ben.yaml | Security review + QA gate standards, testing-quality skill |
| Chief of Staff | chief-of-staff.yaml | Coordination standards, context-preservation skill |
| Codex Developer | codex-developer.yaml | Engineering standards, fullstack-engineering skill, release governance |

### CRON JOBS (To Be Registered)

| Job | Schedule | Action |
|-----|----------|--------|
| Model Buzz Scout Weekly | Sunday 8:00 AM ET | Research + Telegram summary |
| Capability Evolution Monthly | 1st of month 9:00 AM ET | Analyze usage patterns + recommendations |

**These require manual registration via `openclaw cron add`. Not installed automatically.**

---

## 5. MIGRATION PLAN

### Phase 1 — Install Overlay (Non-Destructive)
1. Copy all 78 package files to `.openclaw/workspace/platform/ai-engineering/`
2. Create `bindings/`, `project-bindings/`, `reports/` directories
3. Generate agent compatibility bindings
4. Generate this audit report
5. **Verify:** No existing files modified. All identity files unchanged.

### Phase 2 — Register Model Buzz Scout
1. Copy model-buzz-scout agent to `.openclaw/agents/model-buzz-scout/`
2. Copy weekly-model-intelligence skill to `.openclaw/workspace/skills/weekly-model-intelligence/`
3. Register weekly cron job (Sunday 8:00 AM ET)
4. **Verify:** Agent loads, skill loads, cron fires, Telegram delivery works.

### Phase 3 — Register Platform Standards as Skills
1. Symlink/copy platform skills to `.openclaw/workspace/skills/` (accessible to all agents)
2. **Verify:** Skills appear in `openclaw skills list`, no name conflicts.

### Phase 4 — Integration Testing
1. Trigger Model Buzz Scout manually → verify report generation
2. Verify BotFather can reference platform standards
3. Verify no agent personality changes
4. Verify all 4 existing agents still load
5. Verify cron jobs registered and firing
6. **Verify:** One existing project (e.g., CompliancePulse) builds unchanged.

### Phase 5 — Owner Approval Required
- Register capability-evolution cron? (optional, low priority)
- Register specialist platform agents in openclaw.json? (deferred — use on-demand only)
- Integrate orchestrator into BotFather delegation? (deferred — BotFather orchestrates)

---

## 6. ROLLBACK PLAN

### Full Rollback
```powershell
# Remove the entire platform overlay
Remove-Item -Recurse -Force ".openclaw\workspace\platform\ai-engineering\"

# Remove the model-buzz-scout agent
Remove-Item -Recurse -Force ".openclaw\agents\model-buzz-scout\"

# Remove registered crons
openclaw cron remove model-buzz-scout-weekly
openclaw cron remove capability-evolution-monthly

# Restore from Git checkpoint
git checkout main
git branch -D platform-overlay-pre-install-20260712-094024
```

### Partial Rollback (Model Buzz Scout Only)
```powershell
# Keep platform standards, remove only the scout
Remove-Item -Recurse -Force ".openclaw\agents\model-buzz-scout\"
openclaw cron remove model-buzz-scout-weekly
```

### Verification After Rollback
- All 4 agents still load
- All 61 existing skills still load
- SOUL.md, IDENTITY.md, MEMORY.md unchanged (verify SHA256)
- Cron jobs still firing
- Existing projects build unchanged

---

## 7. RISKS & CONCERNS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Skill name collision | Low (all new names) | Medium | Checked — no collisions with existing 61 skills |
| Agent name collision | Low | Medium | model-buzz-scout is new, not in existing fleet |
| Cron job conflict | Low | Low | Sunday 8 AM — no existing job at that time |
| Personality drift | None | High | Overlay is additive only, never modifies SOUL.md |
| Local model recommendation | None | Medium | Package explicitly prohibits local model recs |
| Secret exposure | None | Critical | Audit report contains no secret values |

---

## 8. UNRESOLVED ITEMS

1. **Web research capability:** Model Buzz Scout needs web search. We have Tavily skill and web-research skill. Need to verify Tavily API key is active for scout to use.
2. **Capability Evolution agent:** Deferred — useful concept but low priority. Install the files, don't register cron yet.
3. **Specialist agents (10):** Installed as reference material only. NOT registered in openclaw.json. BotFather delegates to them on-demand using platform standards.
4. **Orchestrator:** BotFather remains the primary orchestrator. Platform orchestrator is reference only.

---

## 9. NEXT STEPS — REQUIRES OWNER APPROVAL

**I need your go-ahead on these decisions before proceeding:**

1. ✅ Install the overlay to `platform/ai-engineering/`? (Recommended: YES — non-destructive, all additive)
2. ✅ Register Model Buzz Scout as active agent with weekly cron? (Recommended: YES — genuinely useful)
3. ⏸️ Register Capability Evolution monthly cron? (Recommended: DEFER — install files, register later)
4. ⏸️ Register 10 specialist agents in openclaw.json? (Recommended: NO — keep as reference, delegate on-demand)
5. ⏸️ Replace BotFather as orchestrator with platform orchestrator? (Recommended: NO — BotFather stays in charge)
6. ✅ Generate agent bindings? (Recommended: YES — lightweight reference files)

**Reply "approved" to proceed with the recommended items (1, 2, 5, 6).**