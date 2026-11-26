"""Descarga por adelantado los modelos que eligió doctor.py (para no esperar en el primer video).

Uso: uv run descargar.py

Quedan en la caché de Hugging Face (~/.cache/huggingface) y de Whisper (~/.cache/whisper).
"""
import motor


def main() -> None:
    cfg = motor.config()
    from huggingface_hub import snapshot_download

    repos = [cfg["voz"]["modelo"]] if cfg["voz"].get("modelo") else []
    if motor.motor() == "mlx":
        repos += [motor.KOKORO_MLX, cfg["whisper"]]
    else:
        repos += ["Qwen/Qwen3-TTS-Tokenizer-12Hz"] if repos else []
    for repo in repos:
        print(f"Descargando {repo}…", flush=True)
        snapshot_download(repo)

    if motor.motor() == "cuda":
        import torch

        if not torch.cuda.is_available():
            raise SystemExit("PyTorch no ve tu NVIDIA. Actualiza el driver (570 o mayor) o reinstala con: "
                             "python doctor.py --write --motor cpu  y  uv sync --extra cpu")
        print(f"GPU lista: {torch.cuda.get_device_name(0)}")
    if motor.motor() != "mlx":
        print(f"Descargando Whisper {cfg['whisper']}…", flush=True)
        motor._whisper_torch()
    print("Modelos listos.")


if __name__ == "__main__":
    main()
