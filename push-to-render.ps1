# Push MoneyFlow to Render GitHub repos (backend + frontend)
# Run from repo root: .\push-to-render.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "`n=== 1/2 Backend -> sanjanashetti13/moneyflow-backend (branch main) ===" -ForegroundColor Cyan
Set-Location "$root\moneyflow-backend"
git status --short
git push origin master:main
Write-Host "Backend pushed." -ForegroundColor Green

Write-Host "`n=== 2/2 Frontend -> sanjanashetti13/moneyflow-frontend (branch main) ===" -ForegroundColor Cyan
$feDeploy = "$root\_deploy\moneyflow-frontend"
if (-not (Test-Path "$feDeploy\.git")) {
    Write-Host "First run: cloning frontend repo into _deploy\moneyflow-frontend ..."
    New-Item -ItemType Directory -Force -Path "$root\_deploy" | Out-Null
    git clone https://github.com/sanjanashetti13/moneyflow-frontend.git $feDeploy
} elseif (-not (git -C $feDeploy remote get-url origin 2>$null)) {
    Write-Host "Adding origin remote to _deploy\moneyflow-frontend ..."
    git -C $feDeploy remote add origin https://github.com/sanjanashetti13/moneyflow-frontend.git
}
robocopy "$root\moneyflow-frontend" $feDeploy /E /XD node_modules dist .git .vite /XF .env build_log.txt /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Set-Location $feDeploy
$changes = git status --porcelain
if ($changes) {
    git add -A
    git commit -m "Sync frontend for Render deployment"
}
git push origin main
Write-Host "Frontend pushed." -ForegroundColor Green

Write-Host "`n=== Optional: monorepo moneyflow_AI ===" -ForegroundColor Cyan
Set-Location $root
git push origin main

Write-Host "`nDone. You push when ready — then redeploy both services on Render (Clear build cache)." -ForegroundColor Green
Write-Host "Backend health: https://moneyflow-backend-hyh8.onrender.com/api/health" -ForegroundColor Yellow
