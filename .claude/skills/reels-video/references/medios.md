# Recursos: fotos, clips, música y tu propia grabación

Los archivos del usuario van en `recursos/` (raíz del repo; no se suben a git). Desde ahí se usan de tres formas.

## 1. Fotos e imágenes en una escena

Cópialas (recortadas o reducidas si pesan mucho, ~1280 px basta) a `studio/assets/epNNN/media/` y úsalas en `scenes.js` con la ayuda `media()`, que arma la ruta correcta para las dos composiciones:

```js
window.buildEpisode = function ({ tl, scene, at, S, media }) {
  const s = scene(3, `<img class="foto" src="${media("producto.jpg")}" style="position:absolute;left:140px;top:200px;width:800px">`);
  tl.fromTo(s.querySelector(".foto"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at("producto", S(3)));
};
```

Nunca uses rutas fijas como `assets/ep020/...`: en 16:9 la composición vive en `compositions/` y necesita `../`.

## 2. Clips de video y música: `media/medios.json`

HyperFrames solo reproduce videos que están en el HTML **al cargar** (no se pueden crear desde `scenes.js`). Por eso los clips se declaran en `studio/assets/epNNN/media/medios.json` y una herramienta los corta y los escribe en `index.html` y `compositions/youtube.html`:

```json
{
  "clips": [
    { "id": "demo", "fuente": "recursos/pantalla.mov", "de": 12, "a": 18.5, "capa": "ventana",
      "caja": [90, 250, 900, 506], "frase": 4, "palabra": "github" },
    { "id": "toma", "fuente": "recursos/celular.mp4", "de": 3, "a": 9, "capa": "fondo", "frase": 7, "encuadre": "llenar", "x": 0.4 }
  ],
  "musica": { "fuente": "recursos/musica.mp3", "volumen": 0.12 }
}
```

```bash
cd studio
node tools/medios.mjs epNNN        # corta los clips (solo los que cambiaron) y los inserta; --forzar rehace todo
```

`use-episode.mjs` también los inserta, así que el orden normal es: `build-data` → `medios.mjs` → escenas → `render.mjs`.

| Campo | Qué hace |
|---|---|
| `fuente` | Ruta relativa a la raíz del repo (normalmente `recursos/…`). Sirve cualquier formato que lea ffmpeg |
| `de`, `a` | Tramo del archivo original, en segundos |
| `capa` | `"ventana"`: dentro del escenario de 1080×1200, en `caja` `[x, y, ancho, alto]`, encima de la escena. `"fondo"`: pantalla completa detrás de las escenas |
| cuándo | `"t"` (segundo exacto), o `"frase"` (índice base 0) y opcional `"palabra"` (empieza cuando la voz la dice). Sin nada: segundo 0 |
| `encuadre` | Solo fondo. `"completo"` (por defecto): todo el cuadro al centro sobre su imagen desenfocada. `"llenar"`: recorta para llenar; `x` de 0 a 1 elige qué parte del ancho queda |
| `recorte` | Crop de ffmpeg antes de todo: `"ancho:alto:x:y"`. Sirve para quitar barras o sacar un vertical de un video horizontal |
| `velocidad` | `0.5` = cámara lenta |
| `audio`, `volumen` | Por defecto los clips van en silencio (manda la voz). `"audio": true` para oír el clip |
| `congelar` | Segundos que se sostiene el último cuadro (cubre el cierre del video) |

Reglas para que se vea bien:

- **Que el clip termine con su escena.** Dura `a − de`; si la escena es más corta, pasa a la siguiente. Calcula con los tiempos de `segments.json` (`E(i)` = inicio de la frase siguiente).
- Una `ventana` va encima de todo lo de la escena: dibuja en la escena un marco (tarjeta, teléfono, monitor) del tamaño de la `caja` + un borde, y no pongas textos dentro de la caja.
- En `scenes.js`, `clip("demo")` devuelve el `<video>` para animarlo: usa solo `opacity`, `scale`, `x`, `y` o `borderRadius` (nunca `autoAlpha`/`visibility`: la visibilidad la controla HyperFrames con sus tiempos). Comprueba que exista: `const v = clip("demo"); if (v) …`.
- Varios verticales de un horizontal 1920×1080: `"recorte": "608:1080:X:0"` con distintos `X`.
- Música: `volumen` 0.08–0.15 para que no tape la voz. Se recorta a la duración y se desvanece al final.
- Los subtítulos ocupan la zona de abajo: deja libre la parte inferior del escenario.

## 3. Reels desde tu propia grabación

Cuando el usuario ya grabó un video (hablando a cámara, una clase, una partida, un tutorial) y quiere sacar reels: **no se genera voz**; su audio real es la voz del reel.

```bash
cd voice
uv run video.py transcribir ../recursos/mi-video.mp4
```

Imprime cada oración con su segundo (y guarda `recursos/mi-video.transcripcion.json`). Con eso propón al usuario 2–5 reels de 30–90 s: cada uno con una idea completa, que empiece con una frase que enganche y termine cerrando la idea. Muéstrale los tramos (`de`–`a` y la primera y última frase) y espera su visto bueno.

Por cada tramo elegido, un episodio:

```bash
uv run video.py extraer ../recursos/mi-video.mp4 ../studio/assets/epNNN --de 95.5 --a 151 --guion ../episodes/NNN-tema/guion.txt
#   --encuadre llenar --x 0.4   si es horizontal y quieres llenar el vertical recortando (persona al centro)
cd ../studio
node tools/build-data.mjs assets/epNNN
node tools/medios.mjs epNNN
```

`extraer` deja `voz.wav` (el audio original normalizado), `segments.json` (una frase por oración), `captions.json`, `media/medios.json` con el tramo como fondo (`"base"`, con `congelar: 2` para el cierre) y el `guion.txt` con lo que dijo (base para `publicacion.md`; no le pongas marcas de pronunciación: ya está dicho).

Escenas sobre tu grabación: aquí el video es el protagonista. En `scenes.js`:

- No tapes la cara ni lo que se demuestra. Usa elementos pequeños: titulares arriba (`top` 80–300), etiquetas, flechas, números que aparecen al decirlos, una lista que se arma.
- No hace falta una escena por frase: deja frases sin escena (solo video + subtítulos) para que respire.
- Para recalcar algo, una `ventana` con otra toma o una foto a pantalla completa por 1–2 s.
- Los temas pintan su fondo en `#bg`, debajo del video, así que cualquier tema sirve; escoge el que dé estilo a los textos.
- Si la grabación ya trae música o ruido fuerte, no agregues `musica`.

Revisa con `snapshot` como siempre y renderiza con `render.mjs`.

## Derechos

Usa solo material propio o con permiso (grabaciones, fotos y música del usuario, o con licencia libre). Si el usuario trae un video de TV, de otro creador o música comercial, avísale que las redes pueden silenciarlo o bajarlo.
