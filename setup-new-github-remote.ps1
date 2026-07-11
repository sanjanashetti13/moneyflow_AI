# Run from repo root after creating an empty GitHub repository.
# Usage: .\setup-new-github-remote.ps1 -RepoUrl "https://github.com/YOUR_USER/YOUR_REPO.git"

param(
    [Parameter(Mandatory = $true)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Checking for uncommitted changes..."
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes. Commit them before pushing:" -ForegroundColor Yellow
    git status --short
    exit 1
}

$remotes = git remote
if ($remotes -contains "origin") {
    $current = git remote get-url origin
    Write-Host "Removing existing origin: $current"
    git remote remove origin
}

git remote add origin $RepoUrl
Write-Host "Remote set to: $RepoUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Push when ready:" -ForegroundColor Cyan
Write-Host "  git push -u origin main"
