"""Revisa la computadora y elige el motor de voz que aguanta.

Uso:
  python doctor.py              solo muestra el diagnóstico
  python doctor.py --write      además guarda la elección en reels.config.json (lo usa todo lo demás)
  python doctor.py --json       el diagnóstico en JSON (para Claude u otros scripts)
  python doctor.py --write --motor cpu --voz 0.6B    forzar una elección

Solo usa la biblioteca estándar: corre antes de instalar nada.

Motores:
  mlx   Mac con chip Apple. Qwen3-TTS y Whisper sobre MLX (GPU del chip).
  cuda  Windows o Linux con tarjeta NVIDIA. Qwen3-TTS y Whisper sobre PyTorch + CUDA.
  cpu   Cualquier otra computadora. Funciona, pero clonar la voz es lento.
"""
import argparse
import ctypes
import json
import os
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

# En Windows la consola puede no ser UTF-8: que los acentos y ✓ no rompan la salida
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "reels.config.json"

QWEN = {
    "mlx": {"1.7B": "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16", "0.6B": "mlx-community/Qwen3-TTS-12Hz-0.6B-Base-bf16"},
    "torch": {"1.7B": "Qwen/Qwen3-TTS-12Hz-1.7B-Base", "0.6B": "Qwen/Qwen3-TTS-12Hz-0.6B-Base"},
}
WHISPER = {"mlx": "mlx-community/whisper-large-v3-turbo", "torch": "turbo", "torch-small": "small"}
SIZES_GB = {"1.7B": 4.5, "0.6B": 2.5, "kokoro": 0.4, "turbo": 1.6, "small": 0.5, "torch-cuda": 3.5, "torch-cpu": 0.8}


def run(cmd: list[str]) -> str:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=20).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def ram_gb() -> float:
    system = platform.system()
    if system == "Darwin":
        return int(run(["sysctl", "-n", "hw.memsize"]) or 0) / 1024**3
    if system == "Linux":
        m = re.search(r"MemTotal:\s+(\d+)", Path("/proc/meminfo").read_text())
        return int(m.group(1)) / 1024**2 if m else 0
    if system == "Windows":
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                        ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                        ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                        ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                        ("sullAvailExtendedVirtual", ctypes.c_ulonglong)]
        st = MEMORYSTATUSEX()
        st.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(st))
        return st.ullTotalPhys / 1024**3
    return 0


def cpu_name() -> str:
    system = platform.system()
    if system == "Darwin":
        return run(["sysctl", "-n", "machdep.cpu.brand_string"]) or platform.processor()
    if system == "Linux":
        m = re.search(r"model name\s*:\s*(.+)", Path("/proc/cpuinfo").read_text(errors="ignore"))
        return m.group(1).strip() if m else platform.processor()
    return platform.processor() or os.environ.get("PROCESSOR_IDENTIFIER", "")


def nvidia() -> dict | None:
    out = run(["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"])
    if not out:
        return None
    name, mem, driver = [x.strip() for x in out.splitlines()[0].split(",")]
    return {"nombre": name, "vram_gb": round(int(mem) / 1024, 1), "driver": driver}


def version(cmd: str, flag: str = "--version") -> str | None:
    if not shutil.which(cmd):
        return None
    out = run([cmd, flag])
    m = re.search(r"(\d+\.\d+[\w.\-]*)", out.splitlines()[0]) if out else None
    return m.group(1) if m else "instalado"


