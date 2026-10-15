$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22.12+ is required. Install Node.js and retry. No tools are downloaded automatically.' }
$nodeVersion = [version]((node --version).TrimStart('v'))
if ($nodeVersion -lt [version]'22.12.0') { throw 'Node.js 22.12+ is required.' }
$needsBuild = -not (Test-Path -LiteralPath 'dist/index.html')
if (-not $needsBuild) {
 $built = (Get-Item -LiteralPath 'dist/index.html').LastWriteTime
 $inputs = @(Get-ChildItem -LiteralPath 'src' -Recurse -File) + @(Get-Item package.json,package-lock.json,vite.config.ts,tsconfig.json)
 $needsBuild = @($inputs | Where-Object LastWriteTime -gt $built).Count -gt 0
}
if ($needsBuild) {
 if (-not (Test-Path -LiteralPath 'node_modules')) { throw 'Rebuild needed but dependencies are missing. Run npm ci once with internet, then retry.' }
 npm run build
 if ($LASTEXITCODE -ne 0) { throw 'Production build failed. Review errors above.' }
}
Write-Host 'Signal Intelligence — local/offline production app: http://127.0.0.1:4173'
node scripts/serve.mjs
