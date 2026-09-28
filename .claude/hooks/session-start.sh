#!/bin/bash
# Prepara el entorno de video (HyperFrames) en sesiones de Claude Code en la web.
set -euo pipefail

# Solo en contenedores remotos; en local cada quien instala FFmpeg a su manera.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Instalando FFmpeg (requerido por HyperFrames para renderizar)..."
  SUDO=""
  if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
  $SUDO apt-get update -qq >/dev/null
  DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq ffmpeg >/dev/null
fi

# Precalienta la CLI fijada en video/package.json para que check/render arranquen rápido.
HF_VERSION=$(grep -o 'hyperframes@[0-9.]*' "$CLAUDE_PROJECT_DIR/video/package.json" | head -1)
npx --yes "$HF_VERSION" --version >/dev/null 2>&1 || true
