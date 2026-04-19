<#
.SYNOPSIS
    Web Search Wrapper - Uses DuckDuckGo as fallback
.DESCRIPTION
    This script wraps the DuckDuckGo search and provides a web_search-compatible interface.
    Call this when web_search fails due to missing API keys.
.PARAMETER Query
    Search query string (required)
.PARAMETER Count
    Number of results to return (default: 10)
.PARAMETER Country
    Country code (optional, currently ignored - DDG doesn't support this)
.PARAMETER Language
    Language code (optional, currently ignored - DDG doesn't support this)
.PARAMETER Freshness
    Freshness filter (optional, currently ignored - DDG doesn't support this)
.EXAMPLE
    .\search.ps1 -Query "latest OpenAI news" -Count 5
# >

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    
    [int]$Count = 10,
    [string]$Country = "",
    [string]$Language = "",
    [string]$Freshness = ""
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptPath\ddg-search.ps1" -Query $Query -Count $Count
