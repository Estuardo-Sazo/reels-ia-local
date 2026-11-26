"""Capa común de voz y transcripción: el mismo código en Mac, Windows y Linux.

Lee reels.config.json (lo escribe doctor.py al instalar) y carga el motor que toca:
  mlx   mlx-audio (Qwen3-TTS, Kokoro) + mlx-whisper         Mac con chip Apple
  cuda  qwen-tts (PyTorch) + openai-whisper en la NVIDIA     Windows / Linux con NVIDIA
  cpu   qwen-tts + openai-whisper en el procesador           cualquier otra

Kokoro fuera de Mac usa `npx hyperframes tts` (ONNX, ya viene con HyperFrames).

API:
  tts(engine, ref)          -> (sample_rate, generar(texto) -> np.ndarray float32 mono)
  transcribe(audio, prompt) -> {"text", "segments": [{"words": [{"word","start","end"}]}]}
  load_audio(path)          -> np.ndarray float32 a 16 kHz (para cortar frases)
"""
import json
import os
import subprocess
import sys
import tempfile
import wave
from functools import lru_cache
from pathlib import Path

# En Windows la consola puede no ser UTF-8: que los acentos y ✓ no rompan la salida
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CONFIG = Path(os.environ.get("REELS_CONFIG") or ROOT / "reels.config.json")
SAMPLE_RATE = 16000  # Whisper
HYPERFRAMES = "hyperframes@0.8.223"
KOKORO_MLX = "mlx-community/Kokoro-82M-bf16"


@lru_cache
def config() -> dict:
    if CONFIG.exists():
        return json.loads(CONFIG.read_text(encoding="utf-8"))
    import doctor  # sin instalar todavía: diagnostica al vuelo

    d = doctor.diagnose()
    return {k: d[k] for k in ("motor", "voz", "whisper")}


def motor() -> str:
    return os.environ.get("REELS_MOTOR") or config()["motor"]


def device() -> str:
    return "cuda:0" if motor() == "cuda" else "cpu"


def read_wav(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path)) as w:
        sr, ch, width = w.getframerate(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(w.getnframes())
    dtype = {2: np.int16, 4: np.int32}[width]
    pcm = np.frombuffer(raw, dtype=dtype).astype(np.float32) / np.iinfo(dtype).max
    return (pcm.reshape(-1, ch).mean(axis=1) if ch > 1 else pcm), sr


# ---------------------------------------------------------------- voz (TTS)

def tts(engine: str, ref: Path | None, voice: str | None = None):
    """Devuelve (sample_rate, generar). engine: 'qwen' (clona ref) o 'kokoro' (voz genérica)."""
    if engine == "kokoro":
        return _kokoro(voice)
    if not ref or not ref.exists():
        raise SystemExit(
            f"No encuentro la voz de referencia {ref}.\n"
            "Grábala con:  uv run grabar.py yo   (o usa --engine kokoro para una voz genérica)"
        )
    ref_txt = ref.with_suffix(".txt")
    if not ref_txt.exists():
        raise SystemExit(f"Falta {ref_txt}: la transcripción exacta de la voz de referencia.")
    ref_text = ref_txt.read_text(encoding="utf-8").strip()
    repo = config()["voz"].get("modelo")
    if not repo:
        raise SystemExit("Tu equipo quedó configurado sin clonación (Kokoro). Usa --engine kokoro o vuelve a correr doctor.py --voz 0.6B.")

    if motor() == "mlx":
        from mlx_audio.tts.utils import load_model

        model = load_model(repo)

        def gen(text: str) -> np.ndarray:
            res = model.generate(text=text, ref_audio=str(ref), ref_text=ref_text, lang_code="spanish")
            return np.concatenate([np.asarray(r.audio, dtype=np.float32) for r in res])

        return model.sample_rate, gen

    import torch
    from qwen_tts import Qwen3TTSModel

    cuda = motor() == "cuda"
    model = Qwen3TTSModel.from_pretrained(
        repo, device_map=device(), dtype=torch.bfloat16 if cuda else torch.float32, attn_implementation="sdpa",
    )
    prompt = model.create_voice_clone_prompt(ref_audio=str(ref), ref_text=ref_text)
    sr_box = {}

    def gen(text: str) -> np.ndarray:
        wavs, sr = model.generate_voice_clone(text=text, language="Spanish", voice_clone_prompt=prompt)
        sr_box["sr"] = sr
        return np.asarray(wavs[0], dtype=np.float32).reshape(-1)

    # La frecuencia de muestreo sale de una generación corta
    gen("Hola.")
    return sr_box["sr"], gen


def _kokoro(voice: str | None):
    if motor() == "mlx":
        from mlx_audio.tts.utils import load_model

        model = load_model(KOKORO_MLX)

        def gen(text: str) -> np.ndarray:
            res = model.generate(text=text, voice=voice or "em_alex", lang_code="e", speed=1.05)
            return np.concatenate([np.asarray(r.audio, dtype=np.float32) for r in res])

        return model.sample_rate, gen

    # Fuera de Mac: el Kokoro ONNX de HyperFrames (solo voz femenina en español: ef_dora).
    # HyperFrames baja el modelo y usa kokoro-onnx de este mismo entorno de Python.
    npx = "npx.cmd" if os.name == "nt" else "npx"
    env = {**os.environ, "HYPERFRAMES_PYTHON": sys.executable}

    def gen(text: str) -> np.ndarray:
        with tempfile.TemporaryDirectory() as tmp:
            out, txt = Path(tmp) / "k.wav", Path(tmp) / "k.txt"
            txt.write_text(text, encoding="utf-8")  # por archivo: en Windows cmd.exe rompería textos con & o %
            subprocess.run([npx, "--yes", HYPERFRAMES, "tts", str(txt), "-v", voice or "ef_dora", "-l", "es", "-o", str(out)],
                           check=True, capture_output=True, env=env, shell=os.name == "nt")
            audio, sr = read_wav(out)
            gen.sr = sr
            return audio

    gen("Hola.")
    return gen.sr, gen


# ---------------------------------------------------------------- transcripción (Whisper)

def load_audio(path: str) -> np.ndarray:
    if motor() == "mlx":
        from mlx_whisper.audio import load_audio as la
    else:
        from whisper.audio import load_audio as la
    return np.asarray(la(str(path)), dtype=np.float32)


@lru_cache
def _whisper_torch():
    import whisper

    return whisper.load_model(config()["whisper"], device=device())


def transcribe(audio, prompt: str | None = None, words: bool = True) -> dict:
    """audio: ruta o np.ndarray a 16 kHz. Mismo formato de salida en todos los motores."""
    if motor() == "mlx":
        import mlx_whisper

        return mlx_whisper.transcribe(
            audio, path_or_hf_repo=config()["whisper"], language="es", word_timestamps=words, initial_prompt=prompt,
        )
    if not isinstance(audio, str):
        audio = np.asarray(audio, dtype=np.float32)
    return _whisper_torch().transcribe(
        audio, language="es", word_timestamps=words, initial_prompt=prompt, fp16=motor() == "cuda",
    )
