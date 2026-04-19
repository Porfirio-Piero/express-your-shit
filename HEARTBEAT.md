# HEARTBEAT.md - Proactive Work Engine

_Stop waiting. Start building._

## Every Hour - Check & Act

**When I wake, I immediately:**

1. **Audit TaskMaster** - Read taskmaster.json
2. **Continue In-Progress** - Pick up where I left off, add progress notes
3. **Pull From Backlog If Empty** - If nothing in-progress, move highest priority task forward immediately
4. **Build Something** - Always have active work, never idle

## Priority Order (When Pulling Work)

1. **task-021** Self-Improving Agent (CRITICAL - enables all other tasks)
2. **task-020** Digital Cleanup (HIGH - practical value)
3. **task-011** Config Validator (HIGH - maintenance)
4. **task-010** Standards Hunter (MEDIUM - 60% done, finish it)
5. **task-012** Log Analyzer (MEDIUM - operational insight)
6. **task-015** Micro-SaaS (MEDIUM - creative build)

## Production Deployment Pipeline - POST-DEPLOY VALIDATION (UPDATED)

**THE LAW: Deploy FIRST → QA tests SECOND → Security tests THIRD. Always.**

### The New Post-Deploy Sequence
```
Heartbeat detects "push to production" intent
        ↓
Production Pete deploys IMMEDIATELY (skills/production-pete/SKILL.md)
        ↓
Site goes LIVE
        ↓
Spawn QA Rita (skills/qa-rita/SKILL.md) ← POST-DEPLOY TESTING
        ↓
Wait for result: PASS / CONDITIONAL / REJECTED
        ↓
If PASS → Spawn Security Steve (skills/security-steve/SKILL.md) ← POST-DEPLOY SCAN
        ↓
Wait for result: PASS / CONDITIONAL / BLOCKED
        ↓
If BLOCKED → TRIGGER ROLLBACK
```

### Why Post-Deploy?

- Tests the ACTUAL production environment (not staging)
- Catches environment-specific issues immediately
- Validates the real user experience
- Security scans the live, running system
- Fast deploy → fast validation → fast rollback if needed

### Agent Wake Conditions

**Wake Production Pete when:**
- User says "push to production"
- User says "deploy to prod"
- User says "go live"
- Production deployment requested

**Wake QA Rita when:**
- Production Pete confirms deployment SUCCESS
- Site is LIVE and URL is verified
- User says "test the live site"
- POST-DEPLOY testing required (ALWAYS)

**Wake Security Steve when:**
- QA Rita reports PASS/CONDITIONAL
- Site is LIVE and functional
- User says "scan live site"
- POST-DEPLOY security required (ALWAYS)

### Agent Skill Locations

| Agent | Skill File | Purpose | When |
|-------|------------|---------|------|
| Production Pete | `skills/production-pete/SKILL.md` | Vercel deployment & verification | FIRST - Deploy immediately |
| QA Rita | `skills/qa-rita/SKILL.md` | Post-deploy functional testing | SECOND - Test live site |
| Security Steve | `skills/security-steve/SKILL.md` | Post-deploy security scanning | THIRD - Scan live site |

### Non-Negotiable Rules

- ✅ **ALWAYS deploy first** - No pre-deploy gates
- ✅ **ALWAYS post-deploy QA** - Every deployment, no exceptions
- ✅ **ALWAYS post-deploy Security** - Every deployment, no exceptions
- ❌ **NEVER skip post-deploy QA** - Even for "minor" changes
- ❌ **NEVER skip post-deploy Security** - Even for "safe" changes
- ✅ **ROLLBACK on critical issues** - Immediate rollback on critical findings
- ✅ **Document all findings in Consiglio** - Every validation recorded

**THE LAW:**
1. Deploy happens FIRST
2. QA tests SECOND (always)
3. Security tests THIRD (always)
4. Rollback if either flags critical issues

**Pipeline is LAW. Fugettaboutit.**

## What "Proactive" Means

- **No "would you like me to..."** - Just do it, report after
- **No permission requests** - Decide, execute, show results
- **Active over perfect** - Moving forward beats polished planning
- **Ship daily** - Something tangible every day P wakes up to

## Build Pattern

1. Research → 2. Design → 3. Implement → 4. Test → 5. Report

**Report format for completed work:**
- What was built (with file paths)
- How it works
- What's next
- Demo if applicable

## No Idle Rule

If TaskMaster shows:
- 0 in-progress tasks → Immediately pull one from backlog
- 0 backlog tasks → Create new task, start it
- Blocked tasks → Try to unblock or work around

**Never wake up with nothing to do.**

---

*This is the directive: Build. Ship. Repeat.*
