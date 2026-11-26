// Episodio 008: en un abrir y cerrar de ojos. Del teclado de números a la IA, y lo que viene.
// Tema DOCUMENTAL: una sola línea de tiempo en un lienzo continuo que la cámara recorre
// (teclas → táctil → mejoras → IA → ?) y al final se ve completa.
window.EPISODE_TAG = "FUTURO · 008";
window.EPISODE_THEME = "documental";
window.EPISODE_KEYWORDS = ["C", "dos", "días", "táctiles", "rápido", "artificial", "voz", "nadie", "listo", "cambio", "viene"];
window.buildEpisode = function ({ tl, scene, at, S, E, draw, doc }) {
  const { world, cam, up, show } = doc;
  const ACC = document.getElementById("root").style.getPropertyValue("--doc-accent");
  const GAP = 1400;
  const X = [0, 1, 2, 3, 4].map((i) => i * GAP); // estaciones A–E
  const CX = X.map((x) => x + 540);

  const el = (cls, html, style = "", parent = world) => {
    const d = document.createElement("div");
    d.className = cls;
    d.innerHTML = html;
    if (style) d.style.cssText = style;
    parent.appendChild(d);
    return d;
  };
  const station = (i) => el("doc-st", "", `left:${X[i]}px`);
  const pick = (root, cls) => root.getElementsByClassName(cls)[0];
  const lineUp = (span, t) => tl.fromTo(span, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: "expo.out" }, t);
  const fadeTo = (node, opacity, t, dur = 0.8) => tl.to(node, { opacity, duration: dur, ease: "power2.inOut" }, t);

  // --- Línea de tiempo que atraviesa todo el lienzo ---
  const TX = 600; // x del lienzo = x del svg - TX
  const tx = (x) => x + TX;
  const ticks = (from, to, step) => {
    let d = "";
    for (let x = from + step; x < to; x += step) d += `M${x} 34V46`;
    return d;
  };
  // Entre la tercera y la cuarta estación las marcas se juntan: el cambio se acelera
  let fast = "";
  for (let x = tx(CX[2]), s = 140; x < tx(CX[3]) - 10; x += s, s = Math.max(14, s * 0.84)) fast += `M${x.toFixed(1)} 34V46`;
  const track = el("doc-track", `
    <svg class="doc-svg" width="7800" height="140" viewBox="0 0 7800 140">
      <defs><linearGradient id="fade" gradientUnits="userSpaceOnUse" x1="${tx(CX[4])}" y1="0" x2="7700" y2="0">
        <stop offset="0" stop-color="${ACC}" stop-opacity="1"/><stop offset="1" stop-color="${ACC}" stop-opacity="0"/></linearGradient></defs>
      <path class="ink seg0" d="M300 40H${tx(CX[0])}"/>
      <path class="ink seg1" d="M${tx(CX[0])} 40H${tx(CX[1])}"/>
      <path class="ink seg2" d="M${tx(CX[1])} 40H${tx(CX[2])}"/>
      <path class="ink seg3" d="M${tx(CX[2])} 40H${tx(CX[3])}"/>
      <path class="ink seg4" d="M${tx(CX[3])} 40H${tx(CX[4])}"/>
      <path class="beyond" d="M${tx(CX[4])} 40H7700" style="fill:none;stroke:url(#fade);stroke-width:3;stroke-dasharray:14 14"/>
      <path class="thin t1" d="${ticks(tx(CX[0]), tx(CX[1]), 140)}"/>
      <path class="thin t2" d="${ticks(tx(CX[1]), tx(CX[2]), 140)}"/>
      <path class="thin t3" d="${fast}" style="stroke:${ACC};opacity:.6"/>
      ${CX.map((c, i) => `<circle class="node n${i}" cx="${tx(c)}" cy="40" r="10" style="fill:var(--doc-surface);stroke:${i === 4 ? ACC : "var(--doc-ink)"};stroke-width:3"/>`).join("")}
      ${["TECLAS", "TÁCTIL", "CÁMARAS · PANTALLAS · POTENCIA", "IA", "¿?"].map((s, i) =>
        `<text class="mono nl${i}" x="${tx(CX[i])}" y="96" font-size="24" text-anchor="middle">${s}</text>`).join("")}
    </svg>`, `left:${-TX}px;top:1100px`);
  const q = (s) => track.querySelector(s);
  const qc = (cls) => pick(track, cls);
  // Cada tramo se dibuja cuando la cámara viaja por él; cada nodo aparece al llegar
  const segment = (i, t, dur = 1.4) => {
    draw(qc("seg" + i), t, dur);
    if (qc("t" + i)) tl.fromTo(qc("t" + i), { autoAlpha: 0 }, { autoAlpha: 1, duration: dur }, t);
    tl.fromTo(qc("n" + i), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "power3.out" }, t + dur - 0.3);
    tl.fromTo(qc("nl" + i), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t + dur - 0.2);
  };

  // Estaciones: solo la que está en foco se ve a pleno (se nota en 16:9, donde se ven las vecinas)
  const st = [0, 1, 2, 3, 4].map(station);
  st.slice(1).forEach((s) => tl.set(s, { opacity: 0.12 }, 0));
  const focus = (idx, t) => st.forEach((s, j) => fadeTo(s, idx === "all" || j === idx ? 1 : 0.12, t));

  // ===== A · El teléfono de teclas =====
  const keyLabels = [["1", ""], ["2", "abc"], ["3", "def"], ["4", "ghi"], ["5", "jkl"], ["6", "mno"], ["7", "pqrs"], ["8", "tuv"], ["9", "wxyz"], ["*", ""], ["0", "␣"], ["#", ""]];
  const keys = keyLabels.map(([n, l], k) => {
    const cx = [88, 170, 252][k % 3];
    const y = 360 + Math.floor(k / 3) * 68;
    return `<g class="k${k}"><rect class="key" x="${cx - 36}" y="${y}" width="72" height="54" rx="14"/>
      <text x="${cx}" y="${y + 27}" font-size="24" font-weight="500" text-anchor="middle">${n}</text>
      <text class="mono" x="${cx}" y="${y + 45}" font-size="12" text-anchor="middle">${l}</text></g>`;
  }).join("");
  st[0].innerHTML = `
    <div class="doc-label" style="left:90px;top:96px">Cuando tenía 12 años</div>
    <div class="doc-h a-h" style="left:90px;top:150px"><span class="doc-ln"><span>Tres toques</span></span><span class="doc-ln"><span><em>para una letra.</em></span></span></div>
    <svg class="doc-svg" style="left:380px;top:440px" width="320" height="640" viewBox="0 0 340 680">
      <rect class="body" x="10" y="10" width="320" height="660" rx="60"/>
      <rect class="thin" x="140" y="44" width="60" height="8" rx="4"/>
      <rect x="50" y="80" width="240" height="180" rx="8" style="fill:#0d0d0b;stroke:var(--doc-line);stroke-width:2"/>
      <text class="mono" x="62" y="104" font-size="13">MENSAJE</text>
      <rect x="250" y="92" width="24" height="12" rx="2" style="fill:none;stroke:var(--doc-muted);stroke-width:2"/>
      <rect x="253" y="95" width="18" height="6" style="fill:var(--doc-muted)"/>
      <rect class="key" x="58" y="292" width="62" height="22" rx="11"/><rect class="key" x="220" y="292" width="62" height="22" rx="11"/>
      <circle class="key" cx="170" cy="304" r="28"/>
      ${keys}
    </svg>
    <div class="a-letter" style="left:427px;top:540px;width:226px;height:140px;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:104px;color:var(--doc-ink)">_</div>
    <svg class="doc-svg a-call" style="left:0;top:0" width="1080" height="1200" viewBox="0 0 1080 1200">
      <path class="acc c0" d="M651 868H770"/><circle class="dot d0" cx="651" cy="868" r="7"/>
      <path class="acc c1" d="M290 600H427"/><circle class="dot d1" cx="427" cy="600" r="7"/>
      <path class="acc c2" d="M640 532L690 490H770"/><circle class="dot d2" cx="640" cy="532" r="7"/>
    </svg>
    <div class="doc-note l0" style="left:790px;top:826px">Teclado<br>de números</div>
    <div class="doc-note l1" style="left:60px;top:556px;width:230px">Pantalla<br>diminuta</div>
    <div class="doc-note l2" style="left:790px;top:448px">Batería<br>de días</div>`;
  {
    const a = st[0];
    cam(540, 600, 1, 0, 0);
    cam(540, 620, 1.04, 0.01, 9.6, "none"); // empuje lento mientras habla
    up(a.querySelector(".a-h"), 0.05);
    // Cursor que parpadea hasta el primer toque, luego a → b → c con la tecla 2
    const letter = a.querySelector(".a-letter");
    const t3 = at("tres", 0);
    for (let t = 0; t < t3; t += 0.5) tl.set(letter, { opacity: Math.round(t * 2) % 2 ? 0.2 : 1 }, t);
    const key2 = a.querySelector(".k1 rect");
    ["a", "b", "c"].forEach((ch, k) => {
      const t = t3 + k * 0.42;
      tl.set(letter, { innerText: ch, opacity: 1 }, t);
      tl.set(key2, { fill: ACC }, t);
      tl.set(key2, { fill: "#222119" }, t + 0.18);
    });
    tl.to(letter, { color: ACC, duration: 0.4 }, t3 + 0.95);
    // Anotaciones del teléfono, cada una cuando se nombra
    [["teclado", 0], ["pantalla", 1], ["bateria", 2]].forEach(([w, k]) => {
      const t = at(w, S(1)) - 0.15;
      tl.fromTo(pick(a, "d" + k), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t);
      draw(pick(a, "c" + k), t, 0.5);
      show(pick(a, "l" + k), t + 0.25, 0.7, 12);
    });
  }

  // ===== B · Pantallas táctiles =====
  const icons = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const hot = r === 2 && c === 1;
    icons.push(`<rect class="ic" x="${37.6 + c * 67.6}" y="${92 + r * 82}" width="52" height="52" rx="13" style="fill:${hot ? ACC : (r + c) % 3 ? "#2a2925" : "#36352f"}"/>`);
  }
  st[1].innerHTML = `
    <div class="doc-label b-l" style="left:90px;top:96px">Un abrir y cerrar de ojos</div>
    <div class="doc-h b-h" style="left:90px;top:150px"><span class="doc-ln"><span>De teclas</span></span><span class="doc-ln"><span><em>a pantalla.</em></span></span></div>
    <svg class="doc-svg" style="left:390px;top:440px" width="300" height="600" viewBox="0 0 330 660">
      <rect class="body b-body" x="6" y="6" width="318" height="648" rx="46"/>
      <rect class="b-scr" x="22" y="64" width="286" height="530" rx="8" style="fill:#0d0d0b"/>
      <rect class="thin" x="135" y="30" width="60" height="8" rx="4"/>
      <circle class="thin" cx="165" cy="624" r="14"/>
      ${icons.join("")}
      <circle class="b-tap" cx="${37.6 + 67.6 + 26}" cy="${92 + 2 * 82 + 26}" r="40" style="fill:none;stroke:var(--doc-ink);stroke-width:3"/>
    </svg>`;
  {
    const b = st[1];
    const t0 = at("abrir", S(2)) - 0.4;
    cam(CX[1], 600, 1, t0, 1.5);
    segment(1, t0, 1.5);
    focus(1, t0 + 0.3);
    show(b.querySelector(".b-l"), t0 + 0.6);
    up(b.querySelector(".b-h"), at("ojos", S(2)) - 0.1);
    const tt = at("pantallas", S(2)) - 0.5;
    draw(b.querySelector(".b-body"), tt, 0.9);
    tl.fromTo(b.querySelector(".b-scr"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, tt + 0.5);
    b.querySelectorAll(".ic").forEach((ic, k) =>
      tl.fromTo(ic, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }, tt + 0.7 + k * 0.025));
    const tap = b.querySelector(".b-tap");
    tl.fromTo(tap, { autoAlpha: 0.7, scale: 0.2, transformOrigin: "50% 50%" }, { autoAlpha: 0, scale: 1.4, duration: 0.8, ease: "power2.out" }, at("tactiles", S(2)) + 0.4);
  }

  // ===== C · Mejores cámaras, pantallas y potencia; zoom a "3 o 4 años" =====
  const rows = ["Cámaras", "Pantallas", "Potencia"];
  st[2].innerHTML = `
    <div class="doc-label c-l" style="left:90px;top:96px">Y luego</div>
    <div class="doc-h c-h" style="left:90px;top:150px"><span class="doc-ln"><span>Cada año,</span></span><span class="doc-ln"><span><em>un poco más.</em></span></span></div>
    ${rows.map((r, k) => `
      <div class="c-row r${k}" style="left:90px;top:${480 + k * 190}px;width:900px">
        <div style="font-size:64px;font-weight:600;letter-spacing:-.03em;margin-bottom:22px">${r}</div>
        <div class="doc-bar"><i></i></div>
      </div>`).join("")}`;
  el("doc-span", `
    <svg class="doc-svg" style="position:absolute;left:0;top:0;overflow:visible" width="1" height="1">
      <path class="span-b" d="M${CX[0]} 1250V1310H${CX[2]}V1250" style="fill:none;stroke:${ACC};stroke-width:10;stroke-linejoin:round"/>
    </svg>
    <div class="span-t" style="position:absolute;left:${CX[1] - 1000}px;top:1380px;width:2000px;text-align:center;font-family:Geist;font-weight:600;font-size:230px;letter-spacing:-.04em;color:var(--doc-ink)">3 o 4 <span class="doc-em">años</span></div>`);
  {
    const c = st[2];
    const t0 = S(3) - 0.05;
    cam(CX[2], 600, 1, t0, 1.4);
    segment(2, t0, 1.4);
    focus(2, t0 + 0.3);
    show(c.querySelector(".c-l"), t0 + 0.4);
    up(c.querySelector(".c-h"), t0 + 0.5);
    ["camaras", "pantallas", "potencia"].forEach((w, k) => {
      const t = at(w, S(3) + (k === 1 ? 1.5 : 0)) - 0.25;
      show(pick(c, "r" + k), t, 0.6, 16);
      tl.fromTo(pick(c, "r" + k).getElementsByTagName("i")[0], { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out" }, t + 0.15);
    });
    // Alejamiento: las tres estaciones caben en "3 o 4 años"
    const tz = at("todo", S(3)) - 0.1;
    cam(CX[1], 900, 0.27, tz, 1.6);
    focus("all", tz);
    draw(document.querySelector(".span-b"), at("tres", S(3)) - 0.3, 0.8);
    show(document.querySelector(".span-t"), at("tres", S(3)), 0.8, 60);
  }

  // ===== D · Otra vez, más rápido: la IA =====
  const curve = (() => {
    let d = "";
    for (let k = 0; k <= 60; k++) {
      const u = k / 60;
      const v = (Math.exp(4 * u) - 1) / (Math.exp(4) - 1);
      d += `${k ? "L" : "M"}${(90 + u * 860).toFixed(1)} ${(1050 - v * 520).toFixed(1)}`;
    }
    return d;
  })();
  const cy = (u) => 1050 - ((Math.exp(4 * u) - 1) / (Math.exp(4) - 1)) * 520;
  const wave = (cls, color) => {
    let bars = "";
    for (let k = 0; k < 90; k++) {
      const env = Math.sin((k / 89) * Math.PI) * 0.7 + 0.3;
      const h = 8 + 104 * env * Math.abs(Math.sin(k * 0.37) * Math.cos(k * 0.11 + 1));
      bars += `<rect x="${k * 10}" y="${(60 - h / 2).toFixed(1)}" width="6" height="${h.toFixed(1)}" rx="3"/>`;
    }
    return `<svg class="doc-svg ${cls}" style="left:90px" width="900" height="120" viewBox="0 0 900 120"><g style="fill:${color}">${bars}</g></svg>`;
  };
  const verbs = ["Escribe", "Programa", "Crea imágenes", "Narra este video"];
  st[3].innerHTML = `
    <div class="doc-label acc d-l" style="left:90px;top:96px">Inteligencia artificial</div>
    <div class="doc-h" style="left:90px;top:150px"><span class="doc-ln"><span class="d-h0">Otra vez,</span></span><span class="doc-ln"><span class="d-h1"><em>y más rápido.</em></span></span></div>
    <svg class="doc-svg" style="left:0;top:0" width="1080" height="1100" viewBox="0 0 1080 1100">
      <path class="thin d-ax" d="M90 480V1050H990"/>
      <path class="acc d-cv" d="${curve}" style="stroke-width:5"/>
      ${[[0.12, "TECLAS"], [0.32, "TÁCTIL"], [0.5, "MEJORAS"]].map(([u, s], k) =>
        `<g class="d-p${k}"><circle cx="${90 + u * 860}" cy="${cy(u)}" r="8" style="fill:var(--doc-ink)"/><text class="mono" x="${90 + u * 860}" y="${cy(u) - 26}" font-size="22" text-anchor="middle">${s}</text></g>`).join("")}
      <g class="d-ia"><circle cx="${90 + 0.97 * 860}" cy="${cy(0.97)}" r="14" class="dot"/>
        <text x="${90 + 0.97 * 860 - 34}" y="${cy(0.97) + 12}" font-size="64" font-weight="600" text-anchor="end" style="fill:${ACC}">IA</text></g>
    </svg>
    <div class="doc-label d-l2" style="left:90px;top:1300px">Hoy una IA</div>
    ${verbs.map((v, k) => `<div class="doc-row v${k}" style="left:90px;top:${1360 + k * 118}px"><b>0${k + 1}</b>${v}</div>`).join("")}
    <div class="doc-label w-l0" style="left:90px;top:1890px">Mi voz</div>
    ${wave("w0", "var(--doc-ink)").replace('style="left:90px"', 'style="left:90px;top:1935px"')}
    <div class="doc-label acc w-l1" style="left:90px;top:2085px">Copia · IA</div>
    ${wave("w1", ACC).replace('style="left:90px"', 'style="left:90px;top:2130px"')}`;
  {
    const d = st[3];
    const t0 = S(4) - 0.1;
    cam(CX[3], 600, 1, t0, 1.6);
    segment(3, t0, 1.6);
    focus(3, t0 + 0.2);
    lineUp(d.querySelector(".d-h0"), at("otra", S(4)) - 0.2);
    lineUp(d.querySelector(".d-h1"), at("mas", S(4)) - 0.15);
    tl.fromTo(d.querySelector(".d-ax"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t0 + 1.2);
    draw(d.querySelector(".d-cv"), at("mas", S(4)) - 0.1, 1.3);
    [0, 1, 2].forEach((k) => show(pick(d, "d-p" + k), at("mas", S(4)) + k * 0.2, 0.5, 8));
    show(d.querySelector(".d-l"), at("inteligencia", S(4)) - 0.2);
    show(d.querySelector(".d-ia"), at("inteligencia", S(4)), 0.6, 10);

    // Baja la cámara: lo que hace hoy una IA, y esta misma voz clonada
    cam(CX[3], 1820, 1, S(5) - 0.15, 1.2);
    show(d.querySelector(".d-l2"), S(5) + 0.2);
    const vt = [at("escribe", S(5)), at("programa", S(5)), at("crea", S(5)), at("narra", S(5))];
    vt.forEach((t, k) => {
      show(pick(d, "v" + k), t - 0.15, 0.6, 18);
      if (k > 0) fadeTo(pick(d, "v" + (k - 1)), 0.32, t - 0.15, 0.5);
    });
    show(d.querySelector(".w-l0"), at("narra", S(5)) + 0.1, 0.5, 8);
    tl.fromTo(d.querySelector(".w0"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" }, at("narra", S(5)) + 0.2);
    show(d.querySelector(".w-l1"), at("copia", S(5)) - 0.3, 0.5, 8);
    tl.fromTo(d.querySelector(".w1"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.inOut" }, at("copia", S(5)) - 0.2);
  }

  // ===== E · Lo que viene =====
  st[4].innerHTML = `
    <div class="doc-h e-h" style="left:90px;top:150px"><span class="doc-ln"><span>Nadie sabe</span></span><span class="doc-ln"><span><em>qué viene.</em></span></span></div>
    <div class="e-q" style="left:0;top:380px;width:1080px;text-align:center;font-weight:600;font-size:560px;line-height:1;letter-spacing:-.04em;color:var(--doc-ink)">?</div>
    <div class="doc-label acc e-l" style="left:0;top:1010px;width:1080px;text-align:center">Dentro de 5 o 6 años</div>`;
  {
    const e = st[4];
    const t0 = S(6) - 0.2;
    cam(CX[4], 600, 1, t0, 1.4);
    segment(4, t0, 1.4);
    focus(4, t0 + 0.2);
    tl.fromTo(q(".beyond"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, t0 + 1.2);
    up(e.querySelector(".e-h"), at("nadie", S(6)) - 0.1);
    tl.fromTo(e.querySelector(".e-q"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out" }, at("mundo", S(6)) - 0.3);
    show(e.querySelector(".e-l"), at("cinco", S(6)) - 0.2, 0.6, 10);
  }

  // ===== Vista completa + lo que depende de ti =====
  {
    const t0 = S(7) - 0.15;
    cam(3250, 1100, 0.14, t0, 1.8, "power3.inOut", 540, 250);
    focus("all", t0);
    const el7 = scene(7, `
      <div class="doc-screen" style="top:470px;height:2px;background:rgba(236,235,230,.1)"></div>
      <div class="doc-screen" style="top:540px">
        <div class="doc-label s7-l">Lo que sí depende de ti</div>
        <div class="doc-h s7-h" style="margin-top:28px"><span class="doc-ln"><span>Estar <em>listo.</em></span></span></div>
        ${["Seguir aprendiendo", "Probar lo nuevo", "Sin miedo al cambio"].map((s, k) =>
          `<div class="doc-row s7-r${k}" style="font-size:66px;margin-top:${k ? 18 : 56}px"><b>0${k + 1}</b>${s}</div>`).join("")}
      </div>`);
    show(el7.querySelector(".s7-l"), at("depende", S(7)) - 0.3);
    up(el7.querySelector(".s7-h"), at("estar", S(7)) - 0.3);
    ["seguir", "probar", "no"].forEach((w, k) => show(pick(el7, "s7-r" + k), at(w, S(7)) - 0.2, 0.6, 16));
  }

  // ===== Cierre =====
  {
    fadeTo(world, 0.25, S(8) - 0.1, 0.6);
    const el8 = scene(8, `
      <div class="doc-screen" style="top:560px">
        <div class="doc-label acc">Futuro</div>
        <div class="doc-h s8-h" style="font-size:190px;margin-top:24px"><span class="doc-ln"><span>Sígueme</span></span><span class="doc-ln"><span><em style="font-size:.62em">para lo que viene.</em></span></span></div>
      </div>`);
    up(el8.querySelector(".s8-h"), S(8) - 0.05, 0.25);
  }
};
