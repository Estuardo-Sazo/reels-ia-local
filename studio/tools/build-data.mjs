// Junta segments.json y captions.json de un episodio en un data.js que la composición carga
// sin fetch (el render debe ser determinista).
// Uso: node tools/build-data.mjs assets/ep001
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const { duration, segments } = JSON.parse(readFileSync(join(dir, "segments.json"), "utf8"));
const { words } = JSON.parse(readFileSync(join(dir, "captions.json"), "utf8"));

writeFileSync(
  join(dir, "data.js"),
  `window.EP = ${JSON.stringify({ duration, segments, words })};\n`,
);
console.log(`${dir}/data.js: ${segments.length} frases, ${words.length} palabras, ${duration}s`);
