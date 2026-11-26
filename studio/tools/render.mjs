// Revisa y renderiza un episodio en 9:16 y 16:9 de una vez.
// Uso: node tools/render.mjs ep006 ../episodes/006-ia-local [--solo reel|youtube]
// Deja los MP4 en <carpeta_episodio>/out/NNN-tema-reel-9x16.mp4 y NNN-tema-youtube-16x9.mp4
import { execFileSync } from "node:child_process";
import { basename, relative, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const [ep, epDir, flag, only] = process.argv.slice(2);
if (!ep || !epDir) {
  console.error("Uso: node tools/render.mjs epNNN ../episodes/NNN-tema [--solo reel|youtube]");
  process.exit(1);
}
const HF = "hyperframes@0.8.223";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (...args) => execFileSync(npx, ["--yes", HF, ...args], { stdio: "inherit", shell: process.platform === "win32" });

execFileSync(process.execPath, ["tools/use-episode.mjs", ep], { stdio: "inherit" });
run("check");
// Ruta relativa: en Windows npx.cmd pasa por la shell y una ruta con espacios se partiría
const out = relative(process.cwd(), resolve(epDir, "out")).replaceAll("\\", "/");
mkdirSync(out, { recursive: true });
const name = basename(resolve(epDir));
if (only !== "youtube") run("render", "-o", `${out}/${name}-reel-9x16.mp4`);
if (only !== "reel") run("render", "-c", "compositions/youtube.html", "-o", `${out}/${name}-youtube-16x9.mp4`);
console.log(`Listo: ${out}`);
