"""Genera varias tomas de algunas frases para elegir la mejor de oído.

Uso: uv run tomas.py <guion.txt> <carpeta_episodio> 3,8 [--tomas 3] [--ref voz.wav]

Útil cuando una frase sale robótica o con palabras en inglés mal dichas. Cada toma queda en
<carpeta_episodio>/tomas/NN_k.wav y se mide con Whisper: duración, palabras arrastradas (>0.7 s)
y la pausa más larga. Para usar una toma:
  uv run tomas.py ... --usar 3_1      copia la toma 1 de la frase 3 a lines/03.wav
y luego vuelve a correr tts.py (reutiliza la caché y rearma voz.wav y segments.json).
"""
import argparse
import json
import shutil
from pathlib import Path

import motor
import script
from tts import write_wav

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("out_dir", help="carpeta del episodio en studio/assets/epNNN")
    ap.add_argument("frases", help="números de frase, p. ej. 3,8")
    ap.add_argument("--tomas", type=int, default=3)
    ap.add_argument("--ref", default=str(ROOT / "assets/voces/yo.wav"))
    ap.add_argument("--usar", help="NN_k: copia esa toma a lines/ para que tts.py la use")
    args = ap.parse_args()

    out = Path(args.out_dir)
    takes = out / "tomas"
    lines = script.lines(args.script)

    if args.usar:
        n, k = args.usar.split("_")
        n = int(n)
        shutil.copy(takes / f"{n:02d}_{k}.wav", out / "lines" / f"{n:02d}.wav")
        (out / "lines" / f"{n:02d}.txt").write_text(script.spoken(lines[n - 1]), encoding="utf-8")
        print(f"Frase {n}: toma {k}. Ahora corre tts.py otra vez para rearmar voz.wav.")
        return

    takes.mkdir(parents=True, exist_ok=True)
    sr, gen = motor.tts("qwen", Path(args.ref))
    res = {}
    for n in [int(x) for x in args.frases.split(",")]:
        text = script.spoken(lines[n - 1])
        for k in range(args.tomas):
            audio = gen(text)
            f = takes / f"{n:02d}_{k}.wav"
            write_wav(f, audio, sr)
            r = motor.transcribe(str(f), None)
            w = [x for s in r["segments"] for x in s.get("words", [])]
            long_words = [(x["word"].strip(), round(x["end"] - x["start"], 2)) for x in w if x["end"] - x["start"] > 0.7]
            gap = max([round(b["start"] - a["end"], 2) for a, b in zip(w, w[1:])] or [0])
            res[f.stem] = {"dur": round(len(audio) / sr, 2), "largas": long_words, "pausa": gap, "oido": r["text"].strip()}
            print(f.stem, res[f.stem]["dur"], "s · pausa", gap, "· largas", long_words, "|", r["text"].strip(), flush=True)
    (takes / "res.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nEscucha las tomas en {takes} y elige con --usar NN_k")


if __name__ == "__main__":
    main()
