// Prepara los recursos de un episodio (videos, música) y los mete en las dos composiciones.
// Uso: node tools/medios.mjs ep020 [--forzar]
//
// Lee studio/assets/epNNN/media/medios.json:
// {
//   "clips": [
//     { "id": "base", "fuente": "recursos/mi-video.mp4", "de": 30, "a": 85, "capa": "fondo" },
//     { "id": "demo", "fuente": "recursos/pantalla.mov", "de": 5, "a": 11, "capa": "ventana",
//       "caja": [90, 250, 900, 506], "frase": 3, "palabra": "github" }
//   ],
//   "musica": { "fuente": "recursos/musica.mp3", "volumen": 0.12, "de": 0 }
// }
//
// Clips (las rutas de "fuente" son relativas a la raíz del repo):
//   de, a       tramo del archivo original, en segundos
//   capa        "fondo": ocupa toda la pantalla detrás de las escenas (tu grabación como base del reel).
//               "ventana": dentro del escenario de 1080×1200, en "caja" [x, y, ancho, alto].
//   cuándo      "t" (segundo exacto), o "frase" (empieza con esa frase, base 0) y opcional "palabra"
//               (empieza cuando la voz la dice, buscando desde esa frase). Sin nada: segundo 0.
//   encuadre    para "fondo": "completo" (todo el cuadro sobre su imagen desenfocada; por defecto)
//               o "llenar" (recorta para llenar; "x" de 0 a 1 elige qué parte del ancho queda al centro).
//   recorte     crop de ffmpeg antes de todo, p. ej. "1920:1000:0:40" para quitar barras.
//   velocidad   1 por defecto; 0.5 es cámara lenta.
//   audio       true para oír el sonido del clip (por defecto en silencio: manda la voz).
//   volumen     del clip con audio (0 a 1).
//   congelar    segundos que se queda el último cuadro al final (p. ej. 2 para cubrir el cierre del video).
//
// Escribe media/<id>-9.mp4 y <id>-16.mp4 (fondo) o media/<id>.mp4 (ventana), y los <video> fijos entre
// las marcas <!-- medios --> de index.html y compositions/youtube.html (HyperFrames necesita verlos al cargar).
// Las imágenes no necesitan esto: ponlas en media/ y úsalas en scenes.js con media("foto.png").
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STUDIO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(STUDIO, "..");
const COMPOSITIONS = [
  { file: "index.html", prefix: "", wide: false },
  { file: "compositions/youtube.html", prefix: "../", wide: true },
];
const r3 = (n) => Math.round(n * 1000) / 1000;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
}

function stale(out, src, cfgPath, force) {
  if (force || !existsSync(out)) return true;
  const t = statSync(out).mtimeMs;
  return statSync(src).mtimeMs > t || statSync(cfgPath).mtimeMs > t;
}

// Filtro de video para llevar el clip a W×H
function frame(c, W, H) {
  const hold = c.congelar ? `,tpad=stop_mode=clone:stop_duration=${c.congelar}` : "";
  const pre = [c.recorte ? `crop=${c.recorte}` : null, c.velocidad && c.velocidad !== 1 ? `setpts=PTS/${c.velocidad}` : null]
    .filter(Boolean).join(",");
  const head = pre ? `[0:v]${pre}[src];[src]` : "[0:v]";
  if (c.encuadre === "llenar") {
    const x = c.x ?? 0.5;
    return `${head}scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(in_w-${W})*${x}:(in_h-${H})/2${hold},setsar=1[v]`;
  }
  // completo: el cuadro entero al centro, sobre su propia imagen ampliada y desenfocada
  return `${head}split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=28:4,eq=brightness=-0.1[bg];` +
    `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2${hold},setsar=1[v]`;
}

