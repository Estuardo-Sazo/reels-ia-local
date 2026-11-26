"""Genera la voz de un guion (una frase por línea) y la une en un solo WAV.

Uso: uv run tts.py <guion.txt> <carpeta_salida> [--engine qwen|kokoro] [--ref voz.wav] [--tempo 1.1] [--redo 3,8]

Cada frase se guarda en <carpeta_salida>/lines/. Si una frase sale mal (tartamudeo, mala
entonación), --redo regenera solo esas frases (numeradas desde 1) y reutiliza las demás.

Motores (el modelo exacto lo elige doctor.py según tu computadora, ver reels.config.json):
  qwen    (por defecto) Qwen3-TTS Base clonando tu voz de referencia: natural y la misma voz
          en todos los episodios. La referencia es un WAV + un .txt con su transcripción exacta.
  kokoro  Kokoro 82M: rápido, voz genérica (no clona).

Escribe en la carpeta de salida:
  voz.wav        audio completo
  segments.json  inicio y fin de cada frase, para sincronizar escenas
"""
import argparse
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

import motor
import script

ROOT = Path(__file__).resolve().parent.parent
GAP_SECONDS = 0.25


def write_wav(path: Path, pcm: np.ndarray, sr: int) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(pcm, -1, 1) * 32767).astype(np.int16).tobytes())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("out_dir")
    ap.add_argument("--engine", choices=["qwen", "kokoro"], help="por defecto, el de reels.config.json")
    ap.add_argument("--ref", default=str(ROOT / "assets/voces/yo.wav"), help="voz a clonar (WAV + .txt al lado)")
    ap.add_argument("--voice", help="voz de Kokoro (em_alex en Mac, ef_dora en Windows/Linux)")
    ap.add_argument("--tempo", type=float, default=1.1, help="acelera la voz sin cambiar el tono (ffmpeg atempo)")
    ap.add_argument("--redo", default="", help="frases a regenerar, p. ej. 3,8 (las demás salen de la caché)")
    args = ap.parse_args()

    engine = args.engine or motor.config()["voz"]["engine"]
    lines = [script.spoken(l) for l in script.lines(args.script)]
    out = Path(args.out_dir)
    cache = out / "lines"
    cache.mkdir(parents=True, exist_ok=True)
    redo = {int(n) - 1 for n in args.redo.split(",") if n.strip()}

    todo = [i for i, line in enumerate(lines)
            if i in redo or not (cache / f"{i + 1:02d}.wav").exists()
            or (cache / f"{i + 1:02d}.txt").read_text(encoding="utf-8") != line]
    sr, generate = (None, None)
    if todo:
        print(f"Cargando voz ({engine}, motor {motor.motor()})…", flush=True)
        sr, generate = motor.tts(engine, Path(args.ref), args.voice)

    chunks, segments, cursor = [], [], 0.0
    for i, line in enumerate(lines):
        cached = cache / f"{i + 1:02d}.wav"
        if i in todo:
            audio = generate(line)
            write_wav(cached, audio, sr)
            cached.with_suffix(".txt").write_text(line, encoding="utf-8")
        else:
            audio, line_sr = motor.read_wav(cached)
            if sr is None:
                sr = line_sr
        duration = len(audio) / sr
        chunks += [audio, np.zeros(int(GAP_SECONDS * sr), dtype=np.float32)]
        segments.append({"index": i, "text": line, "start": cursor, "end": cursor + duration})
        cursor += duration + GAP_SECONDS
        print(f"[{i + 1}/{len(lines)}] {duration:.2f}s  {line[:60]}", flush=True)

    raw = out / "voz_raw.wav"
    write_wav(raw, np.concatenate(chunks), sr)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"atempo={args.tempo},loudnorm=I=-16:TP=-1.5:LRA=11",
         "-ar", "48000", str(out / "voz.wav")],
        check=True,
    )
    raw.unlink()

    scale = 1 / args.tempo
    for s in segments:
        s["start"], s["end"] = round(s["start"] * scale, 3), round(s["end"] * scale, 3)
    total = round(cursor * scale, 3)
    (out / "segments.json").write_text(
        json.dumps({"duration": total, "segments": segments}, ensure_ascii=False, indent=2), encoding="utf-8",
    )
    print(f"Total {total:.2f}s -> {out / 'voz.wav'}")


if __name__ == "__main__":
    main()
