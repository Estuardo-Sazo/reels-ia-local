# recursos/

Pon aquí tus fotos, capturas, clips, música y videos grabados. Nada de esta carpeta se sube a git (solo este README).

- Fotos y capturas → Claude las copia a `studio/assets/epNNN/media/` y las usa en las escenas.
- Clips y música → se declaran en `studio/assets/epNNN/media/medios.json` y `node tools/medios.mjs epNNN` los corta.
- Un video que ya grabaste → `cd voice && uv run video.py transcribir ../recursos/mi-video.mp4` y pide: *"sácame reels de este video"*.

Usa material propio o con permiso: las redes pueden silenciar o bajar videos con música comercial o contenido de otros.

Guía completa: `.claude/skills/reels-video/references/medios.md`.
