"""Prueba rápida de una voz: genera una frase y la guarda para escucharla.

Uso:
  uv run probar.py yo                         clona assets/voces/yo.wav
  uv run probar.py yo --texto "Hola, ¿qué tal?"
  uv run probar.py --engine kokoro            voz genérica, sin clonar

Escribe voice/test/<nombre>.wav e imprime cuánto tardó (para saber qué tan rápido va tu equipo).
"""
import argparse
import time
from pathlib import Path

import motor
from tts import write_wav

ROOT = Path(__file__).resolve().parent.parent
TEXT = ("Los agentes de inteligencia artificial ya no solo responden preguntas. "
        "Ahora escriben código y despliegan a producción. ¿Y quién revisa lo que hacen?")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name", nargs="?", default="yo", help="voz en assets/voces/<nombre>.wav")
    ap.add_argument("--engine", choices=["qwen", "kokoro"])
    ap.add_argument("--voice", help="voz de Kokoro")
    ap.add_argument("--texto", default=TEXT)
    args = ap.parse_args()

    engine = args.engine or motor.config()["voz"]["engine"]
    t0 = time.time()
    sr, gen = motor.tts(engine, ROOT / f"assets/voces/{args.name}.wav", args.voice)
    t1 = time.time()
    audio = gen(args.texto)
    t2 = time.time()
    out = Path(__file__).parent / "test" / f"{args.name if engine == 'qwen' else 'kokoro'}.wav"
    out.parent.mkdir(exist_ok=True)
    write_wav(out, audio, sr)
    dur = len(audio) / sr
    print(f"{out}  ({dur:.1f} s de audio)")
    print(f"Carga del modelo {t1 - t0:.0f} s · generación {t2 - t1:.0f} s · {(t2 - t1) / dur:.1f} s por segundo de voz")


if __name__ == "__main__":
    main()
