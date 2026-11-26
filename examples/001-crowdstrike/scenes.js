// Episodio 001: la caída de CrowdStrike (19 de julio de 2024).
// Cada escena corresponde a una frase del guion (EP.segments[i]).
window.EPISODE_TAG = "FALLAS TECH #001";
window.buildEpisode = function ({ tl, scene, at, S, E, boil, glitch, pop, setBg }) {
  // 0 — Gancho: contador de equipos caídos
  {
    const el = scene(0, `
      <div class="big-num" id="num">0</div>
      <div class="kicker">computadoras<br><em>apagadas</em> en 1 día</div>`);
    const num = el.querySelector("#num");
    const counter = { v: 0 };
    tl.to(counter, {
      v: 8500000, duration: 1.4, ease: "steps(14)",
      onUpdate: () => { num.textContent = Math.round(counter.v).toLocaleString("en-US"); },
    }, 0);
    pop(el.querySelector(".kicker"), at("apagó", 0));
    glitch(num, 0.2, E(0), 11);
    boil(el.querySelector(".kicker"), 0, E(0), 7, 1.2, 3);
  }

  // 1 — Pantalla azul en aeropuertos, bancos y hospitales
  {
    const el = scene(1, `
      <div class="sad">:(</div>
      <div class="date">19 · 07 · 2024</div>
      <div class="hits">
        <div class="paper">✈️ AEROPUERTOS</div>
        <div class="paper">🏦 BANCOS</div>
        <div class="paper">🏥 HOSPITALES</div>
      </div>`);
    setBg("#0a63c9", S(1));
    pop(el.querySelector(".date"), S(1) + 0.1);
    const papers = el.querySelectorAll(".hits .paper");
    ["aeropuertos", "bancos", "hospitales"].forEach((w, i) => pop(papers[i], at(w, S(1))));
    papers.forEach((p, i) => boil(p, S(1), E(1), 8, 2.5, 20 + i));
    boil(el.querySelector(".sad"), S(1), E(1), 5, 1, 9);
  }

  // 2 — El archivo de configuración dentro del kernel
  {
    const el = scene(2, `
      <div class="paper file">C-00000291*.sys</div>
      <div class="layers">
        <div class="layer">APPS</div>
        <div class="layer">WINDOWS</div>
        <div class="layer kernel">KERNEL<small>CrowdStrike Falcon</small></div>
      </div>`);
    setBg("#0b0d10", S(2));
    const file = el.querySelector(".file");
    tl.fromTo(file, { yPercent: -260, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "steps(5)" }, at("archivo", S(2)));
    boil(file, S(2), E(2), 8, 3, 31);
    el.querySelectorAll(".layer").forEach((l, i) => pop(l, S(2) + 0.15 * i));
    const kernel = el.querySelector(".kernel");
    const tk = at("kernel", S(2));
    tl.fromTo(kernel, { boxShadow: "0 0 0 rgba(255,46,77,0)" }, { boxShadow: "0 0 90px rgba(255,46,77,0.9)", duration: 0.4, ease: "steps(4)" }, tk);
    glitch(kernel, tk, E(2), 41);
  }

  // 3 — 21 campos en la plantilla, 20 valores en el código
  {
    const cells = Array.from({ length: 21 }, (_, i) =>
      `<div class="cell${i === 20 ? " missing" : ""}">${i === 20 ? "?" : i + 1}</div>`).join("");
    const el = scene(3, `
      <div class="labels">plantilla: <b>21</b> campos<br>código: &nbsp;&nbsp;<b>20</b> valores</div>
      <div class="grid">${cells}</div>`);
    const list = el.querySelectorAll(".cell");
    const t21 = at("21", S(3));
    list.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.08, ease: "steps(2)" }, t21 + i * 0.04));
    const t20 = at("20", S(3));
    list.forEach((c, i) => { if (i < 20) tl.set(c, { backgroundColor: "#19e38a", borderColor: "#19e38a", color: "#04150c" }, t20 + i * 0.05); });
    const missing = list[20];
    tl.fromTo(missing, { scale: 1 }, { scale: 1.18, duration: 0.25, ease: "steps(3)", repeat: 7, yoyo: true }, t20 + 1);
  }

  // 4 — Lectura de memoria fuera de límites
  {
    const el = scene(4, `
      <div class="editor">
        <div class="bar">content_interpreter.c</div>
<pre><span class="c">// 20 valores recibidos: [0..19]</span>
<span class="k">valor</span> = entrada[<span class="n">20</span>];
<span class="c">// campo 21 → no existe</span></pre>
      </div>
      <div class="stamp" data-layout-allow-overflow>OUT OF BOUNDS</div>`);
    const line = el.querySelector("pre");
    tl.set(line, { backgroundColor: "rgba(255,46,77,0.25)" }, at("accedió", S(4)));
    const stamp = el.querySelector(".stamp");
    tl.fromTo(stamp, { scale: 2.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "steps(3)" }, at("memoria", S(4)));
    glitch(stamp, at("memoria", S(4)), E(4), 52);
    setBg("#1a0508", at("memoria", S(4)));
    boil(el.querySelector(".editor"), S(4), E(4), 4, 0.6, 57);
  }

  // 5 — Bucle infinito: pantalla azul, reinicio, otra vez
  {
    const el = scene(5, `
      <div class="loop">
        <div class="node">💥 PANTALLA AZUL</div>
        <div class="arrow">↓</div>
        <div class="node">🔄 REINICIO</div>
        <div class="arrow">↺</div>
      </div>`);
    setBg("#0b0d10", S(5));
    const [blue, reboot] = el.querySelectorAll(".node");
    const ON = { backgroundColor: "#f4f1ea", color: "#0b0d10" };
    const OFF = { backgroundColor: "rgba(0,0,0,0)", color: "#f4f1ea" };
    const t0 = at("azul", S(5));
    for (let t = t0, k = 0; t < E(5); t += 0.45, k++) {
      const onBlue = k % 2 === 0;
      tl.set(blue, onBlue ? ON : OFF, t);
      tl.set(reboot, onBlue ? OFF : ON, t);
      setBg(onBlue ? "#0a63c9" : "#0b0d10", t);
    }
    el.querySelectorAll(".node, .arrow").forEach((n, i) => boil(n, S(5), E(5), 7, 2, 60 + i));
  }

  // 6 — La lección
  {
    const el = scene(6, `
      <div class="lesson-title">LA LECCIÓN</div>
      <div class="notes">
        <div class="paper">1. Valida la config como si fuera código<small>tests · esquema · fuzzing</small></div>
        <div class="paper">2. Despliega por etapas<small>canary → 10% → 100%</small></div>
      </div>
      <div class="rollout"><div class="stage-bar">1%</div><div class="stage-bar">10%</div><div class="stage-bar">100%</div></div>`);
    setBg("#0b0d10", S(6));
    pop(el.querySelector(".lesson-title"), S(6));
    const notes = el.querySelectorAll(".notes .paper");
    pop(notes[0], at("valida", S(6)));
    const td = at("despliega", S(6));
    pop(notes[1], td);
    notes.forEach((n, i) => boil(n, S(6), E(6), 7, 2, 70 + i));
    el.querySelectorAll(".stage-bar").forEach((b, i) => {
      tl.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, td);
      tl.set(b, { backgroundColor: "#19e38a", color: "#04150c" }, td + 0.6 + i * 0.6);
    });
  }

  // 7 — Llamada a la acción
  {
    const el = scene(7, `
      <div class="cta">SÍGUEME</div>
      <div class="cta-sub">para más fallas que cambiaron la tecnología</div>`);
    setBg("#0b0d10", S(7));
    pop(el.querySelector(".cta"), S(7));
    pop(el.querySelector(".cta-sub"), S(7) + 0.4);
    glitch(el.querySelector(".cta"), S(7), E(7), 81);
    boil(el.querySelector(".cta-sub"), S(7), E(7), 6, 1.5, 83);
  }
};
