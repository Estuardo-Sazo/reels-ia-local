// Apunta las dos composiciones (9:16 y 16:9) a un episodio y ajusta su duración
// a la de la voz más un cierre en pantalla.
// Uso: node tools/use-episode.mjs ep002 [segundos_de_cierre=1.5]
import { readFileSync, writeFileSync } from "node:fs";
import { inject } from "./medios.mjs";

const ep = process.argv[2];
const tail = Number(process.argv[3] ?? 1.5);
const { duration } = JSON.parse(readFileSync(`assets/${ep}/segments.json`, "utf8"));
const total = Math.ceil((duration + tail) * 2) / 2;

for (const file of ["index.html", "compositions/youtube.html"]) {
  const html = readFileSync(file, "utf8")
    .replace(/assets\/ep\d+\//g, `assets/${ep}/`)
    .replace(/(data-composition-id="(?:reel|youtube)" data-start="0" data-duration=")[\d.]+/, `$1${total}`)
    .replace(/(<audio id="voz"[^>]*data-duration=")[\d.]+/, `$1${duration}`);
  writeFileSync(file, html);
}
console.log(`${ep}: voz ${duration}s, video ${total}s`);
// Videos y música del episodio (media/medios.json); si no tiene, limpia los del episodio anterior
if (inject(ep).length) console.log(`${ep}: medios insertados`);
