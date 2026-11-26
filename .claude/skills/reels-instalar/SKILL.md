---
name: reels-instalar
description: Instala y diagnostica reels-ia-local en Mac, Windows o Linux - revisa si la computadora aguanta la clonación de voz (RAM, GPU NVIDIA, chip Apple, disco), instala Python, Node, ffmpeg, los modelos y Chrome para renderizar. Úsala cuando digan "instala", "configura", "¿mi compu aguanta?", "no funciona la voz", "error al instalar", o cuando falte reels.config.json.
---

# Instalar y diagnosticar

## 1. Diagnóstico primero (no instala nada)

```bash
cd voice
uv run --no-project --python 3.12 doctor.py
```

Si `uv` no existe todavía, salta al paso 2: el instalador lo pone. `doctor.py` solo usa la biblioteca estándar.

Explícale al usuario el resultado en palabras simples:

| Su equipo | Motor | Voz | Qué esperar |
|---|---|---|---|
| Mac M1/M2/M3/M4 con 16 GB o más | `mlx` | Qwen3-TTS 1.7B (clona) | Rápido: un video de 1 min tarda pocos minutos en voz |
| Mac con chip Apple y 8 GB | `mlx` | Qwen3-TTS 0.6B (clona) | Bien; cierra otras apps mientras genera |
| PC con NVIDIA de 8 GB+ VRAM | `cuda` | Qwen3-TTS 1.7B (clona) | Rápido |
| PC con NVIDIA de 4–8 GB | `cuda` | Qwen3-TTS 0.6B (clona) | Rápido |
| PC sin NVIDIA, 16 GB+ RAM | `cpu` | Qwen3-TTS 0.6B (clona) | **Lento**: varios minutos por cada minuto de video. Útil, pero paciencia |
| PC sin NVIDIA, menos de 16 GB | `cpu` | Kokoro (no clona) | Voz genérica en español; rápido |
| GPU AMD / Mac Intel | `cpu` | según RAM | AMD aún no tiene soporte; usa el procesador |

Espacio: entre 6 y 12 GB para modelos y dependencias (lo dice el diagnóstico). El render de video funciona en todas (Chrome sin pantalla + ffmpeg).

## 2. Instalar

Mac o Linux:

```bash
./install.sh
```

Windows (PowerShell, no hace falta administrador salvo que winget lo pida):

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Opciones: `--sin-modelos` / `-SinModelos` (descarga en el primer uso), `--motor cpu` / `-Motor cpu`, `--voz 0.6B` / `-Voz 0.6B` para forzar.

El instalador: herramientas (git, ffmpeg, Node 22+, uv; con Homebrew, apt+nvm o winget) → `doctor.py --write` (crea `reels.config.json`) → `uv sync --extra <motor>` en `voice/` → descarga de modelos → Chrome de HyperFrames → skills de HyperFrames (opcional).

Corre el instalador en segundo plano si tu entorno lo permite (la descarga de modelos tarda), y cuenta lo que va pasando. Si pide contraseña (sudo, Homebrew), pídele al usuario que lo corra él en su terminal: no escribas contraseñas.

## 3. Verificar

```bash
cd voice
uv run probar.py --engine kokoro      # rápido: confirma que el audio funciona
uv run probar.py yo                   # cuando ya grabó su voz (skill reels-voz): clona y mide la velocidad
cd ../studio && npx --yes hyperframes@0.8.223 doctor
```

`probar.py` imprime "s por segundo de voz": menos de 1 es más rápido que tiempo real.

## Problemas comunes

- **Mac: falta Homebrew** → que lo instale desde https://brew.sh y repita.
- **Windows: falta winget** → "App Installer" en Microsoft Store.
- **Windows: comando no encontrado después de instalar** → cerrar y abrir PowerShell (el PATH se refresca) y repetir el instalador.
- **`PyTorch no ve tu NVIDIA`** → actualizar el driver NVIDIA (570 o mayor, por CUDA 12.8). Mientras: `uv run --no-project --python 3.12 doctor.py --write --motor cpu` y `uv sync --extra cpu`.
- **Linux: error de PortAudio al grabar** → `sudo apt install libportaudio2`.
- **Se queda sin memoria al generar voz** → bajar a 0.6B: `doctor.py --write --voz 0.6B`, y `uv run descargar.py`.
- **Cambió de computadora o de GPU** → repetir `./install.sh` (es idempotente).
- **Linux: Chrome no arranca al renderizar** (faltan librerías en Ubuntu mínimo o WSL) → `sudo apt install libnss3 libatk-bridge2.0-0 libgbm1 libxkbcommon0 libasound2t64` (en Ubuntu viejo, `libasound2`).
- **Windows con WSL**: funciona como Linux, pero para usar la NVIDIA dentro de WSL hace falta el driver de Windows con soporte WSL. Más simple: correr `install.ps1` en Windows directo.
- **Chrome no descarga** → `cd studio && npx --yes hyperframes@0.8.223 browser ensure --force`.

Para cambiar de motor a mano: `doctor.py --write --motor X` y luego `uv sync --extra X` (mlx, cuda o cpu).
