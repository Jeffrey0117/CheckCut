# =============================================================
# CheckCut local dev stack — starts Pokkit (8877) + CheckCut (4099)
# for the CourseBloom video-upload integration.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\dev-stack.ps1
#
# Then in another terminal run CourseBloom:
#   cd ..\coursebloom-space ; pnpm dev
# and open a tenant admin → 影片 → 新增 → 上傳檔案.
#
# Note: CheckCut runs on 4099 (not 4029) to avoid clashing with the
# deployed CheckCut that PM2 already runs on 4029 on this machine.
# Requires ffmpeg on PATH (Pokkit uses it to transcode video).
# =============================================================

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$pokkit  = Join-Path $root "..\pokkit"
$checkcut = $root

if (-not (Test-Path $pokkit)) { Write-Error "Pokkit not found at $pokkit"; exit 1 }

Write-Host "Starting Pokkit on :8877 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "cd '$pokkit'; `$env:POKKIT_PORT='8877'; `$env:POKKIT_API_KEY='devkey'; `$env:POKKIT_PUBLIC_URL='http://localhost:8877'; `$env:POKKIT_DATA_DIR='./data'; npx tsx src/index.ts"
)

Start-Sleep -Seconds 3

Write-Host "Starting CheckCut on :4099 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "cd '$checkcut'; `$env:PORT='4099'; `$env:NODE_ENV='development'; `$env:CHECKCUT_API_KEY='devkey2'; `$env:POKKIT_BASE_URL='http://localhost:8877'; `$env:POKKIT_API_KEY='devkey'; `$env:PUBLIC_URL='http://localhost:4099'; `$env:ALLOWED_ORIGINS='http://localhost:3000'; node server/index.js"
)

Write-Host ""
Write-Host "Pokkit   -> http://localhost:8877" -ForegroundColor Green
Write-Host "CheckCut -> http://localhost:4099" -ForegroundColor Green
Write-Host ""
Write-Host "CourseBloom .env already points at CHECKCUT_URL/NEXT_PUBLIC_CHECKCUT_URL = http://localhost:4099"
Write-Host "Next: cd ..\coursebloom-space ; pnpm dev"
