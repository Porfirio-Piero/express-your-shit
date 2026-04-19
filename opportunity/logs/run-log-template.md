# Opportunity Engine Run Log

**Run Date:** YYYY-MM-DD  
**Run Time:** HH:MM - HH:MM (Duration: NN min)  
**Status:** ✅ Success / ⚠️ Partial / ❌ Failed  

---

## Agents Executed

| Agent | Phase | Status | Duration | Notes |
|-------|-------|--------|----------|-------|
| Scout | Pain Mining | ✅ | N min | N sources processed |
| Product Mgr | Clustering | ✅ | N min | N clusters found |
| Feasibility | Validation | ✅ | N min | N opportunities scored |
| Engineering | Scaffold | N/A | - | Score < 8.5 / ALLOW_SCAFFOLD=false |

---

## Sources Used

| Source | Status | Items Found | Notes |
|--------|--------|-------------|-------|
| Reddit r/SaaS | ✅ | NN | Checked hot + new |
| Reddit r/Entrepreneur | ✅ | NN | Checked hot |
| HN Show/Ask HN | ✅ | NN | Last 24h |
| IndieHackers | ✅ | NN | Products + Ideas |
| Twitter/X | ❌/✅ | NN/0 | Rate limited |

---

## Changes from Yesterday

### New Problems Detected
- {Category A}: +NN mentions
- {Category B}: +NN mentions (NEW CLUSTER)

### Dissolved Interest
- {Category C}: -NN mentions

### Trending
- ↑ {Theme X}: Growing fast
- ↓ {Theme Y}: Declining

---

## Artifacts Generated

| Artifact | Path | Size |
|----------|------|------|
| Intake JSON | `../intake/YYYY-MM-DD-problems.json` | N KB |
| Cluster Analysis | `../clusters/YYYY-MM-DD-cluster-analysis.md` | N KB |
| Feasibility Report | `../validated/YYYY-MM-DD-feasible-opportunities.md` | N KB |
| MVP Brief | `../mvp-briefs/YYYY-MM-DD-top1-mvp.md` | N KB |

---

## Scoring Summary

| Cluster | Score | Scaffold Eligible |
|---------|-------|-------------------|
| {A} | N.N | Yes/No |
| {B} | N.N | Yes/No |
| {C} | N.N | Yes/No |

**Highest Score:** N.N ({Theme})
**Scaffold Threshold Met:** Yes/No

---

## Errors / Blockers

### Critical
_None_

### Warnings
- {Issue}: {Description} (Impact: {Low/Med/High})

### Info
- {Note}: {Description}

---

## Next Run Checklist

- [ ] Review source connectivity
- [ ] Check Twitter/X rate limits
- [ ] Verify ALLOW_SCAFFOLD flag
- [ ] Clean old logs (>30 days)

---

## Manual Actions Required

_None_

_or_

- [ ] Review MVP brief: {Theme}
- [ ] Approve scaffold branch creation
- [ ] Adjust scoring weights
