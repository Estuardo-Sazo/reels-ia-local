"""Graba (o importa) una voz de referencia para clonarla con tts.py.

Uso:
  uv run grabar.py yo                      graba con el micrófono predeterminado hasta que presionas Enter
  uv run grabar.py yo --mic list           lista los micrófonos conectados
  uv run grabar.py yo --mic "AKG"          otro micrófono por nombre (o parte) o número
  uv run grabar.py yo --from nota.m4a      importa una grabación hecha en otro lado (iPhone, etc.)
  uv run grabar.py yo-clase --texto mi-texto.txt
                                           texto propio para leer (otro tono, p. ej. de clase)

Escribe en assets/voces/:
  <nombre>_raw.wav  la toma original, sin procesar
  <nombre>.wav   mono 24 kHz, sin silencios al inicio ni al final, volumen normalizado
  <nombre>.txt   transcripción exacta (Whisper); revísala, el modelo la usa para alinear tu voz

Consejos: cuarto silencioso, a un palmo del micrófono, tu tono normal de narrador y frases
completas. Mejor 15 s limpios que 30 s con ruido o titubeos.
"""
import argparse
import re
import subprocess
import time
from pathlib import Path

import motor

ROOT = Path(__file__).resolve().parent.parent
VOICES = ROOT / "assets/voces"

# Texto para leer: frases de narrador de tecnología con varios sonidos del español.
READ_ME = """\
Hoy les cuento cómo un solo error de configuración dejó fuera de servicio a millones de computadoras.
La inteligencia artificial ya escribe código, revisa pull requests y despliega a producción.
¿Pero quién revisa lo que hace? Quédate, porque la respuesta te va a sorprender."""

# Pasa altos, quita silencio al inicio y al final (truco del doble reverse) y normaliza.
CLEAN = (
    "highpass=f=70,"
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,"
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse,"
    "loudnorm=I=-18:TP=-1.5:LRA=11"
)


def levels(path: Path) -> None:
    """Muestra pico y ruido de fondo de la toma original y avisa si conviene repetirla."""
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "astats", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    overall = log.split("Overall")[-1]
    peak = re.search(r"Peak level dB: (-?[\d.]+)", overall)
    floor = re.search(r"Noise floor dB: (-?[\d.]+)", overall)
    if not peak or not floor:
        return
    peak_db, floor_db = float(peak.group(1)), float(floor.group(1))
    print(f"\nNivel de la toma: pico {peak_db:.1f} dB, ruido de fondo {floor_db:.1f} dB")
    if peak_db > -1:
        print("AVISO: la voz casi satura. Baja la entrada del micrófono o aléjate un poco y repite.")
    elif peak_db < -18:
        print("AVISO: la voz quedó baja. Acércate al micrófono o sube la entrada y repite.")
    if floor_db > -50:
        print("AVISO: hay ruido de fondo. Apaga ventiladores o aire y repite.")


def mics() -> list[tuple[str, str]]:
    import sounddevice as sd
    return [(str(i), d["name"]) for i, d in enumerate(sd.query_devices()) if d["max_input_channels"] > 0]


def pick_mic(want: str) -> tuple[str, str]:
    found = mics()
    if want == "default":
        import sounddevice as sd
        idx = sd.default.device[0]
        if idx is None or idx < 0:
            raise SystemExit("No hay micrófono predeterminado. Conecta uno o elige con --mic list.")
        return str(idx), sd.query_devices(idx)["name"]
    for idx, name in found:
        if want == idx or want.lower() in name.lower():
            return idx, name
    print(f"No encuentro el micrófono «{want}». Conectados:")
    for idx, name in found:
        print(f"  {idx}  {name}")
    raise SystemExit("Conéctalo o elige otro con --mic.")


