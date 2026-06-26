# Provision Neon Postgres on Vercel, migrate, seed admin user, and redeploy.
# Run from repo root: .\scripts\setup-production-db.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Set-Location ..

Write-Host "=== Portfolio Career: production database setup ===" -ForegroundColor Cyan

$termsUrl = "https://vercel.com/zarul-ridzwans-projects-61bb0167/~/integrations/accept-terms/neon?source=cli"
Write-Host ""
Write-Host "Accept Neon marketplace terms in your browser (opening now):" -ForegroundColor Yellow
Write-Host $termsUrl
Start-Process $termsUrl
Read-Host "Press Enter after you have accepted the Neon terms in the browser"

Write-Host "Installing Neon Postgres (Singapore region)..." -ForegroundColor Cyan
npx vercel install neon `
  --name portfolio-career-db `
  --plan free_v3 `
  -e production `
  -m region=sin1 `
  -m auth=false `
  --non-interactive

Write-Host "Pulling production env vars..." -ForegroundColor Cyan
npx vercel env pull .env.production.local --environment=production --yes

$envFile = Get-Content ".env.production.local" -Raw
if ($envFile -notmatch "DATABASE_URL") {
  throw "DATABASE_URL was not added. Check Vercel → Settings → Environment Variables."
}

Get-Content ".env.production.local" | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    Set-Item -Path "env:$name" -Value $value
  }
}

if (-not $env:DATABASE_URL -and $env:POSTGRES_URL) { $env:DATABASE_URL = $env:POSTGRES_URL }
if (-not $env:DIRECT_URL -and $env:POSTGRES_URL_NON_POOLING) { $env:DIRECT_URL = $env:POSTGRES_URL_NON_POOLING }
if (-not $env:DIRECT_URL -and $env:DATABASE_URL) { $env:DIRECT_URL = $env:DATABASE_URL }

Write-Host "Running migrations..." -ForegroundColor Cyan
npm run db:deploy

Write-Host "Seeding admin user..." -ForegroundColor Cyan
npm run db:seed

Write-Host "Redeploying production..." -ForegroundColor Cyan
npx vercel deploy --prod --yes

Write-Host ""
Write-Host "Done! Sign in at https://www.readnest.app/login" -ForegroundColor Green
