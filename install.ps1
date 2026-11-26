# Instalador de reels-ia-local para Windows 10/11.
#
#   powershell -ExecutionPolicy Bypass -File install.ps1
#   powershell -ExecutionPolicy Bypass -File install.ps1 -SinModelos
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Motor cpu -Voz 0.6B
#
# Usa winget (viene con Windows 11 y Windows 10 actualizado). Se puede correr varias veces.
param(
  [switch]$SinModelos,
  [switch]$SinSkills,
  [ValidateSet("cuda", "cpu")][string]$Motor,
  [ValidateSet("1.7B", "0.6B", "kokoro")][string]$Voz
)
$ErrorActionPreference = "Stop"
$env:PYTHONUTF8 = "1"            # acentos y símbolos en la consola de Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location $PSScriptRoot
$HF = "hyperframes@0.8.223"

function Step($t) { Write-Host "`n> $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  OK $t" -ForegroundColor Green }
function Warn($t) { Write-Host "  !  $t" -ForegroundColor Yellow }
function Have($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function RefreshPath {
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
}
function Check($what) { if ($LASTEXITCODE -ne 0) { throw "Falló: $what" } }
function WingetInstall($id, $cmd) {
  if (Have $cmd) { Ok $cmd; return }
  Write-Host "  Instalando $id..."
  winget install --id $id -e --source winget --silent --accept-package-agreements --accept-source-agreements
  RefreshPath
  if (-not (Have $cmd)) { throw "No se pudo instalar $cmd. Cierra y abre PowerShell, y vuelve a correr el instalador." }
  Ok $cmd
}

Step "1/6 Herramientas del sistema (git, ffmpeg, Node 22+, uv)"
if (-not (Have winget)) {
  throw "Falta winget. Instala 'App Installer' desde Microsoft Store y vuelve a correr."
}
WingetInstall "Git.Git" "git"
WingetInstall "Gyan.FFmpeg" "ffmpeg"
$nodeOk = (Have node) -and ([int]((node -p "process.versions.node.split('.')[0]")) -ge 22)
if (-not $nodeOk) {
  winget install --id OpenJS.NodeJS.LTS -e --source winget --silent --accept-package-agreements --accept-source-agreements
  RefreshPath
}
Ok "node $(node -v)"
WingetInstall "astral-sh.uv" "uv"

Step "2/6 Diagnóstico de tu computadora"
$dargs = @("run", "--no-project", "--python", "3.12", "doctor.py", "--write")
if ($Motor) { $dargs += @("--motor", $Motor) }
if ($Voz) { $dargs += @("--voz", $Voz) }
Push-Location voice
uv @dargs; Check "diagnóstico"
Pop-Location
$cfg = Get-Content reels.config.json -Raw | ConvertFrom-Json
$m = $cfg.motor

Step "3/6 Python 3.12 y motor de voz ($m)"
Push-Location voice
uv sync --extra $m; Check "uv sync"
Pop-Location
Ok "entorno en voice\.venv"

Step "4/6 Modelos de voz y subtítulos"
if (-not $SinModelos) {
  Push-Location voice
  uv run descargar.py; Check "descarga de modelos"
  Pop-Location
} else { Warn "saltado: se descargan en el primer uso" }

Step "5/6 HyperFrames y Chrome para renderizar"
Push-Location studio
npx --yes $HF browser ensure; Check "Chrome"
Pop-Location
Ok "Chrome listo"

Step "6/6 Skills de HyperFrames para tu agente (opcional)"
if (-not $SinSkills) {
  Push-Location studio
  npx --yes $HF skills update
  if ($LASTEXITCODE -ne 0) { Warn "no se pudieron instalar; no son obligatorias" }
  Pop-Location
} else { Warn "saltado" }

Write-Host "`nListo!" -ForegroundColor Green
Write-Host "Siguiente paso: graba tu voz (unos 15 segundos):"
Write-Host "  cd voice; uv run grabar.py yo"
Write-Host "Luego abre Claude Code en esta carpeta y pide: 'hazme un video sobre ...'"
