# Episodios de ejemplo

Un episodio completo por tema visual: `guion.txt` (con marcas de pronunciación), `scenes.js` (escenas animadas) y `publicacion.md` (textos para redes). No incluyen audio: la voz se genera con la tuya.

| Carpeta | Tema | Serie |
|---|---|---|
| `001-crowdstrike` | papel | Fallas tech |
| `004-cosecha-ahora` | blueprint | Futuro |
| `005-programar-2027` | editorial | Futuro |
| `006-ia-local` | terminal | IA hoy |
| `008-lo-que-viene` | documental | Futuro |
| `010-que-es-una-base-de-datos` | pizarra | Curso de bases de datos |
| `011-como-se-guardan-los-datos` | isometrico | Curso de bases de datos |
| `017-cambiar-datos-sql` | isometrico | Curso de bases de datos |

Para renderizar uno con tu voz, pídele a Claude: *"renderiza el ejemplo 006 con mi voz"*. O a mano:

```bash
mkdir -p episodes/006-ia-local && cp examples/006-ia-local/{guion.txt,publicacion.md} episodes/006-ia-local/
cd voice
uv run tts.py ../episodes/006-ia-local/guion.txt ../studio/assets/ep006
uv run captions.py ../studio/assets/ep006/voz.wav ../studio/assets/ep006/captions.json ../episodes/006-ia-local/guion.txt
cd ../studio
cp ../examples/006-ia-local/scenes.js assets/ep006/
node tools/build-data.mjs assets/ep006
node tools/render.mjs ep006 ../episodes/006-ia-local
```

Las escenas usan `at("palabra")` para sincronizarse con la voz: si cambias el guion, ajusta también esas palabras.
