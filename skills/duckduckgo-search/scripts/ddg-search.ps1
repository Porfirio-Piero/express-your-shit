<#
.SYNOPSIS
    DuckDuckGo HTML Search Script
.DESCRIPTION
    Searches DuckDuckGo via HTML endpoint and returns results as JSON.
    Free alternative to Brave Search - no API key required.
.PARAMETER Query
    The search query string
.PARAMETER Count
    Number of results to return (default: 10, max: 30)
.EXAMPLE
    .\ddg-search.ps1 -Query "NAICS code music store" -Count 5
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    
    [Parameter(Mandatory=$false)]
    [int]$Count = 10
)

# Cap count at 30
if ($Count -gt 30) { $Count = 30 }
if ($Count -lt 1) { $Count = 1 }

$DUCKDUCKGO_HTML_ENDPOINT = "https://html.duckduckgo.com/html/"

function Get-SiteName($url) {
    try {
        $uri = [System.Uri]$url
        return $uri.Host -replace '^www\.', ''
    } catch {
        return $null
    }
}

function Invoke-DuckDuckGoSearch {
    param($searchQuery, $maxResults)
    
    $encodedQuery = [System.Web.HttpUtility]::UrlEncode($searchQuery)
    $postData = "q=$encodedQuery"
    
    $headers = @{
        "Content-Type" = "application/x-www-form-urlencoded"
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        "Accept" = "text/html"
    }
    
    try {
        $response = Invoke-WebRequest -Uri $DUCKDUCKGO_HTML_ENDPOINT -Method POST -Body $postData -Headers $headers -TimeoutSec 30 -UseBasicParsing
        $html = $response.Content
        
        # Check if we got results or homepage (anti-bot detection)
        if ($html -match "<title>DuckDuckGo</title>" -and $html -notmatch "at DuckDuckGo") {
            throw "DuckDuckGo returned homepage instead of search results (possible anti-bot detection)"
        }
        
        return $html
    } catch {
        throw "DuckDuckGo search failed: $_"
    }
}

function Parse-DuckDuckGoResults {
    param($html, $maxResults)
    
    $results = @()
    
    # Extract result blocks
    # DuckDuckGo HTML structure: each result is in a div with class "result results_links_deep"
    $resultBlocks = [regex]::Matches($html, '<div class="result[^"]*">[\s\S]*?<\/div>\s*<\/div>')
    
    foreach ($block in $resultBlocks) {
        if ($results.Count -ge $maxResults) { break }
        
        $blockHtml = $block.Value
        
        # Extract title (h2 > a)
        $titleMatch = [regex]::Match($blockHtml, '<h2[^>]*>.*?<a[^>]*class="result__a"[^>]*>([^<]*)<\/a>')
        $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { $null }
        
        # Extract URL (h2 > a href)
        $urlMatch = [regex]::Match($blockHtml, '<h2[^>]*>.*?<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>')
        $url = if ($urlMatch.Success) { $urlMatch.Groups[1].Value.Trim() } else { $null }
        
        # Extract snippet (from result__snippet a)
        $snippetMatch = [regex]::Match($blockHtml, '<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>')
        $snippet = if ($snippetMatch.Success) { 
            $snippetMatch.Groups[1].Value -replace '<[^>]*>', '' | ForEach-Object { $_.Trim() }
        } else { 
            $null 
        }
        
        # Decode DuckDuckGo redirect URL to get actual URL
        if ($url -and $url.Contains("uddg=")) {
            try {
                $matches = [regex]::Match($url, "uddg=([^&]*)")
                if ($matches.Success) {
                    $encodedUrl = $matches.Groups[1].Value
                    $url = [System.Web.HttpUtility]::UrlDecode($encodedUrl)
                }
            } catch {
                # Keep original URL if decoding fails
            }
        }
        
        # Only add valid results
        if ($title -and $url -and $url.StartsWith("http")) {
            $results += @{
                title = $title
                url = $url
                description = $snippet -replace '\s+', ' '
                siteName = Get-SiteName $url
            }
        }
    }
    
    return $results
}

# Alternative parsing method if first one fails
function Parse-DuckDuckGoResultsFallback {
    param($html, $maxResults)
    
    $results = @()
    
    # Try alternative pattern - look for result__a class
    $linkPattern = '<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>'
    $snippetPattern = '<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>'
    
    $links = [regex]::Matches($html, $linkPattern)
    $snippets = [regex]::Matches($html, $snippetPattern)
    
    for ($i = 0; $i -lt $links.Count -and $i -lt $maxResults; $i++) {
        $linkMatch = $links[$i]
        $title = $linkMatch.Groups[2].Value.Trim()
        $url = $linkMatch.Groups[1].Value.Trim()
        
        # Decode URL
        if ($url -contains "uddg=") {
            try {
                $parsedUrl = [System.Uri]$url
                $realUrl = $parsedUrl.Query | ForEach-Object { 
                    if ($_ -match "uddg=(.*)") { 
                        [System.Web.HttpUtility]::UrlDecode($matches[1])
                    }
                }
                if ($realUrl) { $url = $realUrl }
            } catch {}
        }
        
        $snippet = if ($i -lt $snippets.Count) { 
            ($snippets[$i].Groups[1].Value -replace '<[^>]*>', '').Trim()
        } else { "" }
        
        if ($title -and $url -and $url.StartsWith("http")) {
            $results += @{
                title = $title
                url = $url
                description = $snippet
                siteName = Get-SiteName $url
            }
        }
    }
    
    return $results
}

# Main execution
try {
    Add-Type -AssemblyName System.Web
    
    $html = Invoke-DuckDuckGoSearch -searchQuery $Query -maxResults $Count
    $results = Parse-DuckDuckGoResults -html $html -maxResults $Count
    
    # If first parser returns no results, try fallback
    if ($results.Count -eq 0) {
        $results = Parse-DuckDuckGoResultsFallback -html $html -maxResults $Count
    }
    
    # Build output
    $output = @{
        query = $Query
        provider = "duckduckgo"
        count = $results.Count
        results = $results
    }
    
    # Output as JSON
    $output | ConvertTo-Json -Depth 3
    
} catch {
    Write-Error "Search failed: $_"
    exit 1
}
