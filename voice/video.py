"""Reels a partir de tu propio video: tú ya grabaste, aquí no se genera voz.

Uso:
  uv run video.py transcribir ../recursos/mi-video.mp4
      Transcribe todo el video con tiempos y lo guarda en ../recursos/mi-video.transcripcion.json.
      Imprime las frases con su segundo: sirve para elegir los mejores momentos para cada reel.

  uv run video.py extraer ../recursos/mi-video.mp4 ../studio/assets/ep020 --de 95.5 --a 151 [--guion ../episodes/020-tema/guion.txt]
      Prepara ese tramo como episodio:
        voz.wav        el audio original del tramo (tu voz real), normalizado
        segments.json  una "frase" por cada oración que dijiste (para las escenas)
        captions.json  tiempos por palabra para los subtítulos
        media/medios.json  el tramo como video de fondo ("base"); luego: node tools/medios.mjs epNNN
      Con --guion escribe ahí lo que dijiste, una oración por línea (base para publicacion.md).
      Opcional: --encuadre llenar --x 0.4 si el video es horizontal y quieres llenar el vertical recortando.
"""
import argparse
import json
import subprocess
from pathlib import Path

import motor

ROOT = Path(__file__).resolve().parent.parent


def sentences(result: dict, offset: float = 0.0) -> tuple[list[dict], list[dict]]:
    """Oraciones (cortadas en . ? !) y palabras con tiempos relativos al inicio del tramo."""
    words = [{"text": w["word"].strip(), "start": round(w["start"] - offset, 3), "end": round(w["end"] - offset, 3)}
             for s in result["segments"] for w in s.get("words", []) if w["word"].strip()]
    segs, cur = [], []
    for k, w in enumerate(words):
        cur.append(w)
        gap = words[k + 1]["start"] - w["end"] if k + 1 < len(words) else 0
        if w["text"][-1] in ".?!…" or gap > 1.2 or k + 1 == len(words):
            segs.append({"index": len(segs), "text": " ".join(x["text"] for x in cur),
                         "start": max(0.0, cur[0]["start"]), "end": cur[-1]["end"]})
            cur = []
    return segs, words


def transcribir(video: Path) -> None:
    print(f"Transcribiendo {video.name} (puede tardar unos minutos)…", flush=True)
    result = motor.transcribe(str(video), None)
    segs, words = sentences(result)
    out = video.with_name(video.stem + ".transcripcion.json")
    out.write_text(json.dumps({"segments": segs, "words": words}, ensure_ascii=False, indent=1), encoding="utf-8")
    for s in segs:
        m, sec = divmod(s["start"], 60)
        print(f"[{int(m):02d}:{sec:05.2f} | {s['start']:7.2f}–{s['end']:7.2f}] {s['text']}")
    print(f"\n{len(segs)} frases -> {out}")


def extraer(video: Path, out: Path, de: float, a: float, guion: Path | None, encuadre: str, x: float) -> None:
    out.mkdir(parents=True, exist_ok=True)
    dur = a - de
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(de), "-t", str(dur), "-i", str(video), "-vn",
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1", str(out / "voz.wav")], check=True)
    print("Transcribiendo el tramo…", flush=True)
    result = motor.transcribe(str(out / "voz.wav"), None)
    segs, words = sentences(result)
    if not segs:
        raise SystemExit("Whisper no oyó voz en ese tramo.")
    (out / "segments.json").write_text(json.dumps({"duration": round(dur, 3), "segments": segs}, ensure_ascii=False, indent=2), encoding="utf-8")
    text = " ".join(s["text"] for s in segs)
    (out / "captions.json").write_text(json.dumps({"text": text, "heard": text, "words": words}, ensure_ascii=False, indent=2), encoding="utf-8")

    media = out / "media"
    media.mkdir(exist_ok=True)
    cfg_path = media / "medios.json"
    cfg = json.loads(cfg_path.read_text(encoding="utf-8")) if cfg_path.exists() else {"clips": []}
    try:
        fuente = video.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        raise SystemExit(f"Pon el video dentro del proyecto (por ejemplo en recursos/): {video}")
    base = {"id": "base", "fuente": fuente, "de": de, "a": a, "capa": "fondo", "t": 0, "encuadre": encuadre, "congelar": 2}
    if encuadre == "llenar":
        base["x"] = x
    cfg["clips"] = [base] + [c for c in cfg.get("clips", []) if c.get("id") != "base"]
    cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if guion:
        guion.parent.mkdir(parents=True, exist_ok=True)
        guion.write_text("\n".join(s["text"] for s in segs) + "\n", encoding="utf-8")
    for s in segs:
        print(f"[{s['index'] + 1}] {s['start']:6.2f}–{s['end']:6.2f}  {s['text']}")
    print(f"\n{dur:.1f} s, {len(segs)} frases, {len(words)} palabras -> {out}")
    print(f"Siguiente: cd ../studio && node tools/build-data.mjs {out.resolve().relative_to(ROOT / 'studio').as_posix()} "
          f"&& node tools/medios.mjs {out.name}")


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("transcribir")
    t.add_argument("video")
    e = sub.add_parser("extraer")
    e.add_argument("video")
    e.add_argument("out_dir")
    e.add_argument("--de", type=float, required=True)
    e.add_argument("--a", type=float, required=True)
    e.add_argument("--guion")
    e.add_argument("--encuadre", choices=["completo", "llenar"], default="completo")
    e.add_argument("--x", type=float, default=0.5)
    args = ap.parse_args()
    if args.cmd == "transcribir":
        transcribir(Path(args.video))
    else:
        extraer(Path(args.video), Path(args.out_dir), args.de, args.a, Path(args.guion) if args.guion else None, args.encuadre, args.x)


if __name__ == "__main__":
    main()
