# Textos para publicar: `episodes/NNN-tema/publicacion.md`

Se crea **junto con el guion**, copiando `episodes/PLANTILLA-publicacion.md`. Nunca dejar un episodio con guion y sin publicación.

## Qué lleva

- **YouTube (16:9)**: título, descripción completa y etiquetas (tags).
- **Shorts, TikTok, Instagram y Facebook (9:16)**: un texto resumido por plataforma con sus hashtags.

Las guías de largo y forma de cada campo están como comentarios en la plantilla.

## Reglas

- Todo sale del `guion.txt` del episodio: no agregues cifras, fechas ni nombres que el guion no diga.
- Quita las marcas de pronunciación: `ML-KEM{eme ele kem}` → `ML-KEM`, `[Stack Overflow]{stac overflou}` → `Stack Overflow`.
- Español neutro latinoamericano, el mismo tono del guion.
- Cada texto va en su propio bloque de código (```` ``` ````) para copiarlo y pegarlo directo.
- Si el guion cambia, actualiza también `publicacion.md`.
- Cuando exista `studio/assets/epNNN/segments.json`, pon la duración real (`duration`, redondeada) en la cabecera.
- Los nombres de los videos en la cabecera: `out/NNN-tema-youtube-16x9.mp4`, `out/NNN-tema-reel-9x16.mp4`.

Ejemplos completos: `examples/*/publicacion.md`.