def record(dest: Path, seconds: int, mic: tuple[str, str], read_text: str, auto: bool = False) -> None:
    # Audio directo del sistema con sounddevice (CoreAudio, WASAPI o ALSA). En Mac, grabar con
    # ffmpeg/AVFoundation hacía temblar el tono de algunos micrófonos USB y el clon salía robótico.
    import threading
    import wave

    import numpy as np
    import sounddevice as sd

    print(f"\nMicrófono: {mic[1]}")
    print("\nLee en voz alta, con el tono que quieres que tenga la voz:\n")
    print(read_text)
    print()
    if not auto:
        input("Presiona Enter cuando estés listo para grabar… ")
    for n in range(10 if auto else 3, 0, -1):
        print(f"Empieza en {n}...", flush=True)
        time.sleep(1)

    sr = int(sd.query_devices(int(mic[0]))["default_samplerate"])
    chunks, peak, stop, problems = [], [0.0], threading.Event(), [0]

    def on_audio(data, frames, t, status):
        if status:
            problems[0] += 1
        chunks.append(data[:, 0].copy())
        peak[0] = max(peak[0], float(np.abs(data).max()))

    def meter():
        while not stop.is_set():
            db = 20 * np.log10(peak[0] + 1e-9)
            peak[0] = 0.0
            secs = sum(len(c) for c in chunks) / sr
            if secs >= seconds:
                stop.set()
                break
            bar = "█" * max(0, int((db + 50) / 2))
            hint = "se detiene solo" if auto else "Enter para terminar"
            print(f"\r● GRABANDO {secs:5.1f}s  {bar:<25} {db:5.1f} dB   ({hint}) ", end="", flush=True)
            time.sleep(0.15)

    with sd.InputStream(device=int(mic[0]), channels=1, samplerate=sr, dtype="float32",
                        blocksize=1024, callback=on_audio):
        th = threading.Thread(target=meter, daemon=True)
        th.start()
        if auto:
            th.join()
        else:
            input()
            stop.set()
            th.join()
    audio = np.concatenate(chunks) if chunks else np.zeros(1, np.float32)
    pcm = (np.clip(audio, -1, 1) * 8388607).astype("<i4")  # WAV de 24 bits
    with wave.open(str(dest), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(3)
        w.setframerate(sr)
        w.writeframes(pcm.view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
    print(f"\n■ Listo: {len(audio) / sr:.1f} s a {sr} Hz")
    if problems[0]:
        print(f"AVISO: hubo {problems[0]} cortes de audio (la computadora se trabó). Conviene repetirla.")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("name", help="nombre de la voz, p. ej. yo")
    ap.add_argument("--from", dest="src", help="audio existente en vez de grabar (m4a, mp3, wav…)")
    ap.add_argument("--seconds", type=int, default=60, help="máximo; la grabación termina con Enter")
    ap.add_argument("--mic", default="default", help="nombre (o parte) o número del micrófono, o 'list'")
    ap.add_argument("--auto", action="store_true", help="sin Enter: cuenta 10 s y graba --seconds segundos")
    ap.add_argument("--texto", help="archivo con el texto para leer (por defecto, frases de tecnología)")
    args = ap.parse_args()

    if args.mic == "list":
        for idx, name in mics():
            print(f"  {idx}  {name}")
        return

    read_text = Path(args.texto).read_text(encoding="utf-8").strip() if args.texto else READ_ME
    VOICES.mkdir(parents=True, exist_ok=True)
    wav, txt = VOICES / f"{args.name}.wav", VOICES / f"{args.name}.txt"
    raw = Path(args.src) if args.src else VOICES / f"{args.name}_raw.wav"
    if not args.src:
        record(raw, args.seconds, pick_mic(args.mic), read_text, args.auto)
    levels(raw)

    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", CLEAN, "-ac", "1", "-ar", "24000", str(wav)],
        check=True,
    )

    print("Transcribiendo con Whisper…", flush=True)
    text = motor.transcribe(str(wav), read_text, words=False)["text"].strip()
    txt.write_text(text + "\n", encoding="utf-8")
    secs = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)],
        capture_output=True, text=True, check=True,
    ).stdout)

    print(f"\n{wav}  ({secs:.1f} s)")
    print(f"{txt}:\n  {text}")
    if not 8 <= secs <= 30:
        print("AVISO: lo ideal son 10–20 s de voz.")
    print("\nRevisa que la transcripción diga exactamente lo que dijiste (corrige el .txt si no) y prueba:")
    print(f"  uv run probar.py {args.name}")


if __name__ == "__main__":
    main()