function cut(c, src, out, filter) {
  const dur = c.a - c.de;
  const audio = c.audio
    ? ["-map", "0:a?", "-c:a", "aac", "-b:a", "192k", ...(c.velocidad && c.velocidad !== 1 ? ["-af", `atempo=${c.velocidad}`] : [])]
    : ["-an"];
  ffmpeg(["-ss", String(c.de), "-t", String(dur), "-i", src, "-filter_complex", filter, "-map", "[v]", ...audio,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", out]);
}

function timing(ep) {
  const dir = join(STUDIO, "assets", ep);
  const { duration, segments } = JSON.parse(readFileSync(join(dir, "segments.json"), "utf8"));
  const words = existsSync(join(dir, "captions.json")) ? JSON.parse(readFileSync(join(dir, "captions.json"), "utf8")).words : [];
  const S = (i) => segments[Math.min(i, segments.length - 1)].start;
  const at = (word, from) => {
    const w = words.find((w) => w.start >= from - 0.05 && norm(w.text) === norm(word));
    if (!w) console.warn(`AVISO: no encontré la palabra «${word}» desde ${from}s; uso ${from}s`);
    return w ? w.start : from;
  };
  return { duration, S, at };
}

const MARK = /(<!-- medios -->)[\s\S]*?(<!-- \/medios -->)/;
const MARK_STAGE = /(<!-- medios-escenario -->)[\s\S]*?(<!-- \/medios-escenario -->)/;

// Escribe (o borra, si no hay medios) los elementos en las composiciones. La usa también use-episode.mjs.
export function inject(ep) {
  const cfgPath = join(STUDIO, "assets", ep, "media", "medios.json");
  const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : { clips: [] };
  const { duration, S, at } = existsSync(join(STUDIO, "assets", ep, "segments.json")) ? timing(ep) : { duration: 0, S: () => 0, at: (w, f) => f };
  const placed = (cfg.clips || []).map((c) => {
    const base = c.frase != null ? S(c.frase) : 0;
    const t = c.t ?? (c.palabra ? at(c.palabra, base) : base);
    const d = (c.a - c.de) / (c.velocidad || 1) + (c.congelar || 0);
    return { ...c, t: r3(t), d: r3(d) };
  });
  for (const { file, prefix, wide } of COMPOSITIONS) {
    const path = join(STUDIO, file);
    let html = readFileSync(path, "utf8");
    if (!MARK.test(html) || !MARK_STAGE.test(html)) {
      console.warn(`AVISO: ${file} no tiene las marcas <!-- medios --> / <!-- medios-escenario -->; no inserto medios.`);
      continue;
    }
    const src = (name) => `${prefix}assets/${ep}/media/${name}`;
    const vid = (c, name, style) =>
      `\n        <video id="clip-${c.id}" class="medio" src="${src(name)}" ${c.audio ? `data-has-audio="true" data-volume="${c.volumen ?? 1}"` : "muted"} playsinline ` +
      `data-start="${c.t}" data-duration="${c.d}" data-media-start="0" style="${style}"></video>`;
    const back = placed.filter((c) => c.capa !== "ventana")
      .map((c) => vid(c, `${c.id}-${wide ? 16 : 9}.mp4`, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover")).join("");
    const music = cfg.musica
      ? `\n        <audio id="musica" src="${src("musica.wav")}" data-start="0" data-duration="${r3(duration)}" data-volume="${cfg.musica.volumen ?? 0.12}"></audio>`
      : "";
    const stage = placed.filter((c) => c.capa === "ventana").map((c) => {
      const [x, y, w, h] = c.caja || [90, 250, 900, 506];
      return vid(c, `${c.id}.mp4`, `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:contain;z-index:5`);
    }).join("");
    html = html.replace(MARK, `$1${back}${music}\n        $2`).replace(MARK_STAGE, `$1${stage}\n        $2`);
    writeFileSync(path, html);
  }
  return placed;
}

function prepare(ep, force) {
  const dir = join(STUDIO, "assets", ep, "media");
  const cfgPath = join(dir, "medios.json");
  if (!existsSync(cfgPath)) {
    console.log(`${ep}: sin media/medios.json (solo imágenes o nada que preparar)`);
    return;
  }
  mkdirSync(dir, { recursive: true });
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  for (const c of cfg.clips || []) {
    const src = resolve(ROOT, c.fuente);
    if (!existsSync(src)) throw new Error(`No existe ${c.fuente} (clip ${c.id})`);
    if (c.capa === "ventana") {
      const out = join(dir, `${c.id}.mp4`);
      if (stale(out, src, cfgPath, force)) {
        const pre = [c.recorte ? `crop=${c.recorte}` : null, c.velocidad && c.velocidad !== 1 ? `setpts=PTS/${c.velocidad}` : null, "scale='min(1280,iw)':-2",
          c.congelar ? `tpad=stop_mode=clone:stop_duration=${c.congelar}` : null, "setsar=1"];
        cut(c, src, out, `[0:v]${pre.filter(Boolean).join(",")}[v]`);
        console.log(`  ${c.id}.mp4 (ventana)`);
      }
    } else {
      for (const [W, H, k] of [[1080, 1920, 9], [1920, 1080, 16]]) {
        const out = join(dir, `${c.id}-${k}.mp4`);
        if (stale(out, src, cfgPath, force)) {
          cut(c, src, out, frame(c, W, H));
          console.log(`  ${c.id}-${k}.mp4 (fondo ${k === 9 ? "9:16" : "16:9"})`);
        }
      }
    }
  }
  if (cfg.musica) {
    const src = resolve(ROOT, cfg.musica.fuente);
    const out = join(dir, "musica.wav");
    const { duration } = timing(ep);
    if (stale(out, src, cfgPath, force)) {
      // Recorta a la duración del video con un fundido de 2 s al final
      ffmpeg(["-ss", String(cfg.musica.de ?? 0), "-t", String(duration), "-i", src, "-af",
        `afade=t=in:d=0.5,afade=t=out:st=${Math.max(0, duration - 2)}:d=2,loudnorm=I=-16:TP=-1.5`, "-ar", "48000", "-ac", "2", out]);
      console.log("  musica.wav");
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ep = process.argv[2];
  if (!ep) {
    console.error("Uso: node tools/medios.mjs epNNN [--forzar]");
    process.exit(1);
  }
  prepare(ep, process.argv.includes("--forzar"));
  const placed = inject(ep);
  for (const c of placed) console.log(`${c.id}: ${c.capa || "fondo"} de ${c.t}s a ${r3(c.t + c.d)}s (${c.fuente} ${c.de}–${c.a}s)`);
  console.log(`${ep}: medios listos en index.html y compositions/youtube.html`);
}
