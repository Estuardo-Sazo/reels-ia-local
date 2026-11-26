# Escenas: `studio/assets/epNNN/scenes.js`

El motor (`studio/assets/reel.js`) arma la línea de tiempo GSAP con la voz (`data.js`) y llama a `window.buildEpisode` de tu episodio. El mismo `scenes.js` sirve para 9:16 y 16:9.

## Esqueleto

```js
// Episodio NNN: de qué trata. Tema X.
window.EPISODE_TAG = "IA HOY · NNN";        // etiqueta de serie arriba a la izquierda
window.EPISODE_THEME = "terminal";          // papel | blueprint | editorial | terminal | documental | pizarra | isometrico
window.EPISODE_KEYWORDS = ["voz", "local"]; // opcional: palabras que el tema resalta en los subtítulos
window.buildEpisode = function ({ tl, scene, at, S, E, rng, media, clip, /* ayudas… */ }) {
  // ===== 0 · gancho =====
  {
    const s = scene(0, `<div class="term-big">…</div>`);
    // animaciones con tl.* o las ayudas, en segundos absolutos
  }
  // ===== 1 · … =====  una escena por línea del guion
};
```

## Lo que recibe `buildEpisode`

| Nombre | Qué es |
|---|---|
| `tl` | Línea de tiempo GSAP (paused). Todo se agrega con `tl.fromTo(el, from, to, t)`, `tl.set(el, props, t)`, `tl.to(…)`. `t` en segundos absolutos del video |
| `scene(i, html)` | Crea la escena `i` (sección a pantalla completa del escenario). Se muestra desde `S(i)` y se oculta en `E(i)`. Devuelve el elemento |
| `S(i)`, `E(i)` | Inicio de la frase `i` y fin de su escena (inicio de la siguiente) |
| `at("palabra", desde)` | Segundo en que la voz dice esa palabra, buscando desde `desde` (usa `S(i)`). Ignora tildes y mayúsculas. Si no la encuentra devuelve `desde` |
| `rng(semilla)` | Pseudoaleatorio determinista. **Nunca** `Math.random()` |
| `media("archivo")` | Ruta de `studio/assets/epNNN/media/archivo` válida en 9:16 y 16:9 (para `<img src>`). Ver `medios.md` |
| `clip("id")` | El `<video>` de un clip de `medios.json` (o `null`), para animar su `opacity`/`scale`. Ver `medios.md` |

Ayudas generales: `pop`, `boil`, `glitch`, `typeText(el, texto, t, cps)` (devuelve cuándo termina), `setBg(color, t)`, `rise`, `reveal`, `draw(pathSVG, t, dur)`, `countUp(el, desde, hasta, t, dur, fmt)`, `slam`, `lines` (`.ln > span`), `strike` (`.strike-bar`), `asciiBar`, `equalizer`.

Ayudas por tema (objeto que llega con el nombre del tema):

- `doc` (documental): `doc.world` (lienzo continuo donde colocas todo), `doc.cam(x, y, zoom, t, dur)` mueve la cámara, `doc.up(el, t)` (líneas `.doc-ln > span`), `doc.show(el, t)`.
- `pz` (pizarra): `pz.chalk(nodos, t, dur, gap)` dibuja trazos SVG `.ch` con tiza y devuelve cuándo termina, `pz.write(el, t, dur)` texto a mano, `pz.appear(el, t)`.
- `iso` (isometrico): `iso.space(ox, oy, u)` → `{ box(x,y,z,w,d,h,color,cls), label(face,x,y,z,texto,size), P(x,y,z) }` para prismas y texto en perspectiva; `iso.drop`, `iso.grow`, `iso.slide`; `iso.colors`.

Las firmas exactas están en `studio/assets/reel.js` (busca `function nombre`). Las clases CSS de cada tema están en `studio/assets/reel.css` con su prefijo: `bp-` blueprint, `ed-` editorial, `term-` terminal, `doc-` documental, `pz-` pizarra, `iso-` isométrico; `paper`, `big-num`, `kicker` para papel.

## Medidas

- El escenario `#stage` es una caja de **1080 × 1200 px**. Diseña dentro de esa caja con coordenadas absolutas o flex.
- En 9:16 (1080×1920) la caja va con `top: 230px`: arriba queda la etiqueta y abajo los subtítulos. **No pongas contenido importante en los últimos ~150 px** de la caja.
- En 16:9 (1920×1080) la misma caja se escala (~0.74–0.8) y se centra. Revisa siempre ambas con `snapshot`.
- Texto: mínimo ~36 px para que se lea en el teléfono. Títulos 70–190 px.

## Ritmo

- Cada elemento entra cuando la voz lo menciona: `rise(el, at("cuántica", S(3)) - 0.2)`. Adelantar 0,2–0,5 s se siente natural.
- 2–4 elementos por escena. Mejor uno grande y claro que seis pequeños.
- Repite visualmente lo que se dice: cifras con `countUp`, procesos con flechas o `draw`, comparaciones lado a lado, código con `typeText`.
- La escena 0 lleva el gancho en grande; la última, el llamado a seguir.

## Reglas del render (HyperFrames)

- Determinista: sin `Math.random()`, `Date.now()`, `fetch`, `setTimeout`, ni animaciones CSS con `@keyframes` que corran por su cuenta. Todo movimiento va en `tl`.
- No crees otras líneas de tiempo pausadas; usa `tl`.
- Imágenes propias: ponlas en `studio/assets/epNNN/` y referéncialas como `assets/epNNN/foto.png` (en 16:9 la ruta es relativa a `compositions/`, así que mejor dibuja con HTML/SVG o usa rutas que funcionen en ambos; si hace falta, define la ruta según `document.documentElement.dataset.resolution`).
- Fuentes: las del `@import` de `reel.css`. Si agregas una de Google Fonts, súmala ahí.
- Para más detalle del framework: `npx --yes hyperframes@0.8.223 docs gsap` (o `data-attributes`, `troubleshooting`), y las skills `/hyperframes` si están instaladas.

## Revisar

`npx --yes hyperframes@0.8.223 check` y luego `snapshot --at` en el medio de varias escenas (`S(i) + 1`). Lee los PNG. Errores comunes:

- Elemento que no aparece → su `autoAlpha` empezó en 0 y la animación nunca corre (el `at()` no encontró la palabra: revisa cómo quedó en `captions.json`).
- Texto que se sale → baja el tamaño o parte en líneas.
- Escena que se ve antes de tiempo → no uses `scene()` dos veces con el mismo índice.
