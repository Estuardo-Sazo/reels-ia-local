---
name: reels-video
description: Hace un video completo (reel 9:16 + YouTube 16:9) a partir de un tema o un guion, con la voz clonada del usuario, subtítulos palabra por palabra y escenas animadas en HTML, todo local. Úsala cuando pidan "hazme un video / reel / short sobre…", "nuevo episodio", "convierte este guion en video", "renderiza el episodio", "cambia la escena 4", "regenera la frase 3", los textos para publicar de un episodio, o cuando traen fotos, clips o música para el video ("usa esta imagen", "mete este clip") o un video que ya grabaron y quieren sacar reels de él ("saca reels de mi video", "córtame este en shorts").
---

# Hacer un video

Flujo: `guion.txt → voz clonada (Qwen3-TTS) → tiempos por palabra (Whisper) → escenas HTML (HyperFrames + GSAP) → MP4 9:16 y 16:9`.

Todo corre en la computadora del usuario. Rutas relativas a la raíz del repo.

**¿El usuario ya grabó su video** y quiere reels de él? Ese es otro camino: no se genera voz, se usa su audio. Sigue `references/medios.md` § 3 y vuelve aquí para escenas, revisión y render.

## 0. Antes de empezar

1. Si no existe `reels.config.json` → el equipo no está instalado: usa la skill `reels-instalar`.
2. Lee `reels.config.json`. Si `voz.clona` es `false`, la voz será Kokoro (genérica): avísalo una vez.
3. Si no existe `assets/voces/yo.wav` (o la voz que el usuario nombre), ofrece grabarla con la skill `reels-voz`. Si prefiere no hacerlo, usa `--engine kokoro`.
4. Número de episodio: `ls episodes` y toma el siguiente libre (`001`, `002`…). Carpeta `episodes/NNN-tema-corto/` (minúsculas, guiones, sin acentos).

## 1. Guion (`episodes/NNN-tema/guion.txt`)

Lee `references/guion.md` antes de escribirlo. Lo esencial:

- **Una frase por línea = una escena.** 60–90 s ≈ 12–18 líneas.
- Línea 1: gancho fuerte. Última: llamado a seguir/suscribirse.
- Números en palabras ("dos mil veinticuatro"), frases cortas, español neutro latinoamericano.
- Siglas y palabras en inglés con marca de pronunciación: `SQL{ese cu ele}`, `[Stack Overflow]{stac overflou}`. El subtítulo muestra lo de fuera, la voz lee lo de dentro.
- No inventes datos. Si el tema necesita cifras o fechas actuales, investiga y dile al usuario de dónde salen. Si te da el guion, respétalo y solo agrega marcas de pronunciación.

**En el mismo paso** crea `episodes/NNN-tema/publicacion.md` desde `episodes/PLANTILLA-publicacion.md` siguiendo `references/publicacion.md`. Nunca dejes un guion sin su publicación.

Muestra el guion al usuario y espera su visto bueno antes de generar la voz (tarda), salvo que haya dicho que sigas sin preguntar.

## 2. Voz y subtítulos

```bash
cd voice
uv run tts.py ../episodes/NNN-tema/guion.txt ../studio/assets/epNNN            # --ref ../assets/voces/otra.wav · --engine kokoro
uv run captions.py ../studio/assets/epNNN/voz.wav ../studio/assets/epNNN/captions.json ../episodes/NNN-tema/guion.txt
```

- `tts.py` puede tardar varios minutos (sobre todo con motor `cpu`): córrelo en segundo plano y avisa.
- Cada frase queda en `studio/assets/epNNN/lines/NN.wav`. Una frase mala se rehace sola: `uv run tts.py … --redo 3,8`.
- `captions.py` imprime `AVISO:` si la voz repitió o se saltó palabras → rehaz esas frases con `--redo` y vuelve a correr `captions.py`.
- Palabras en inglés robóticas o mal dichas: `uv run tomas.py <guion> ../studio/assets/epNNN 3 --tomas 3`, deja que el usuario escuche las tomas en `studio/assets/epNNN/tomas/` y elija (`--usar 3_1`), luego `tts.py` otra vez. Ver `references/guion.md` § Pronunciación.

