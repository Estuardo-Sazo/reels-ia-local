# Temas visuales

Cada episodio elige uno con `window.EPISODE_THEME`. Base para copiar: la columna "Ejemplo" (`examples/<carpeta>/scenes.js` + su `guion.txt`).

| Tema | Estilo | Bueno para | Ejemplo |
|---|---|---|---|
| `papel` (por defecto) | Stop motion a 12 fps, recortes de papel, grano, glitch RGB, subtítulos amarillos en mayúsculas | Historias de fallas, noticias con drama | `001-crowdstrike` |
| `blueprint` | HUD futurista: cuadrícula, escaneo, partículas, vidrio, contadores, gráficos que se dibujan, barridos de luz, subtítulos en cápsula | Ciencia, futuro, criptografía, datos | `004-cosecha-ahora` |
| `editorial` | Revista suiza: fondo claro, tipografía gigante + cursiva serif, líneas que suben tras máscara, tachados, bloque rojo entre escenas, contador 01/08 | Opinión, mitos vs. datos, cifras | `005-programar-2027` |
| `terminal` | Monitor CRT verde: VT323, líneas de barrido, prompt con cursor, texto que se escribe, barras ASCII, ecualizador | Herramientas, IA local, hacking, código | `006-ia-local` |
| `documental` | Sobrio: grafito cálido, un acento de color, Geist + Instrument Serif, un lienzo continuo que recorre una cámara (sin cortes), subtítulos en frase completa con palabras clave subrayadas | Líneas de tiempo, reflexiones, historia | `008-lo-que-viene` |
| `pizarra` | Pizarrón verde con marco de madera, diagramas con tiza que se dibujan, letra a mano (Caveat, Kalam), borrador entre escenas | Clases, explicar conceptos paso a paso | `010-que-es-una-base-de-datos` |
| `isometrico` | Fondo claro con cuadrícula isométrica, bloques 3D con sombra dura (índigo, coral, verde, ámbar) que caen con rebote, franja diagonal entre escenas | Cursos, arquitectura, cómo funciona por dentro | `011-como-se-guardan-los-datos`, `017-cambiar-datos-sql` |

Notas:

- `documental`: el episodio coloca "estaciones" en `doc.world` y mueve la cámara con `doc.cam(x, y, zoom, t)`; `window.EPISODE_KEYWORDS` marca las palabras que se subrayan.
- `isometrico`: `iso.space(ox, oy, u)` da `box` y `label` para armar prismas; mira `017-cambiar-datos-sql` para tablas y bloques de código.
- Una serie puede quedarse con un tema (p. ej. un curso entero en `isometrico`) o cambiar en cada video. Pregunta al usuario la primera vez y recuérdalo.

Ideas de temas nuevos: collage/zine, neón synthwave, cómic, mapa/cartografía. Para crear uno: agrega `THEMES.nombre = function ({ tl, rng, DUR, S, seg, bg, grain, tag, stage }) { … return { wordsPerGroup, capClass, captionIn, wordOn, wordOff, api } }` en `reel.js`, sus clases con prefijo propio en `reel.css` (y ajustes de 16:9 dentro de `@media (orientation: landscape)`), y una fila en esta tabla.
