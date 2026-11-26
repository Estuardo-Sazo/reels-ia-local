# reels-ia-local

Proyecto para hacer videos cortos (reel 9:16 + YouTube 16:9) con voz clonada local, subtítulos palabra por palabra y escenas HTML animadas (HyperFrames + GSAP).

Flujo: `episodes/NNN-tema/guion.txt → voice/tts.py → voice/captions.py → studio/tools/build-data.mjs → studio/assets/epNNN/scenes.js → studio/tools/render.mjs`.

## Instrucciones por tarea (léelas antes de actuar)

- Instalar, diagnosticar el equipo o arreglar errores de instalación: `.claude/skills/reels-instalar/SKILL.md`
- Grabar, importar o arreglar la voz clonada: `.claude/skills/reels-voz/SKILL.md`
- Hacer o editar un video, o sus textos para publicar: `.claude/skills/reels-video/SKILL.md` (y sus `references/`)
- Usar fotos, clips o música del usuario, o sacar reels de un video que ya grabó: `.claude/skills/reels-video/references/medios.md`

## Reglas fijas

- Cada episodio lleva desde el inicio `guion.txt` **y** `publicacion.md` (desde `episodes/PLANTILLA-publicacion.md`). Si el guion cambia, se actualiza la publicación.
- Los textos para publicar salen solo del guion: sin cifras, fechas ni nombres que el guion no diga, y sin las marcas de pronunciación (`SQL{ese cu ele}` → `SQL`).
- Español neutro latinoamericano.
- El render es determinista: nada de `Math.random()`, `Date.now()` ni `fetch` en las escenas.
- Revisa los cuadros (`hyperframes snapshot`) y míralos antes de renderizar.
- No subas voces (`assets/voces/`), audio generado, videos ni lo de `recursos/` al repo.
- Comandos de Python desde `voice/` con `uv run …`; de video desde `studio/` con `npx --yes hyperframes@0.8.223 …`.
