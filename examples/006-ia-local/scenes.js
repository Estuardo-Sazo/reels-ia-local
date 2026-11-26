// Episodio 006: IA local en tu propia compu, usando este canal como ejemplo.
// Primer episodio con el tema TERMINAL (CRT de fósforo verde).
// Cifras medidas en este mismo Mac al generar el episodio (M1 Max, 32 GB):
//   voz: 53 s de audio en 41 s · subtítulos: 10 s · Qwen3-TTS ~8.5 GB · Whisper turbo ~3 GB
window.EPISODE_TAG = "[ IA HOY 006 ]";
window.EPISODE_THEME = "terminal";
window.buildEpisode = function ({ tl, scene, at, S, E, typeText, asciiBar, equalizer, pop, glitch }) {
  const sc = (i, html) => {
    const el = scene(i, html);
    el.classList.add("term-scene");
    return el;
  };
  // Escribe varias líneas .term-line una tras otra, cada una en su momento
  const typeLines = (el, times, cps = 40) =>
    el.querySelectorAll(".term-line[data-text]").forEach((ln, i) => typeText(ln, ln.dataset.text, times[i], cps));

  // 0 — La voz no es humana… y salió de esta laptop
  {
    const el = sc(0, `
      <div class="term-eq"></div>
      <div class="term-big">NO ES<br>HUMANA_</div>
      <div class="term-line" data-text="$ origen --voz"></div>
      <div class="term-line term-amber" data-text="> nube ........ ✗ no"></div>
      <div class="term-line" data-text="> esta laptop . ✓ sí"></div>`);
    equalizer(el.querySelector(".term-eq"), 0, E(0), 28, 5);
    tl.fromTo(el.querySelector(".term-big"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at("humana", 0) - 0.4);
    glitch(el.querySelector(".term-big"), at("humana", 0) - 0.4, at("humana", 0) + 0.6, 3);
    typeLines(el, [at("nube", 0) - 0.8, at("nube", 0) - 0.1, at("laptop", 0) - 0.5]);
  }

  // 1 — Ficha del sistema: modelo, chip, pesos, créditos
  {
    const el = sc(1, `
      <div class="term-mid term-amber">$ sysinfo</div>
      <div class="term-box">
        <div class="term-line" data-text="modelo ... Qwen3-TTS 1.7B (abierto)"></div>
        <div class="term-line" data-text="params ... 1.700.000.000"></div>
        <div class="term-line" data-text="chip ..... Apple M1 Max · 32 GB"></div>
        <div class="term-line" data-text="pesos .... ~8.5 GB en disco"></div>
        <div class="term-line term-amber" data-text="créditos . $0.00"></div>
      </div>
      <div class="term-line load"></div>`);
    typeLines(el, [S(1) + 0.3, at("setecientos", S(1)) - 0.6, at("m1", S(1)) - 0.4, at("m1", S(1)) + 0.6, at("credito", S(1)) - 0.6], 50);
    asciiBar(el.querySelector(".load"), S(1) + 0.4, 2.2, 18, (p) => (p < 100 ? `cargando ${p}%` : "listo ✓"));
  }

  // 2 — El pipeline: voz, subtítulos, render (tiempos reales)
  {
    const el = sc(2, `
      <div class="term-mid term-amber">$ ./pipeline.sh</div>
      <div class="term-line" data-text="[1] voz ....... Qwen3-TTS"></div>
      <div class="term-line bar-a"></div>
      <div class="term-line term-dim" data-text="    53 s de audio en 41 s"></div>
      <div class="term-line" data-text="[2] subtítulos  Whisper"></div>
      <div class="term-line bar-b"></div>
      <div class="term-line term-dim" data-text="    10 s"></div>
      <div class="term-line" data-text="[3] render .... HyperFrames"></div>
      <div class="term-line bar-c"></div>
      <div class="term-line term-dim" data-text="    &lt; 1 min"></div>`.replace("&lt;", "<"));
    const tW = at("whisper", S(2)) - 0.3;
    const tR = at("animacion", S(2)) - 0.3;
    const lines = el.querySelectorAll(".term-line[data-text]");
    typeText(lines[0], lines[0].dataset.text, S(2) + 0.2, 60);
    asciiBar(el.querySelector(".bar-a"), S(2) + 0.6, 0.8, 18);
    typeText(lines[1], lines[1].dataset.text, S(2) + 1.5, 60);
    typeText(lines[2], lines[2].dataset.text, tW, 60);
    asciiBar(el.querySelector(".bar-b"), tW + 0.4, 0.6, 18);
    typeText(lines[3], lines[3].dataset.text, tW + 1.1, 60);
    typeText(lines[4], lines[4].dataset.text, tR, 60);
    asciiBar(el.querySelector(".bar-c"), tR + 0.4, 1.0, 18);
    typeText(lines[5], lines[5].dataset.text, at("minuto", S(2)) - 0.2, 60);
  }

  // 3 — Privacidad: nada sale de tu máquina
  {
    const el = sc(3, `
      <div class="term-mid">PRIVACIDAD</div>
      <div class="term-box">
        <div class="term-line" data-text="[ tu audio  ] ──┐"></div>
        <div class="term-line" data-text="[ tu código ] ──┼──▶ localhost ✓"></div>
        <div class="term-line" data-text="[ tus datos ] ──┘"></div>
        <div class="term-line term-red" data-text="                 ──╳── nube"></div>
      </div>
      <div class="term-big term-amber" style="font-size:110px">0 bytes<br>enviados</div>`);
    typeLines(el, [at("audio", S(3)) - 0.2, at("codigo", S(3)) - 0.2, at("datos", S(3)) - 0.2, at("nunca", S(3)) - 0.1], 70);
    pop(el.querySelector(".term-big"), at("maquina", S(3)) - 0.3);
  }

  // 4 — Costo y sin internet
  {
    const el = sc(4, `
      <div class="term-mid">COSTO</div>
      <div class="term-box">
        <div class="term-line" data-text="nube .... $ por cada petición"></div>
        <div class="term-line term-amber cost"></div>
        <div class="term-line" data-text="local ... pago único: tu equipo"></div>
        <div class="term-line term-amber" data-text="          y $0 extra por petición"></div>
      </div>
      <div class="term-line wifi" data-text="$ wifi off  →  sigue funcionando ✓"></div>`);
    const ls = el.querySelectorAll(".term-line[data-text]");
    typeText(ls[0], ls[0].dataset.text, S(4) + 0.3, 60);
    const cost = el.querySelector(".cost");
    for (let k = 1; k <= 12; k++) tl.set(cost, { innerText: "          " + "$".repeat(k) + " ↑" }, S(4) + 0.9 + k * 0.12);
    typeText(ls[1], ls[1].dataset.text, at("vez", S(4)) - 0.6, 60);
    typeText(ls[2], ls[2].dataset.text, at("peticion", S(4)) - 0.2, 60);
    typeText(ls[3], ls[3].dataset.text, at("internet", S(4)) - 0.8, 60);
  }

  // 5 — Qué necesitas: hardware y herramientas
  {
    const el = sc(5, `
      <div class="term-mid">LO QUE NECESITAS</div>
      <div class="term-line" data-text="[x] memoria unificada (Apple Silicon)"></div>
      <div class="term-line" data-text="[x] o GPU con buena VRAM"></div>
      <div class="term-box">
        <div class="term-line term-amber" data-text="$ ollama run &lt;modelo&gt;"></div>
        <div class="term-line term-amber" data-text="$ lms load &lt;modelo&gt;      # LM Studio"></div>
        <div class="term-line term-amber" data-text="$ mlx_lm.generate --model &lt;modelo&gt;"></div>
      </div>`.replaceAll("&lt;", "<").replaceAll("&gt;", ">"));
    typeLines(el, [at("memoria", S(5)) - 0.2, at("gpu", S(5)) - 0.3, at("ollama", S(5)) - 0.3, at("lm", S(5)) - 0.3, at("mlx", S(5)) - 0.3], 70);
  }

  // 6 — La contra: los modelos locales son más pequeños
  {
    const el = sc(6, `
      <div class="term-box amber">
        <div class="term-mid term-amber">⚠ ADVERTENCIA</div>
        <div class="term-line" data-text="modelos locales: más pequeños"></div>
      </div>
      <div class="term-line" data-text="tamaño del modelo (ilustrativo)"></div>
      <div class="term-line bar-local"></div>
      <div class="term-line term-amber bar-cloud"></div>
      <div class="term-line term-dim" data-text="tareas enormes → la nube sigue ganando"></div>`);
    pop(el.querySelector(".term-box"), S(6) + 0.1);
    const ls = el.querySelectorAll(".term-line[data-text]");
    typeText(ls[0], ls[0].dataset.text, at("modelos", S(6)) - 0.2, 60);
    typeText(ls[1], ls[1].dataset.text, at("pequeños", S(6)), 70);
    asciiBar(el.querySelector(".bar-local"), at("pequeños", S(6)) + 0.4, 0.5, 18, () => "local");
    tl.set(el.querySelector(".bar-local"), { innerText: "[███░░░░░░░░░░░░░░░] local" }, at("pequeños", S(6)) + 0.95);
    asciiBar(el.querySelector(".bar-cloud"), at("pequeños", S(6)) + 0.9, 1.0, 18, () => "nube");
    typeText(ls[2], ls[2].dataset.text, at("enormes", S(6)) - 0.3, 60);
  }

  // 7 — Llamada a la acción
  {
    const el = sc(7, `
      <div class="term-big" style="font-size:190px">SÍGUEME_</div>
      <div class="term-line term-amber" data-text="> montemos tu estudio de IA local"></div>`);
    tl.fromTo(el.querySelector(".term-big"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, S(7));
    glitch(el.querySelector(".term-big"), S(7), S(7) + 0.8, 7);
    typeLines(el, [S(7) + 0.5], 50);
  }
};
