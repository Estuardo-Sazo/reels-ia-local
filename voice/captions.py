"""Transcribe un audio con Whisper y guarda tiempos por palabra (MLX en Mac, PyTorch en Windows/Linux).

Uso: uv run captions.py <audio.wav> <salida.json> [guion.txt]

Con el guion, el texto de los subtítulos sale del guion (bien escrito: LiteLLM, PyPI, MCP…)
y Whisper solo aporta los tiempos: se alinean ambas secuencias de palabras y las del guion
que Whisper oyó distinto toman el tiempo de su tramo. También avisa si el audio repite o se
salta palabras, señal de que la voz tartamudeó y conviene regenerar esa frase (tts.py --redo).
"""
import json
import re
import sys
import unicodedata
from difflib import SequenceMatcher

from pathlib import Path

import motor
import script as guion
from motor import SAMPLE_RATE, load_audio


def norm(word: str) -> str:
    w = unicodedata.normalize("NFD", word.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def align(script_words: list[str], heard: list[dict]) -> tuple[list[dict], list[str]]:
    """Asigna a cada palabra del guion el tiempo de la palabra oída que le corresponde."""
    a, b = [norm(w) for w in script_words], [norm(h["text"]) for h in heard]
    out, issues = [None] * len(script_words), []
    for tag, i1, i2, j1, j2 in SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = (heard[j1 + k]["start"], heard[j1 + k]["end"])
        elif tag == "replace":
            # Reparte el tramo oído entre las palabras del guion de ese tramo
            t0, t1 = heard[j1]["start"], heard[j2 - 1]["end"]
            step = (t1 - t0) / (i2 - i1)
            for k in range(i2 - i1):
                out[i1 + k] = (t0 + k * step, t0 + (k + 1) * step)
        elif tag == "insert" and i1 < len(a):  # tras el final suele ser Whisper alucinando sobre silencio
            issues.append(f"el audio tiene de más: {' '.join(h['text'] for h in heard[j1:j2])!r} (t={heard[j1]['start']:.1f}s)")
        elif tag == "delete":
            issues.append(f"el audio se salta: {' '.join(script_words[i1:i2])!r}")
    # Palabras sin tiempo (saltadas): se pegan a la anterior
    last = (0.0, 0.0)
    for k, t in enumerate(out):
        out[k] = t if t else (last[1], last[1])
        last = out[k]
    words = [{"text": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(script_words, out)]
    return words, issues


def transcribe(audio, prompt: str | None, offset: float = 0.0) -> tuple[list[dict], str]:
    result = motor.transcribe(audio, prompt)
    heard = [
        {"text": w["word"].strip(), "start": w["start"] + offset, "end": w["end"] + offset}
        for seg in result["segments"]
        for w in seg.get("words", [])
    ]
    return heard, result["text"].strip()


def main(audio_path: str, out_path: str, script_path: str | None = None) -> None:
    lines = [guion.display(l) for l in guion.lines(script_path)] if script_path else None
    segments_path = Path(audio_path).with_name("segments.json")

    if lines and segments_path.exists():
        # Frase por frase (con los cortes de tts.py): evita que Whisper repita texto en audios largos
        audio = load_audio(audio_path)
        segments = json.loads(segments_path.read_text(encoding="utf-8"))["segments"]
        words, issues, heard_text = [], [], []
        for line, seg in zip(lines, segments):
            a, b = int(max(0, seg["start"] - 0.05) * SAMPLE_RATE), int((seg["end"] + 0.15) * SAMPLE_RATE)
            heard, said = transcribe(audio[a:b], line, a / SAMPLE_RATE)
            w, iss = align(line.split(), heard) if heard else ([], [f"sin audio para: {line!r}"])
            words += w
            issues += [f"frase {seg['index'] + 1}: {m}" for m in iss]
            heard_text.append(said)
        text, heard_all = " ".join(lines), " ".join(heard_text)
    else:
        script = " ".join(lines) if lines else None
        heard, heard_all = transcribe(audio_path, script)
        if script:
            words, issues = align(script.split(), heard)
            text = script
        else:
            words, issues, text = [{**h, "start": round(h["start"], 3), "end": round(h["end"], 3)} for h in heard], [], heard_all

    for msg in issues:
        print("AVISO:", msg)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"text": text, "heard": heard_all, "words": words}, f, ensure_ascii=False, indent=2)
    print(f"{len(words)} palabras -> {out_path}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
