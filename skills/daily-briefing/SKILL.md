---
name: daily-briefing
description: Generates a warm, compact daily briefing with weather, calendar, reminders, birthdays, and important emails for cron or chat delivery.
metadata: {"openclaw":{"emoji":"🌅","requires":{"os":["darwin"],"bins":["curl","bash"]},"optional_bins":["icalpal","gog","himalaya"]}}
user-invocable: true
---

# daily-briefing

Generates a compact, warm daily message suitable for cron delivery (stdout/chat reply). Always succeeds even with minimal context.

---

## Skill Type: System Skill (Orchestrator Pattern)

This skill uses the **System Skill pattern** for execution on macOS. The agent must:

1. **Never run raw CLI commands** directly (except `curl` for weather).
2. **Always invoke the runner script** to gather data.
3. **Read gathered data from JSON** after the script completes.
4. **Generate the briefing text** using the agent's own capabilities.

**Quick reference:**
```bash
# Invoke data gatherer (waits for completion)
"{baseDir}/skills/daily-briefing/bin/run_daily_briefing.sh"

# Read output
cat /tmp/daily_briefing_data.json
```

---

## Output Contract (STRICT)

**CRITICAL:** Output **only** the briefing text. No prefaces, no explanations, no "Done", no file paths, no tool output, no markdown code fences around the briefing.

### Line 1 Format (Required)

Line 1 **must begin exactly** with the time-appropriate greeting:

```
Good {time_of_day} - Today is {Weekday}, {Month} {D}, {YYYY}. {Skies sentence}.
```

- Use **full month name** (e.g., "February", not "Feb").
- If today is the user's birthday (matched by name in contacts): replace greeting with:
  ```
  🎉 Happy Birthday! Today is {Weekday}, {Month} {D}, {YYYY}. {Skies sentence}.
  ```

### Greeting Selection (Local Time)

| Time Range | Greeting |
|------------|----------|
| 05:00–11:59 | Good morning |
| 12:00–16:59 | Good afternoon |
| 17:00–21:59 | Good evening |
| 22:00–04:59 | Good night |
| Unknown | Good morning (default) |

### Skies Sentence Rules

**If weather is usable:**
```
{Conditions} skies, around {TEMP}°{time_clause}{low_clause}{precip_clause}.
```

- Use **high temp** if reliable → time clause: " this afternoon"
- Otherwise use **current temp** → time clause: " right now"
- If low exists: append `, with a low around {LOW}°`
- If precip chance ≥30%: append `, and a {CHANCE}% chance of {rain/snow/precipitation}`

**If weather is not usable:** Use exact fallback:
```
I can't access weather right now.
```

### Layout Rules

```
{Line 1: Greeting with skies sentence}

{Birthdays section - only if any today or upcoming}

{Calendar events section - only if any}

{Reminders section - only if any}

{Important emails section - only if enabled and any}

{Anchors - only if real priorities from context}

{Closing line - always required}
```

- Always include a **blank line after Line 1**.
- Each section separated by a blank line if present.
- Target **~5–15 lines** depending on enabled integrations.

---

## Vibe and Tone

- **Gentle gift for the day**: warm, calm, compassionate, quietly hopeful.
- **No scolding, no urgency, no productivity pressure.**
- **Telegram-friendly**: short lines, roomy spacing, easy to skim.

---

## System Skill Execution

### Step 1: Check Mode (Interactive vs Cron)

**If interactive AND missing critical info (location/timezone/units):**
- Prompt briefly for missing info before generating briefing.
- Offer toggles for integrations.
- Mention the important emails feature: explain it uses AI-powered semantic analysis to surface actionable emails (transactions, shipments, security alerts, etc.) and can be enabled via `emails.enabled` in config; note iCloud Mail requires an app-specific password (`emails.icloudPassword`).

**If non-interactive (cron/automation):**
- Do NOT ask questions (cron-safe). Use defaults.
- Do NOT create/modify any files.
- Do NOT spawn background tasks/sub-agents.
- **Omit weather** if location is unavailable.

### Step 2: Invoke the Data Gatherer

```bash
"{baseDir}/skills/daily-briefing/bin/run_daily_briefing.sh"
```

- The runner script executes `scripts/daily_briefing_orchestrator.sh`.
- TCC permissions are granted to Terminal.app (or the calling process).

### Step 3: Read the Gathered Data

After the app completes, read:

```
/tmp/daily_briefing_data.json
```

