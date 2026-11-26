---
name: reels-voz
description: Graba o importa la voz del usuario para clonarla (Qwen3-TTS), la limpia, la transcribe y la prueba; también varias voces (una por serie o tono) y arreglar una voz clonada que suena robótica. Úsala cuando digan "graba mi voz", "clona mi voz", "usa esta nota de voz", "la voz suena rara/robótica", "quiero otra voz para el curso".
---

# Grabar y clonar la voz

La clonación necesita dos archivos en `assets/voces/`: `<nombre>.wav` (10–20 s de voz limpia) y `<nombre>.txt` (lo que dice, exacto). `grabar.py` crea los dos.

## Grabar

Antes, dile al usuario:

- Cuarto silencioso, sin ventilador ni aire acondicionado.
- A un palmo del micrófono. Un micrófono USB o de audífonos es mejor que el de la laptop.
- **Que lea con el tono que quiere en sus videos** (el clon copia el tono: si lee aburrido, el clon sale aburrido).
- Mejor 15 s limpios que 30 s con ruido o titubeos.

```bash
cd voice
uv run grabar.py --mic list            # ver micrófonos
uv run grabar.py yo                    # micrófono predeterminado; Enter para terminar
uv run grabar.py yo --mic "USB"        # otro micrófono por nombre o número
uv run grabar.py yo --from nota.m4a    # importar una grabación (celular, WhatsApp, etc.)
uv run grabar.py yo-clase --texto mi-texto.txt   # otra voz con otro texto/tono
```

`grabar.py` muestra el texto a leer, cuenta 3 s y graba hasta Enter. **Necesita una terminal interactiva**: si tú (el agente) no puedes recibir Enter, pídele al usuario que lo corra en su terminal, o usa `--auto --seconds 20` (cuenta 10 s y graba 20 s solo).

Luego:

1. Lee los avisos de nivel (satura, muy bajo, ruido de fondo) y, si hay, sugiere repetir.
2. Muestra la transcripción `assets/voces/<nombre>.txt` y pídele que confirme que dice **exactamente** lo que leyó. Corrígela si no: el modelo la usa para alinear la voz.
3. Prueba: `uv run probar.py <nombre>` → `voice/test/<nombre>.wav`. Que lo escuche.

## Usar la voz

- `yo` es la voz por defecto de `tts.py`.
- Otra voz: `uv run tts.py … --ref ../assets/voces/<nombre>.wav`. Recuerda qué voz usa cada serie.

## Si el clon suena mal

| Síntoma | Arreglo |
|---|---|
| Robótico / metálico en todo | Regrabar: más cerca del micro, sin ruido, otro micrófono. Revisar que el `.txt` sea exacto |
| Tono plano o aburrido | Regrabar leyendo con más energía, como narrador |
| Una palabra en inglés mal dicha | Marca de pronunciación en el guion: `GitHub{guít jab}` (ver skill `reels-video`, `references/guion.md`) |
| Una frase mala de un episodio | `uv run tts.py … --redo N`, o `tomas.py` para elegir entre 3 tomas |
| Muy lento / rápido | `tts.py --tempo 1.0` a `1.2` (por defecto 1.1) |
| Sin clonación en su equipo (Kokoro) | Explica que su equipo no aguanta el modelo; puede forzar `doctor.py --write --voz 0.6B` si tiene 16 GB de RAM y paciencia |

## Privacidad

Las voces (`assets/voces/*.wav`, `*.txt`) quedan en `.gitignore`: nunca se suben al repo. Recuérdaselo si quiere compartir su copia del proyecto. Clonar la voz de otra persona requiere su permiso.