def diagnose(force_motor: str | None = None, force_voice: str | None = None) -> dict:
    system, machine = platform.system(), platform.machine().lower()
    ram = round(ram_gb(), 1)
    gpu = nvidia()
    apple = system == "Darwin" and machine == "arm64"
    notes: list[str] = []

    vram = gpu["vram_gb"] if gpu else 0
    if apple:
        motor = "mlx"
    elif gpu and vram >= 4:
        motor = "cuda"
        driver = int(gpu["driver"].split(".")[0]) if gpu["driver"].split(".")[0].isdigit() else 0
        if driver and driver < 570:
            notes.append(f"Tu driver NVIDIA ({gpu['driver']}) es viejo para CUDA 12.8: actualízalo a la versión 570 o mayor.")
    else:
        motor = "cpu"
        if gpu:
            notes.append(f"Tu {gpu['nombre']} tiene menos de 4 GB de VRAM: se usará el procesador.")
        vga = [l for l in run(["lspci"]).splitlines() if "VGA" in l or "3D" in l]
        if any("AMD" in l or "ATI" in l for l in vga):
            notes.append("Las tarjetas AMD no están soportadas todavía: se usará el procesador.")
    if force_motor:
        motor = force_motor
    power = vram if motor == "cuda" else ram

    # Qué voz aguanta: memoria unificada (Mac), VRAM (NVIDIA) o RAM (procesador)
    if motor == "mlx":
        voice = "1.7B" if power >= 16 else "0.6B" if power >= 8 else "kokoro"
    elif motor == "cuda":
        voice = "1.7B" if power >= 8 else "0.6B"
    else:
        voice = "0.6B" if ram >= 16 else "kokoro"
        if voice == "0.6B":
            notes.append("Sin GPU, clonar la voz es lento: cuenta varios minutos por cada minuto de video. "
                         "Para pruebas rápidas usa --engine kokoro (voz genérica, sin clonar).")
    if force_voice:
        voice = force_voice

    family = "mlx" if motor == "mlx" else "torch"
    whisper = WHISPER["mlx"] if motor == "mlx" else WHISPER["torch"] if (motor == "cuda" or ram >= 12) else WHISPER["torch-small"]
    tts_repo = QWEN[family].get(voice)

    disk = shutil.disk_usage(ROOT).free / 1024**3
    need = SIZES_GB.get(voice, 0) + SIZES_GB["kokoro"] + (1.6 if "turbo" in whisper else 0.5) + 1.5
    need += SIZES_GB["torch-cuda"] if motor == "cuda" else SIZES_GB["torch-cpu"] if motor == "cpu" else 0.5

    node = version("node")
    tools = {
        "ffmpeg": version("ffmpeg", "-version"),
        "ffprobe": version("ffprobe", "-version"),
        "node": node,
        "git": version("git"),
        "uv": version("uv"),
    }
    node_major = int(re.match(r"(\d+)", node).group(1)) if node and re.match(r"(\d+)", node) else 0
    missing = [k for k, v in tools.items() if not v]
    if node and node_major < 22:
        missing.append("node (versión 22 o mayor)")
    if ram and ram < 8:
        notes.append("Con menos de 8 GB de RAM el render de video puede ir muy lento.")
    if disk < need:
        notes.append(f"Poco espacio: hacen falta unos {need:.0f} GB libres para modelos y dependencias.")

    return {
        "motor": motor,
        "voz": {
            "engine": "kokoro" if voice == "kokoro" else "qwen",
            "tamano": voice,
            "modelo": tts_repo,
            "clona": voice != "kokoro",
        },
        "whisper": whisper,
        "detectado": {
            "sistema": f"{system} {platform.release()} ({machine})",
            "cpu": cpu_name(),
            "nucleos": os.cpu_count(),
            "ram_gb": ram,
            "gpu": gpu or ("Apple (memoria unificada)" if apple else None),
            "disco_libre_gb": round(disk, 1),
            "espacio_necesario_gb": round(need, 1),
            "herramientas": tools,
        },
        "faltan": missing,
        "notas": notes,
    }


def report(d: dict) -> str:
    det, v = d["detectado"], d["voz"]
    gpu = det["gpu"]
    gpu_txt = f"{gpu['nombre']} · {gpu['vram_gb']} GB VRAM" if isinstance(gpu, dict) else gpu or "ninguna compatible"
    quality = {
        "1.7B": "Qwen3-TTS 1.7B: clona tu voz con la mejor calidad",
        "0.6B": "Qwen3-TTS 0.6B: clona tu voz, un poco menos natural que el 1.7B",
        "kokoro": "Kokoro: voz genérica en español, sin clonar (tu equipo no aguanta la clonación)",
    }[v["tamano"]]
    motor_txt = {"mlx": "MLX (chip Apple)", "cuda": "PyTorch + CUDA (NVIDIA)", "cpu": "PyTorch en el procesador"}[d["motor"]]
    lines = [
        "Diagnóstico de reels-ia-local",
        f"  Sistema   {det['sistema']}",
        f"  CPU       {det['cpu']} · {det['nucleos']} núcleos",
        f"  RAM       {det['ram_gb']} GB",
        f"  GPU       {gpu_txt}",
        f"  Disco     {det['disco_libre_gb']} GB libres (se necesitan ~{det['espacio_necesario_gb']} GB)",
        "",
        f"  Motor     {motor_txt}",
        f"  Voz       {quality}",
        f"  Whisper   {d['whisper']}",
        "",
        "  Herramientas:",
    ]
    for k, val in det["herramientas"].items():
        lines.append(f"    {'✓' if val else '✗'} {k:8} {val or 'falta'}")
    for n in d["notas"]:
        lines.append(f"  AVISO: {n}")
    if d["faltan"]:
        lines.append(f"  Falta instalar: {', '.join(d['faltan'])}")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help=f"guarda la elección en {CONFIG.name}")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--motor", choices=["mlx", "cuda", "cpu"], help="forzar motor")
    ap.add_argument("--voz", choices=["1.7B", "0.6B", "kokoro"], help="forzar modelo de voz")
    args = ap.parse_args()

    d = diagnose(args.motor, args.voz)
    print(json.dumps(d, ensure_ascii=False, indent=2) if args.json else report(d))
    if args.write:
        cfg = {k: d[k] for k in ("motor", "voz", "whisper")}
        CONFIG.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if not args.json:
            print(f"\nGuardado en {CONFIG}")


if __name__ == "__main__":
    main()