JSON structure:
```json
{
  "generated_at": "ISO timestamp",
  "system": {
    "timezone": "America/New_York",
    "local_time": "2024-02-03T08:30:00",
    "hour": 8
  },
  "config": {
    "location": "New York, NY",
    "units": "C",
    "birthdays_enabled": true,
    "birthdays_lookahead": 14,
    "calendar_google_enabled": true,
    "calendar_icloud_enabled": true,
    "calendar_lookahead": 0,
    "reminders_enabled": true,
    "reminders_due_filter": "today",
    "reminders_include_past_due": true,
    "emails_enabled": false,
    "emails_limit": 10,
    "emails_sort_newest": true,
    "emails_starred_first": true,
    "emails_unread_only": true
  },
  "birthdays": {
    "available": true,
    "user_birthday_today": false,
    "data": [
      {"name": "Jane Doe", "date": "2024-02-03", "days_until": 0},
      {"name": "John Smith", "date": "2024-02-05", "days_until": 2}
    ]
  },
  "calendar": {
    "available": true,
    "data": [
      {"title": "Team standup", "start": "09:00", "end": "09:30", "all_day": false, "date": "2024-02-03", "source": "google"},
      {"title": "Doctor appointment", "start": null, "end": null, "all_day": true, "date": "2024-02-03", "source": "icloud"}
    ]
  },
  "reminders": {
    "available": true,
    "data": [
      {"title": "Pick up prescription", "due": "2024-02-03"}
    ]
  },
  "emails": {
    "available": true,
    "data": [
      {"id": "abc123", "from": "Amazon", "from_email": "shipment@amazon.com", "subject": "Your order has shipped", "preview": "Your package is on its way...", "starred": false, "unread": true, "date": "2024-02-03T07:30:00Z", "source": "gmail"},
      {"id": "def456", "from": "Chase", "from_email": "alerts@chase.com", "subject": "Payment received", "preview": "We received your payment of...", "starred": true, "unread": true, "date": "2024-02-03T06:15:00Z", "source": "icloud"}
    ]
  },
  "contacts": {
    "available": true,
    "data": [
      {"name": "Jane Doe", "email": "jane@example.com"},
      {"name": "John Smith", "email": "john@example.com"}
    ]
  }
}
```

### Step 4: Fetch Weather (Agent Task)

The agent must fetch weather directly using `curl` (not via orchestrator):

```bash
curl -fsSL --max-time 12 "https://wttr.in/{ENCODED_LOCATION}?format=j1"
```

- **Location:** Use `config.location` from gathered data; if empty/null, weather is unavailable.
- **Retry:** Retry once on failure.
- **If still failing or unusable:** Weather is unavailable; use fallback sentence.

**Parse from JSON response:**
- Conditions: `current_condition[0].weatherDesc[0].value`
- Current temp (C): `current_condition[0].temp_C`
- Current temp (F): `current_condition[0].temp_F`
- High temp (C): `weather[0].maxtempC`
- High temp (F): `weather[0].maxtempF`
- Low temp (C): `weather[0].mintempC`
- Low temp (F): `weather[0].mintempF`
- Precip chance: max of `weather[0].hourly[*].chanceofrain` (as integers)

**Units:** Use `config.units` ("C" or "F"). Default to Celsius if unknown.

**CRITICAL:** Do NOT output raw curl/tool output. Do NOT use wttr.in one-line formats.

### Step 5: Classify Important Emails (Agent Task)

**Only if `config.emails_enabled` is true and `emails.available` is true.**

For each email in `emails.data`, use the agent's own semantic analysis to determine importance.

**Important Email Criteria (any match qualifies):**
- From contacts in the gathered contacts list
- Order shipment notifications
- Receipts for purchases or transaction confirmations
- Incoming/outgoing transaction alerts
- Refund-related messages
- Customer service interactions
- Upcoming subscription renewal notices
- Upcoming payment heads-up notices
- Technical newsletters
- Job application updates
- Messages from recruiters (exclude WITCH-like outsourcing firms)
- Banking alerts
- Calendar invites
- Account security emails (e.g., "your account is locked")
- Shared items (e.g., Google Drive shares)
- Wishlist-related alerts
- Starred/flagged emails (positive signal, not sole determinant)
- Any other contextually important emails

**Exclusions:** The following are **never** important, even if matching other criteria:
- Promotional/marketing emails
- LinkedIn Job Alert emails (LinkedIn message notifications are fine)
- Unsolicited recruiter/job-posting emails and mass hiring notices (e.g., subjects or bodies containing keywords like "hire", "hiring", "job", "position", "onsite", "fulltime", "recruiter", "application", or obvious bulk outreach), unless the sender is in the user's contacts or the message is starred/readily identified as personally relevant.
- Product announcement / product update emails and vendor/platform notifications (e.g., "[Product Update]", release announcements, automatic enablement notices), unless the sender is in the user's contacts or the message is explicitly starred.
- Vendor newsletters, community announcements, and general technical mailing-list posts (e.g., blog posts, release notes, product previews, digests), unless clearly personal or from a contact.

**Failure behavior:** If semantic analysis fails, silently **omit the entire email section**.

**Apply filters and sorting:**
1. Filter by `emails_unread_only` if true
2. If `emails_starred_first` is true, starred emails first
3. Sort by date per `emails_sort_newest`
4. Limit to `emails_limit`

### Step 6: Generate the Briefing

Using all gathered and processed data, compose the briefing text following the Output Contract.

