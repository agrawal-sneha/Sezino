# Push script for Sezino repository
# Requires a GitHub Personal Access Token (PAT) with repo scope

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

# Set remote with token
git remote remove origin 2>$null
git remote add origin "https://agrawal-sneha:$Token@github.com/agrawal-sneha/sezino.git"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/agrawal-sneha/sezino" -ForegroundColor Cyan
} else {
    Write-Host "Push failed. Check your token and try again." -ForegroundColor Red
}