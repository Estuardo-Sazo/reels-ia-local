#!/usr/bin/env bash
# Instalador de reels-ia-local para Mac y Linux.
#
#   ./install.sh                     todo: herramientas, diagnóstico, Python, modelos, Chrome
#   ./install.sh --sin-modelos       no descarga modelos ahora (se bajan en el primer video)
#   ./install.sh --sin-skills        no instala las skills de HyperFrames en tu agente
#   ./install.sh --motor cpu         fuerza un motor (mlx | cuda | cpu)
#   ./install.sh --voz 0.6B          fuerza un modelo de voz (1.7B | 0.6B | kokoro)
#
# Se puede correr varias veces: lo que ya está instalado se salta.
set -euo pipefail
cd "$(dirname "$0")"

HF="hyperframes@0.8.223"
MODELS=1
SKILLS=1
DOCTOR_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --sin-modelos) MODELS=0 ;;
    --sin-skills) SKILLS=0 ;;
    --motor) DOCTOR_ARGS+=(--motor "$2"); shift ;;
    --voz) DOCTOR_ARGS+=(--voz "$2"); shift ;;
    *) echo "Opción desconocida: $1"; exit 1 ;;
  esac
  shift
done

step() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok() { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }
node_ok() { have node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; }

OS="$(uname -s)"

step "1/6 Herramientas del sistema (git, ffmpeg, Node 22+, uv)"
if [ "$OS" = "Darwin" ]; then
  if ! have brew; then
    echo "Falta Homebrew. Instálalo con el comando de https://brew.sh y vuelve a correr ./install.sh"
    exit 1
  fi
  for pkg in git ffmpeg; do have "$pkg" && ok "$pkg" || brew install "$pkg"; done
  node_ok && ok "node $(node -v)" || brew install node
elif [ "$OS" = "Linux" ]; then
  if have apt-get; then
    PKGS=()
    have git || PKGS+=(git)
    have ffmpeg || PKGS+=(ffmpeg)
    have curl || PKGS+=(curl)
    ldconfig -p 2>/dev/null | grep -q libportaudio || PKGS+=(libportaudio2)
    if [ ${#PKGS[@]} -gt 0 ]; then
      echo "  Instalando con apt (pide tu contraseña): ${PKGS[*]}"
      sudo apt-get update -qq && sudo apt-get install -y "${PKGS[@]}"
    fi
  elif have dnf; then
    have ffmpeg || warn "Instala ffmpeg (RPM Fusion) y portaudio: sudo dnf install ffmpeg portaudio git"
  elif have pacman; then
    have ffmpeg || warn "Instala: sudo pacman -S ffmpeg portaudio git"
  fi
  if ! node_ok; then
    echo "  Instalando Node 22 con nvm (en tu usuario, sin sudo)…"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    nvm install 22
  fi
  ok "git, ffmpeg, node $(node -v)"
else
  echo "Sistema no soportado por este script ($OS). En Windows usa install.ps1"
  exit 1
fi
if ! have uv; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
ok "uv $(uv --version | cut -d' ' -f2)"

step "2/6 Diagnóstico de tu computadora"
( cd voice && uv run --no-project --python 3.12 doctor.py --write ${DOCTOR_ARGS[@]+"${DOCTOR_ARGS[@]}"} )
MOTOR="$(uv run --no-project --python 3.12 python -c 'import json;print(json.load(open("reels.config.json"))["motor"])')"

step "3/6 Python 3.12 y motor de voz ($MOTOR)"
( cd voice && uv sync --extra "$MOTOR" )
ok "entorno en voice/.venv"

step "4/6 Modelos de voz y subtítulos"
if [ "$MODELS" = 1 ]; then
  ( cd voice && uv run descargar.py )
else
  warn "saltado: se descargan en el primer uso"
fi

step "5/6 HyperFrames y Chrome para renderizar"
( cd studio && npx --yes "$HF" browser ensure )
ok "Chrome listo"

step "6/6 Skills de HyperFrames para tu agente (opcional)"
if [ "$SKILLS" = 1 ]; then
  ( cd studio && npx --yes "$HF" skills update ) || warn "no se pudieron instalar; no son obligatorias"
else
  warn "saltado"
fi

printf "\n\033[1;32m¡Listo!\033[0m\n"
echo "Siguiente paso: graba tu voz (unos 15 segundos):"
echo "  cd voice && uv run grabar.py yo"
echo "Luego abre Claude Code en esta carpeta y pide: «hazme un video sobre …»"
