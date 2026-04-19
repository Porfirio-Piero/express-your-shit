# Commit and Push Script for Opportunity Lab
# Usage: .\scripts\commit-and-push.ps1 -Branch "feat/scout/new-feature" -Message "Add new feature"

param(
    [Parameter(Mandatory=$true)]
    [string]$Branch,
    
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [string]$BaseBranch = "develop"
)

# Check if we're in a git repo
if (-not (git rev-parse --git-dir 2>$null)) {
    Write-Error "Not in a git repository"
    exit 1
}

# Check for changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit" -ForegroundColor Yellow
    exit 0
}

Write-Host "Creating branch: $Branch" -ForegroundColor Cyan

# Create and checkout branch
git checkout -b $Branch 2>$null || git checkout $Branch

# Stage all changes
git add -A

# Commit
git commit -m "$Message"

# Push to origin
git push -u origin $Branch

Write-Host "Branch '$Branch' pushed successfully" -ForegroundColor Green
Write-Host "Create a PR at: https://github.com/$(git remote get-url origin | Split-Path -Leaf)/pull/new/$Branch"