**Section Formats:**

**Birthdays:**
```
🎂 **Birthdays:**
• Today: Name
• Feb 5: Name
```
- Group multiples per date
- Today entries first
- Up to 5 upcoming (excluding today)

**Calendar Events:**
```
📅 **Today's schedule:**
• All-day: Event title
• 9:00 AM: Event title
```
- Single day: "Today's schedule"
- Multi-day: "Schedule" with "Today/Tomorrow/{Month} {D}" labels
- All-day events first, then timed by start
- Up to 3 events per day

**Reminders:**
```
✅ **Reminders:**
• Pick up prescription
```
- Due-today reminders only
- Up to 3 reminders

**Important Emails:**
```
📧 **Emails needing attention:**
• Amazon: Your order has shipped
• Chase: Payment received
```
- Format: `• Sender: Subject (truncated if needed)`

**Anchors:**
- Only if you can **confidently infer 1–3 real priorities** from user-provided context.
- Plain bullets, no heading.
- If not real/uncertain, **omit entirely** (do not invent).

**Closing Line:**
- Required. Use the `quote` field from the gathered JSON data.
- The orchestrator provides a random motivational quote each run.

### Step 7: Output the Briefing

Return **only** the briefing text. Nothing else.

---

## Configuration

Configuration is read from `~/.openclaw/openclaw.json` at path `skills.entries.daily-briefing.config`:

```json
{
  "skills": {
    "entries": {
      "daily-briefing": {
        "config": {
          "location": "New York, NY",
          "timezone": "America/New_York",
          "units": "C",
          "birthdays": {
            "enabled": true,
            "lookahead": 14,
            "sources": ["contacts", "google"]
          },
          "calendar": {
            "enabled": true,
            "lookahead": 0,
            "sources": ["google", "icloud"]
          },
          "reminders": {
            "enabled": true
          },
          "emails": {
            "enabled": false,
            "icloudPassword": "",
            "limit": 10,
            "sortNewest": true,
            "starredFirst": true,
            "unreadOnly": true
          }
        }
      }
    }
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `location` | string | "" | Location for weather (e.g., "New York, NY") |
| `timezone` | string | system | Timezone (e.g., "America/New_York") |
| `units` | string | "C" | Temperature units: "C" or "F" |
| `birthdays.enabled` | bool | true | Enable birthday tracking |
| `birthdays.lookahead` | int | 14 | Days ahead to show upcoming birthdays |
| `birthdays.sources` | array | ["contacts"] | Sources: "contacts" (iCloud), "google" |
| `calendar.enabled` | bool | true | Enable calendar events |
| `calendar.lookahead` | int | 0 | Days ahead (0 = today only) |
| `calendar.sources` | array | ["google", "icloud"] | Calendar sources |
| `reminders.enabled` | bool | true | Enable Apple Reminders |
| `reminders.dueFilter` | string | "today" | Due date filter: "today", "week", or "all" |
| `reminders.includePastDue` | bool | true | Include overdue/past-due reminders |
| `emails.enabled` | bool | false | Enable important emails feature |
| `emails.icloudPassword` | string | "" | iCloud Mail app-specific password |
| `emails.limit` | int | 10 | Maximum emails to show |
| `emails.sortNewest` | bool | true | Sort newest first |
| `emails.starredFirst` | bool | true | Prioritize starred emails |
| `emails.unreadOnly` | bool | true | Only show unread emails |

---

## Defaults

- **Timezone:** User's local timezone; fallback to **UTC** if unknown.
- **Location:** User's location if present; **omit weather** if unavailable in cron mode.
- **Units:** User's preferred units if known; otherwise **Celsius**.

---

## Dependencies

**Required:**
- `curl` — for weather fetching
- `bash` — for orchestrator script

**Optional:**
- `gog` — `brew install steipete/tap/gogcli` (Google Calendar, Gmail, Contacts)
- `icalpal` — `brew install ajrosen/tap/icalpal` (iCloud Calendar)
- `himalaya` — `brew install himalaya` (iCloud Mail via IMAP)

---

## File Structure

```
daily-briefing/
├── SKILL.md
├── README.md
├── install.sh
├── scripts/
│   └── daily_briefing_orchestrator.sh
└── bin/
    └── run_daily_briefing.sh (created by install.sh)
```

---

## Example Output

```
Good morning - Today is Saturday, February 3, 2024. Partly cloudy skies, around 45°F this afternoon, with a low around 32°F.

🎂 **Birthdays:**
• Today: Jane Doe
• Feb 5: John Smith

📅 **Today's schedule:**
• All-day: Doctor appointment
• 9:00 AM: Team standup

✅ **Reminders:**
• Pick up prescription

📧 **Emails needing attention:**
• Amazon: Your order has shipped
• Chase: Payment received

Take things one step at a time today—you've got this.
```

---

## Cleanup

```bash
"{baseDir}/skills/daily-briefing/bin/run_daily_briefing.sh" --cleanup
```
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
