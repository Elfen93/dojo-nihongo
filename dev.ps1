# Entorno local de Dojo 日本語 (Windows, PowerShell). Uso:  .\dev.ps1            -> construye y sirve en http://localhost:8000
#                                                          .\dev.ps1 -Test      -> además instala Playwright y pasa la prueba
param([switch]$Test)
$ErrorActionPreference = 'Stop'
function Need($cmd, $hint) { if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Write-Host "Falta '$cmd'. $hint" -ForegroundColor Yellow; exit 1 } }
Need git   'Instala Git: https://git-scm.com/download/win'
$py = if (Get-Command python -ErrorAction SilentlyContinue) { 'python' } elseif (Get-Command py -ErrorAction SilentlyContinue) { 'py' } else { $null }
if (-not $py) { Write-Host "Falta Python 3. Instálalo desde https://www.python.org/downloads/ (marca 'Add to PATH')." -ForegroundColor Yellow; exit 1 }
Set-Location $PSScriptRoot
git pull
& $py build.py
if ($Test) {
  Need node 'Instala Node 20 o superior: https://nodejs.org'
  if (-not (Test-Path node_modules)) { npm install playwright; npx playwright install chromium }
  node test-web.js
}
Write-Host "Abre http://localhost:8000  (Ctrl+C para parar)" -ForegroundColor Green
& $py -m http.server 8000
