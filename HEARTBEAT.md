# Heartbeat Configuration

## Purpose

Provide status updates or ask for tasks every 3 hours. When active tasks are running, provide hourly updates.

## ⛔ PERMANENT INSTRUCTION

**NEVER schedule, create, or run meeting-prep cron jobs.** Piero explicitly asked to stop this forever. No meeting briefings, no calendar prep, no pre-meeting notifications. This is permanent.

---

## Heartbeat Schedule

| Time | Type | Action |
|------|------|--------|
| Every 3 hours | Standard | Check for tasks or give status |
| Every hour | Active only | Update on running tasks |

---

## Heartbeat Behavior

### Standard Heartbeat (Every 3 Hours)

```yaml
trigger: "0 */3 * * *"
timezone: "America/New_York"
```

**Actions:**
1. Check for active tasks in `overnight-factory/`
2. Check Consiglio for pending items
3. If no active tasks → Ask: "What should I work on?"
4. If active tasks → Provide brief status

### Active Task Monitor (Every Hour)

```yaml
trigger: "0 * * * *"
timezone: "America/New_York"
condition: "active_tasks_only"
```

**Actions:**
1. Check `overnight-factory/YYYY-MM-DD/pipeline-status.json`
2. If pipeline running → Send status update
3. If pipeline complete → Send completion summary
4. If pipeline failed → Alert user

---

## Status File Format

### pipeline-status.json

```json
{
  "pipeline": "overnight-business-website",
  "date": "2026-03-21",
  "status": "running",
  "current_step": "step-4-website",
  "started_at": "2026-03-21T00:00:00Z",
  "estimated_completion": "2026-03-21T02:30:00Z",
  "businesses_found": 7,
  "current_business": "Soto's Handyman",
  "steps": [
    { "step": 1, "name": "Business Scout", "status": "complete" },
    { "step": 2, "name": "Recon", "status": "complete" },
    { "step": 3, "name": "PM Builder", "status": "complete" },
    { "step": 4, "name": "Website Builder", "status": "running" },
    { "step": 5, "name": "Quality Check", "status": "pending" },
    { "step": 6, "name": "User Approval", "status": "pending" }
  ]
}
```

---

## Heartbeat Messages

### No Active Tasks

```
📊 Status: Idle

No active tasks running.

What should I work on?
- Run overnight pipeline?
- Scout for new businesses?
- Review completed sites?
- Other task?
```

### Pipeline Running

```
📊 Status: Active Pipeline Running

Pipeline: Overnight Business Website
Current Step: Step 4 - Website Builder
Business: Soto's Handyman
Started: 00:00 EST
ETA: 02:30 EST

Progress:
✅ Step 1: Business Scout (Complete)
✅ Step 2: Recon (Complete)
✅ Step 3: PM Builder (Complete)
🔄 Step 4: Website Builder (Running)
⏳ Step 5: Quality Check (Pending)
⏳ Step 6: User Approval (Pending)

Next update in 1 hour.
```

### Pipeline Complete

```
✅ Pipeline Complete: Soto's Handyman

Live URL: https://sotos-handyman-v2.vercel.app
Quality Score: 9/10
Completed: 02:25 EST

Status: AWAITING APPROVAL
Reply "approve" to send outreach email.
```

---

## Setup

### Add Heartbeat Cron

```bash
# Every 3 hours - standard heartbeat
openclaw cron add \
  --name "heartbeat-3h" \
  --schedule "0 */3 * * *" \
  --timezone "America/New_York" \
  --agent "main" \
  --heartbeat

# Every hour - active task monitor
openclaw cron add \
  --name "heartbeat-hourly-active" \
  --schedule "0 * * * *" \
  --timezone "America/New_York" \
  --agent "main" \
  --active-tasks-only
```

## Security Monitoring

During every heartbeat, check the security watchdog:
1. `Invoke-RestMethod -Uri http://localhost:3198/status` — check for alerts
2. If any alerts exist → immediately notify Piero
3. If camera offline or WiFi down → send alert with details
4. If machine rebooted → send alert with new boot time
5. Clear alerts after notifying

### Hourly Security Summary

Every hour, check motion tracker and send concise summary:
1. `Invoke-RestMethod -Uri http://localhost:3197/status` — motion events
2. `Invoke-RestMethod -Uri http://localhost:3198/status` — watchdog status
3. Format:
   - If motion: `🚨 HH:00-HH:00 | N events | brief description`
   - If quiet: `✅ HH:00-HH:00 | No motion | All quiet`
   - Always include: Camera/WiFi/Uptime line
4. Keep it SHORT — one or two lines max
5. If event snapshots exist, attach the latest one

This is HIGH PRIORITY — security alerts override normal heartbeat behavior.

---

**Last Updated:** 2026-05-20