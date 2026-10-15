$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Test-Path node_modules)) { throw 'Run npm ci with internet once first.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
Write-Host 'dist is self-contained. Run node scripts/serve.mjs; no internet needed.'
