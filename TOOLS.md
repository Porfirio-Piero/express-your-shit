# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Known Tool Limitations (2026-02-18 Audit)

### Missing API Keys ❌

**web_search** - Requires Brave Search API key
- Error: `missing_brave_api_key`
- Fix: `openclaw configure --section web` or set `BRAVE_API_KEY`
- **WORKAROUND: Use DuckDuckGo Search skill (see below)**

### Web Search Workaround (DuckDuckGo) ✅ NEW

**Skill:** `duckduckgo-search` 
- **Location:** `~/.openclaw/workspace/skills/duckduckgo-search/`
- **Script:** `~/.openclaw/workspace/skills/duckduckgo-search/scripts/ddg-search.ps1`
- **Status:** Working - No API key required

**Usage:**
```powershell
# Run from workspace directory
cd ~/.openclaw/workspace/skills/duckduckgo-search/scripts
.\ddg-search.ps1 -Query "your search query" -Count 5

# Or via exec from anywhere:
exec: powershell -ExecutionPolicy Bypass -File ~/.openclaw/workspace/skills/duckduckgo-search/scripts/ddg-search.ps1 -Query "your query" -Count 5
```

**Example output (JSON):**
```json
{
  "query": "7 Cats Music Ramsey NJ",
  "provider": "duckduckgo",
  "count": 3,
  "results": [
    {
      "title": "Music Lessons & Instrument Rentals in Ramsey, NJ",
      "url": "https://stores.musicarts.com/nj/ramsey/music-store-7608.html",
      "description": "Our Ramsey, NJ music store offers instrument sales, rentals, repairs...",
      "siteName": "stores.musicarts.com"
    }
  ]
}
```

**Limitations:**
- HTML scraping (may break if DuckDuckGo changes page structure)
- No freshness filters (unlike Brave's time-based filters)
- No country/language targeting
- May trigger anti-bot detection with heavy usage

**memory_search / memory_get** - Requires embedding provider keys
- Errors: No API key for OpenAI, Google, or Voyage providers
- Fix: `openclaw configure --section memory` or set env vars:
  - `OPENAI_API_KEY`
  - `GOOGLE_API_KEY`
  - `VOYAGE_API_KEY`

**web_fetch** - Intermittent failures
- Error: `fetch failed`
- Workaround: Use browser automation when Chrome extension connected

### Requires User Action ⚠️

**browser** - Extension needs tab connection
- Status: Chrome detected but relay not connected
- Fix: Click OpenClaw Browser Relay icon in Chrome toolbar

**exec** - Approval required for each invocation
- Workaround: Use `--security=full` flag for trusted commands

### Working Tools ✅

| Tool | Status | Notes |
|------|--------|-------|
| read | ✅ | Full functionality |
| write | ✅ | Auto-creates directories |
| edit | ✅ | Precise text replacement |
| nodes | ✅ | Lists paired nodes |
| tts | ✅ | Generates audio successfully |
| session_status | ✅ | Session info available |

---

### TTS Preferences

- Default channel: whatsapp
- Output format: MP3
- Storage: AppData/Local/Temp/

---

## Git/GitHub Configuration

### Identity
- **User Name:** TheBotfather
- **Email:** porfirio.piero+github@gmail.com
- **Default Branch:** main

### GitHub Account
- **Username:** Piero-Porfirio
- **User ID:** 49736924
- **Remote:** https://github.com/Piero-Porfirio/openclaw-workspace.git

### Credential Handling
- **Helper:** Windows Credential Manager (wincred)
- **First Push:** Will prompt for GitHub token/browser auth

### Aliases
- `gh:` → `https://github.com/` (e.g., `gh:Piero-Porfirio/repo`)

---

## Session Management (NEW)

### Sub-Agent Spawning

**Tool:** `sessions_spawn` - Create isolated agent sessions for parallel work

**Usage:**
```python
# Spawn a child session
result = sessions_spawn(
    task="Detailed task description with context...",
    agentId="main",  # From agents_list()
    thinking="off",  # or "on" for deep reasoning
    timeoutSeconds=300
)

# Result announced back to parent automatically
```

**Session Tools:**

| Tool | Purpose |
|------|---------|
| `agents_list()` | See available agent IDs |
| `sessions_spawn(...)` | Create isolated child session |
| `sessions_list(...)` | Monitor active sessions |
| `sessions_send(sessionKey, message)` | Push message to child |
| `sessions_history(...)` | View session transcript |

**Pre-Spawn Checklist:**
- [ ] Check `agents_list()` for available IDs
- [ ] Current: only `agentId="main"` available (not configured for isolated)
- [ ] Task description is specific with full context
- [ ] Timeout appropriate for complexity
- [ ] Parent TaskMaster updated before spawn
- [ ] Result integration planned

**Configuration Required for Isolated Sessions:**
```json
{
  "agents": {
    "researcher": {
      "model": "ollama/kimi-k2.5:cloud",
      "thinking": "off"
    },
    "coder": {
      "model": "ollama/kimi-k2.5:cloud",
      "thinking": "on"
    }
  }
}
```

### Sub-Agent Communication Protocols

**Child → Parent:**
- Results announced automatically when task complete
- Format: `## Task Complete: [NAME]` header
- Include status, summary, findings, deliverables, next steps

**Parent → Child:**
- Use `sessions_send(sessionKey, message)` for mid-task guidance
- Send context updates, constraints, clarifications

**Best Practices:**
1. Pass ALL context in task description (children are isolated)
2. Set appropriate timeouts (60s for quick, 5min for complex)
3. Update TaskMaster before spawning
4. Have synthesis plan for multiple children
5. Handle timeouts gracefully

---

### Environment

- Host: Windows 10.0.26120
- Shell: PowerShell
- Gateway: Requires manual start for some operations
- Sub-Agent Support: Partial (main agent only, isolated config needed for full features)

---

## Git/GitHub Configuration

### Identity
- **User Name:** TheBotfather
- **Email:** porfirio.piero+github@gmail.com
- **Default Branch:** main

### GitHub Account
- **Username:** Piero-Porfirio
- **User ID:** 49736924
- **Remote:** https://github.com/Piero-Porfirio/openclaw-workspace.git
- **REMINDER:** Always use Piero-Porfirio (not Porfirio-Piero)

### Credential Handling
- **Helper:** Windows Credential Manager (wincred)
- **First Push:** Will prompt for GitHub token/browser auth
- **Auth Script:** `scripts/github-auth-helper.ps1`

### Quick Commands
```powershell
# Check config
git config --list

# Push current branch
git push origin HEAD

# Push all branches
git push --all origin
```
