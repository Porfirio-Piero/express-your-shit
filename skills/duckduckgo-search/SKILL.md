---
name: duckduckgo-search
description: Search the web using DuckDuckGo HTML scraping. Free alternative to Brave Search that doesn't require API keys. Use when needing web search without API configuration, or when Brave Search is unavailable, or when web_search tool returns "missing_brave_api_key" error. Returns search results with titles, URLs, and snippets. Perfect for quick research without API setup.
---

# DuckDuckGo Search Skill

This skill provides web search capabilities using DuckDuckGo's HTML endpoint, avoiding the need for API keys.

## When to Use This Skill

- When `web_search` tool fails due to missing Brave Search API key
- For quick web searches without API configuration
- As a fallback when other search providers are unavailable
- For privacy-focused searches (DuckDuckGo doesn't track users)

## Limitations

- Uses HTML scraping (may break if DuckDuckGo changes their page structure)
- No freshness filters (unlike Brave's past day/week/month filters)
- No country/language targeting
- May trigger anti-bot detection with heavy usage

## Quick Start

### Option 1: Use the Wrapper Script (Web-Search Compatible)

```powershell
# Navigate to skill scripts directory
cd ~/.openclaw/workspace/skills/duckduckgo-search/scripts

# Run search
.\search.ps1 -Query "your search query" -Count 5
```

### Option 2: Use the Core Script

```powershell
.\scripts\ddg-search.ps1 -Query "NAICS code music store" -Count 5
```

### Option 3: Use with exec (From Anywhere)

```powershell
# From OpenClaw, use:
exec: powershell -ExecutionPolicy Bypass -File ~/.openclaw/workspace/skills/duckduckgo-search/scripts/ddg-search.ps1 -Query "your query" -Count 5
```

## Usage

### Script: `scripts/ddg-search.ps1`

PowerShell script that performs DuckDuckGo HTML search and returns JSON results.

**Parameters:**
- `-Query` (required): Search query string
- `-Count` (optional): Number of results (default: 10, max: 30)

**Example:**
```powershell
.\scripts\ddg-search.ps1 -Query "NAICS code for music store" -Count 5
```

**Output Format:**
```json
{
  "query": "NAICS code for music store",
  "provider": "duckduckgo",
  "count": 5,
  "results": [
    {
      "title": "NAICS Code 451140 - Musical Instrument and Supplies Stores",
      "url": "https://www.naics.com/naics-code-451140/",
      "description": "This industry comprises establishments primarily engaged in retailing new musical instruments...",
      "siteName": "naics.com"
    }
  ]
}
```

## Making DuckDuckGo the Default Search

### Option A: Create a Shell Alias (Recommended)

Add to your PowerShell profile (`$PROFILE`):

```powershell
function ddg-search {
    param($q, $c = 10)
    & "$env:USERPROFILE\.openclaw\workspace\skills\duckduckgo-search\scripts\ddg-search.ps1" -Query $q -Count $c | ConvertFrom-Json
}

# Usage:
# ddg-search -q "latest Node.js version" -c 5
```

### Option B: Configure OpenClaw to Use DuckDuckGo

OpenClaw doesn't have a native configuration for DuckDuckGo, but you can create a workflow where:

1. When `web_search` fails with "missing_brave_api_key"
2. Automatically fall back to this skill

**Integration Pattern:**
```python
# Pattern for OpenClaw agents
result = web_search(query="something")
if result.error == "missing_brave_api_key":
    # Fall back to DuckDuckGo
    result = exec(command=f"powershell -File ~/.openclaw/workspace/skills/duckduckgo-search/scripts/ddg-search.ps1 -Query '{query}' -Count 5")
```

## Implementation Notes

The script uses:
- DuckDuckGo HTML endpoint: `https://html.duckduckgo.com/html/`
- POST request with form data
- HTML parsing via regex to extract results
- URL decoding to resolve DuckDuckGo redirect URLs

## Error Handling

If DuckDuckGo returns the homepage instead of search results, the script will indicate possible anti-bot detection and suggest:
1. Reducing search frequency
2. Adding delays between searches
3. Using alternative search methods

## File Locations

- Skill: `~/.openclaw/workspace/skills/duckduckgo-search/`
- Main script: `~/.openclaw/workspace/skills/duckduckgo-search/scripts/ddg-search.ps1`
- Wrapper: `~/.openclaw/workspace/skills/duckduckgo-search/scripts/search.ps1`
- Docs: `~/.openclaw/workspace/skills/duckduckgo-search/SKILL.md`