Después:

```bash
cd ../studio
node tools/build-data.mjs assets/epNNN     # une segments + captions en data.js
node tools/use-episode.mjs epNNN           # apunta index.html y youtube.html al episodio y ajusta la duración
```

## 3. Tema visual y escenas (`studio/assets/epNNN/scenes.js`)

Elige tema con el usuario (o el que viene usando en su serie) de `references/temas.md`: `papel`, `blueprint`, `editorial`, `terminal`, `documental`, `pizarra`, `isometrico`.

1. Copia como base el ejemplo de ese tema: `examples/<episodio>/scenes.js` (la tabla está en `references/temas.md`). Léelo entero: es la mejor referencia de clases CSS y ritmo.
2. Lee `references/escenas.md` (contrato de `buildEpisode`, ayudas, medidas del escenario, reglas del render).
3. Una escena por frase del guion: `scene(i, html)` para `i = 0…n-1`. Sincroniza con lo que dice la voz usando `at("palabra", S(i))`.
4. Cambia la cabecera: `window.EPISODE_TAG` (serie, p. ej. "IA HOY"), `window.EPISODE_THEME`.
5. **Recursos del usuario** (fotos, capturas, clips, música en `recursos/`): imágenes con `media("archivo.jpg")`; videos y música en `studio/assets/epNNN/media/medios.json` + `node tools/medios.mjs epNNN`. Lee `references/medios.md` antes. Pregunta si tiene material propio cuando el tema lo pida (un producto, su app, un lugar).

Tema nuevo que no está en la lista: agrégalo en `studio/assets/reel.js` (`THEMES.nombre`) y `reel.css`, siguiendo uno existente; documenta en `references/temas.md`.

## 4. Revisar

```bash
cd studio
npx --yes hyperframes@0.8.223 check                         # debe pasar sin errores
npx --yes hyperframes@0.8.223 snapshot --at 1,8,15,30        # PNG en .hyperframes/artifacts/snapshots/
npx --yes hyperframes@0.8.223 snapshot --composition youtube --frames 4
```

**Mira las imágenes** (Read del PNG) antes de seguir: texto cortado, cosas encimadas con los subtítulos (zona inferior), escenas vacías, contraste. Un `check` que pasa no dice cómo se ve. Para ver en vivo: `npx --yes hyperframes@0.8.223 preview --background` (detener con `--stop`).

## 5. Renderizar

```bash
cd studio
node tools/render.mjs epNNN ../episodes/NNN-tema        # check + los dos MP4 en episodes/NNN-tema/out/
```

Salen `NNN-tema-reel-9x16.mp4` y `NNN-tema-youtube-16x9.mp4`. Pon la duración real (`studio/assets/epNNN/segments.json` → `duration`) en `publicacion.md`.

Cierra con: ruta de los dos MP4, duración, y dónde están los textos para publicar.

## Reglas

- `studio/index.html` y `compositions/youtube.html` son compartidos: un episodio a la vez. Si hay otra sesión trabajando en otro episodio, no corras `use-episode` sin avisar.
- Si cambia el guion: regenera solo las frases cambiadas (la caché de `lines/` detecta el texto), vuelve a correr `captions.py` y `build-data.mjs`, ajusta escenas, y actualiza `publicacion.md`.
- Nada de `Math.random()`, `Date.now()` ni `fetch` en escenas: el render debe ser determinista (usa `rng(semilla)`).
- No subas al repo voces (`assets/voces/*.wav`), videos ni lo de `recursos/`: ya están en `.gitignore`.
- Material de terceros (TV, otros creadores, música comercial): avisa que las redes pueden silenciarlo o bajarlo.
