// Motor común de los reels: arma la línea de tiempo GSAP a partir de window.EP (voz + palabras)
// y de window.buildEpisode (escenas del episodio). Sirve igual para 9:16 y 16:9.
// Cada HTML crea y registra la línea de tiempo paused, y la pasa aquí.

// Cada tema decora el fondo y define cómo entran y se resaltan los subtítulos.
const THEMES = {
  papel({ tl, rng, DUR, STOP_FPS, grain }) {
    // Grano de película que también "hierve"
    const rg = rng(7);
    for (let t = 0; t < DUR; t += 1 / STOP_FPS) {
      tl.set(grain, { x: Math.round((rg() - 0.5) * 120), y: Math.round((rg() - 0.5) * 120) }, t);
    }
    return {
      wordsPerGroup: 3,
      capClass: "cap-papel",
      captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.12, ease: "back.out(3)" }, t),
      wordOn: { color: "#ffe600", scale: 1.06 },
      wordOff: { color: "#ffffff", scale: 1 },
    };
  },

  blueprint({ tl, rng, DUR, S, seg, bg, grain, tag, stage }) {
    const root = stage.parentNode;
    grain.style.display = "none";
    document.getElementById("vignette").style.display = "none";
    bg.style.background = "radial-gradient(ellipse at 50% 35%, #0d2350 0%, #061230 45%, #030919 100%)";
    tag.className = "bp-tag";

    const add = (cls, html = "") => {
      const el = document.createElement("div");
      el.className = cls;
      el.innerHTML = html;
      root.insertBefore(el, stage);
      return el;
    };
    // Cuadrícula técnica que se desliza despacio
    const grid = add("bp-grid");
    tl.fromTo(grid, { y: 0 }, { y: 200, duration: DUR, ease: "none" }, 0);
    // Línea de escaneo cada 5 s
    const scan = add("bp-scan");
    for (let t = 0; t < DUR; t += 5) tl.fromTo(scan, { yPercent: -10 }, { yPercent: 110, duration: 2.2, ease: "power1.inOut" }, t);
    // Partículas que suben
    const r = rng(17);
    const parts = add("bp-particles");
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("i");
      p.style.left = `${r() * 100}%`;
      p.style.top = `${r() * 100}%`;
      p.style.opacity = (0.25 + r() * 0.5).toFixed(2);
      const s = 3 + r() * 5;
      p.style.width = p.style.height = `${s}px`;
      parts.appendChild(p);
      tl.fromTo(p, { y: 0 }, { y: -(150 + r() * 350), duration: DUR, ease: "none" }, 0);
    }
    // Marco HUD y cronómetro
    add("bp-corners", "<b></b><b></b><b></b><b></b>");
    const tc = add("bp-tc");
    for (let t = 0; t < DUR; t += 1 / 6) {
      const s = t.toFixed(1).padStart(4, "0");
      tl.set(tc, { innerText: `REC ● T+00:${s}` }, t);
    }
    // Barrido de luz en cada cambio de escena
    const wipe = document.createElement("div");
    wipe.className = "bp-wipe";
    root.appendChild(wipe);
    seg.forEach((_, i) => {
      if (i === 0) return;
      tl.fromTo(wipe, { xPercent: -110, autoAlpha: 1 }, { xPercent: 150, duration: 0.45, ease: "power2.inOut" }, S(i) - 0.2);
      tl.set(wipe, { autoAlpha: 0 }, S(i) + 0.25);
    });

    return {
      wordsPerGroup: 4,
      capClass: "cap-bp",
      captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "expo.out" }, t),
      wordOn: { color: "#ffffff", textShadow: "0 0 18px rgba(77,232,255,0.9)" },
      wordOff: { color: "rgba(214,236,255,0.55)", textShadow: "0 0 0 rgba(77,232,255,0)" },
    };
  },
};

// Tema EDITORIAL: revista suiza. Fondo claro, tinta negra, rojo de acento, cortes secos.
THEMES.editorial = function ({ tl, DUR, S, seg, bg, grain, tag, stage }) {
  const root = stage.parentNode;
  bg.style.background = "#f1ede4";
  grain.style.opacity = "0.5";
  document.getElementById("vignette").style.display = "none";
  tag.className = "ed-tag";

  const add = (cls, html = "", before = stage) => {
    const el = document.createElement("div");
    el.className = cls;
    el.innerHTML = html;
    root.insertBefore(el, before);
    return el;
  };
  add("ed-rules", "<i></i><i></i>");
  // Contador de escena "01 / 08"
  const counter = add("ed-counter");
  const total = String(seg.length).padStart(2, "0");
  seg.forEach((_, i) => tl.set(counter, { innerText: `${String(i + 1).padStart(2, "0")} / ${total}` }, i === 0 ? 0 : S(i)));
  // Barra de progreso del video
  const progress = add("ed-progress", "<i></i>");
  tl.fromTo(progress.firstChild, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);
  // Bloque rojo que barre la pantalla en cada cambio de escena
  const block = document.createElement("div");
  block.className = "ed-block";
  root.appendChild(block);
  seg.forEach((_, i) => {
    if (i === 0) return;
    tl.fromTo(block, { yPercent: 100, autoAlpha: 1 }, { yPercent: -100, duration: 0.5, ease: "power4.inOut" }, S(i) - 0.25);
    tl.set(block, { autoAlpha: 0 }, S(i) + 0.25);
  });

  return {
    wordsPerGroup: 3,
    capClass: "cap-ed",
    captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power4.out" }, t),
    wordOn: { backgroundColor: "#d42a12", color: "#ffffff" },
    wordOff: { backgroundColor: "rgba(212,42,18,0)", color: "#111111" },
  };
};

// Tema TERMINAL: monitor CRT de fósforo verde, texto que se escribe, cortes con parpadeo.
THEMES.terminal = function ({ tl, rng, DUR, S, seg, STOP_FPS, bg, grain, tag, stage }) {
  const root = stage.parentNode;
  bg.style.background = "radial-gradient(ellipse at 50% 45%, #06210f 0%, #020b05 60%, #000 100%)";
  grain.style.opacity = "0.35";
  tag.className = "term-tag";

  const add = (cls, html = "") => {
    const el = document.createElement("div");
    el.className = cls;
    el.innerHTML = html;
    root.appendChild(el);
    return el;
  };
  // Prompt fijo arriba con cursor que parpadea
  const prompt = document.createElement("div");
  prompt.className = "term-prompt";
  prompt.innerHTML = 'yo@estudio:~/reels$ <span class="term-cursor">█</span>';
  root.insertBefore(prompt, stage);
  const cursor = prompt.querySelector(".term-cursor");
  for (let t = 0; t < DUR; t += 0.5) tl.set(cursor, { autoAlpha: Math.round(t * 2) % 2 ? 0 : 1 }, t);
  // Líneas de barrido, curvatura y parpadeo del CRT
  add("term-scanlines");
  const flicker = add("term-flicker");
  const r = rng(29);
  for (let t = 0; t < DUR; t += 1 / STOP_FPS) tl.set(flicker, { opacity: 0.03 + r() * 0.06 }, t);
  add("term-glass");
  // Corte entre escenas: destello y banda que rueda, como un monitor que pierde la señal
  const flash = add("term-flash");
  const roll = add("term-roll");
  seg.forEach((_, i) => {
    if (i === 0) return;
    tl.fromTo(flash, { autoAlpha: 0.5 }, { autoAlpha: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, S(i) - 0.04);
    tl.fromTo(roll, { yPercent: -100, autoAlpha: 1 }, { yPercent: 400, duration: 0.35, ease: "none" }, S(i) - 0.1);
    tl.set(roll, { autoAlpha: 0 }, S(i) + 0.25);
  });

  return {
    wordsPerGroup: 4,
    capClass: "cap-term",
    captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, t),
    wordOn: { backgroundColor: "#33ff66", color: "#021a0a" },
    wordOff: { backgroundColor: "rgba(51,255,102,0)", color: "#33ff66" },
  };
};

// Tema DOCUMENTAL: grafito cálido, un solo acento por serie, tipografía sobria y un lienzo
// continuo (doc.world) que recorre una cámara en vez de cortar entre escenas.
const DOC_ACCENTS = { "FALLAS TECH": "#e2552f", "IA HOY": "#e8a33d", FUTURO: "#7d9bf0" };
THEMES.documental = function ({ tl, DUR, bg, grain, tag, stage }) {
  const root = stage.parentNode;
  root.classList.add("theme-doc");
  const series = Object.keys(DOC_ACCENTS).find((k) => (window.EPISODE_TAG || "").includes(k));
  root.style.setProperty("--doc-accent", window.EPISODE_ACCENT || DOC_ACCENTS[series] || "#e2552f");
  bg.style.background = "radial-gradient(ellipse 120% 80% at 50% 28%, #1c1b18 0%, #131311 58%, #0e0e0c 100%)";
  grain.style.opacity = "0.06";
  document.getElementById("vignette").style.opacity = "0.6";
  tag.className = "doc-tag";

  // Barra de progreso fina abajo
  const progress = document.createElement("div");
  progress.className = "doc-progress";
  progress.innerHTML = "<i></i>";
  root.appendChild(progress);
  tl.fromTo(progress.firstChild, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);

  // Lienzo continuo: todo lo que se coloca aquí comparte la misma cámara
  const world = document.createElement("div");
  world.className = "doc-world";
  // Lo que queda fuera de cuadro o se cruza durante un movimiento de cámara es intencional
  world.setAttribute("data-layout-allow-overflow", "");
  world.setAttribute("data-layout-allow-overlap", "");
  stage.appendChild(world);
  // Nada del lienzo asoma por encima del escenario (zona de la etiqueta); a los lados sí, para 16:9
  stage.style.clipPath = "inset(0 -4000px -4000px -4000px)";

  // Lleva el punto (x, y) del lienzo a la posición (sx, sy) del escenario con zoom z
  function cam(x, y, z, t, dur = 1.4, ease = "power3.inOut", sx = 540, sy = 600) {
    const v = { x: sx - x * z, y: sy - y * z, scale: z };
    if (dur === 0) tl.set(world, v, t);
    else tl.to(world, { ...v, duration: dur, ease }, t);
  }

  // Cada línea (.doc-ln > span) sube despacio desde detrás de una máscara
  function up(el, t, stagger = 0.12, dur = 1) {
    el.querySelectorAll(".doc-ln > span").forEach((s, i) =>
      tl.fromTo(s, { yPercent: 105 }, { yPercent: 0, duration: dur, ease: "expo.out" }, t + i * stagger));
  }

  // Aparece con un leve ascenso, sin rebote
  function show(el, t, dur = 0.8, dist = 24) {
    tl.fromTo(el, { autoAlpha: 0, y: dist }, { autoAlpha: 1, y: 0, duration: dur, ease: "power3.out" }, t);
  }

  return {
    wordsPerGroup: 6,
    capClass: "cap-doc",
    captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, t),
    wordOn: { color: "#ecebe6" },
    wordOff: { color: "rgba(236, 235, 230, 0.38)" },
    api: { world, cam, up, show },
  };
};

// Tema PIZARRA: pizarrón verde, diagramas que se dibujan con tiza, borrador entre escenas y letra a mano.
THEMES.pizarra = function ({ tl, rng, DUR, S, seg, bg, grain, tag, stage }) {
  const root = stage.parentNode;
  root.classList.add("theme-pz");
  bg.style.background = "radial-gradient(ellipse 120% 90% at 50% 40%, #2d443b 0%, #263b33 50%, #1b2a24 100%)";
  grain.style.opacity = "0.2";
  document.getElementById("vignette").style.opacity = "0.5";
  tag.className = "pz-tag";

  // Filtros de tiza: bordes temblorosos (deterministas, sin animación)
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.style.position = "absolute";
  defs.innerHTML = `
    <filter id="pz-chalk" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="9" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.45" result="holes"/>
      <feComposite in="d" in2="holes" operator="in"/>
    </filter>
    <filter id="pz-chalk-soft" x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 1.3" result="holes"/>
      <feComposite in="SourceGraphic" in2="holes" operator="in"/>
    </filter>`;
  root.appendChild(defs);

  // Manchas de borrador viejas en el pizarrón y marco de madera
  const sm = document.createElement("div");
  sm.className = "pz-smudges";
  const r = rng(41);
  for (let i = 0; i < 7; i++) {
    const b = document.createElement("i");
    b.style.cssText = `left:${(r() * 90).toFixed(1)}%;top:${(r() * 90).toFixed(1)}%;width:${300 + r() * 400}px;height:${120 + r() * 160}px;transform:rotate(${(r() - 0.5) * 30}deg)`;
    sm.appendChild(b);
  }
  root.insertBefore(sm, stage);
  const frame = document.createElement("div");
  frame.className = "pz-frame";
  root.appendChild(frame);

  // Borrador que limpia el pizarrón en cada cambio de escena
  const eraser = document.createElement("div");
  eraser.className = "pz-eraser";
  eraser.setAttribute("data-layout-allow-overflow", "");
  eraser.setAttribute("data-layout-allow-occlusion", "");
  root.insertBefore(eraser, stage.nextSibling);
  seg.forEach((_, i) => {
    if (i === 0) return;
    tl.fromTo(eraser, { xPercent: -110, autoAlpha: 1 }, { xPercent: 150, duration: 0.5, ease: "power2.inOut", immediateRender: false }, S(i) - 0.25);
    tl.set(eraser, { autoAlpha: 0 }, S(i) + 0.26);
  });

  const SHAPES = "path,line,rect,circle,ellipse,polyline,polygon";
  // Dibuja con tiza los trazos de un elemento (o lista), uno tras otro. Devuelve cuándo termina.
  function chalk(nodes, t, dur = 0.6, gap = 0.12) {
    const list = nodes instanceof Element ? (nodes.matches(SHAPES) ? [nodes] : [...nodes.querySelectorAll(SHAPES)]) : [...nodes];
    list.forEach((p, k) => {
      const len = Math.ceil(p.getTotalLength()) + 2;
      tl.fromTo(p, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: "power1.inOut" }, t + k * gap);
    });
    return t + (list.length - 1) * gap + dur;
  }
  // Texto que se escribe a mano: se descubre de izquierda a derecha
  function write(el, t, dur) {
    const d = dur ?? Math.min(1.2, Math.max(0.35, el.textContent.length * 0.05));
    tl.fromTo(el, { clipPath: "inset(-30% 100% -30% -2%)", autoAlpha: 1 }, { clipPath: "inset(-30% -2% -30% -2%)", duration: d, ease: "none" }, t);
    return t + d;
  }
  // Aparece de golpe con un pequeño asentamiento
  function appear(el, t, dur = 0.35) {
    tl.fromTo(el, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: dur, ease: "back.out(2)" }, t);
  }

  return {
    wordsPerGroup: 5,
    capClass: "cap-pz",
    captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, t),
    wordOn: { color: "#f6dd6b" },
    wordOff: { color: "rgba(241, 239, 230, 0.5)" },
    api: { chalk, write, appear },
  };
};

// Tema ISOMÉTRICO: fondo claro con cuadrícula isométrica, bloques 3D que caen con rebote,
// franja diagonal entre escenas y subtítulos en tarjeta con sombra dura.
const ISO_COLORS = {
  indigo: ["#8f8cf2", "#6461e0", "#4a47b8"], coral: ["#ff9a8a", "#ff6b57", "#d9503e"], teal: ["#5fd6b5", "#1fb48e", "#158c6e"],
  amber: ["#ffd27a", "#ffb020", "#d98e0b"], paper: ["#ffffff", "#e6e9f2", "#c9cede"], slate: ["#6b7590", "#46506a", "#2f3649"],
  ghost: ["#f7f8fc", "#eceef5", "#dde1ec"],
};
THEMES.isometrico = function ({ tl, DUR, S, seg, bg, grain, tag, stage }) {
  const root = stage.parentNode;
  root.classList.add("theme-iso");
  bg.style.background = "radial-gradient(ellipse 110% 80% at 50% 38%, #f6f7fb 0%, #eceff6 60%, #e1e5ef 100%)";
  grain.style.opacity = "0.05";
  document.getElementById("vignette").style.display = "none";
  tag.className = "iso-tag";

  const grid = document.createElement("div");
  grid.className = "iso-grid";
  root.insertBefore(grid, stage);
  tl.fromTo(grid, { x: 0, y: 0 }, { x: -104, y: 60, duration: DUR, ease: "none" }, 0);

  const progress = document.createElement("div");
  progress.className = "iso-progress";
  progress.innerHTML = "<i></i>";
  root.appendChild(progress);
  tl.fromTo(progress.firstChild, { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);

  // Franja diagonal que cruza la pantalla en cada cambio de escena
  const band = document.createElement("div");
  band.className = "iso-band";
  band.setAttribute("data-layout-allow-overflow", "");
  band.setAttribute("data-layout-allow-occlusion", "");
  root.insertBefore(band, stage.nextSibling);
  tl.set(band, { rotation: -30 }, 0);
  seg.forEach((_, i) => {
    if (i === 0) return;
    tl.fromTo(band, { yPercent: 130, autoAlpha: 1 }, { yPercent: -130, duration: 0.6, ease: "power2.inOut", immediateRender: false }, S(i) - 0.3);
    tl.set(band, { autoAlpha: 0 }, S(i) + 0.31);
  });

  // Espacio isométrico con origen (ox, oy) y u píxeles por unidad
  function space(ox = 540, oy = 600, u = 40) {
    const c = 0.8660254;
    const P = (x, y, z = 0) => [ox + (x - y) * u * c, oy + (x + y) * u * 0.5 - z * u];
    const pts = (a) => a.map((p) => P(...p).map((v) => v.toFixed(1)).join(",")).join(" ");
    // Prisma de (x, y, z) con ancho w (eje x), fondo d (eje y) y alto h
    function box(x, y, z, w, d, h, color = "paper", cls = "") {
      const [top, left, right] = ISO_COLORS[color] || color;
      return `<g class="${cls}">
        <polygon class="e" fill="${left}" points="${pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])}"/>
        <polygon class="e" fill="${right}" points="${pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])}"/>
        <polygon class="e" fill="${top}" points="${pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])}"/></g>`;
    }
    // Texto pegado a una cara: "top" (sobre la tapa), "left" (cara frontal izquierda)
    function label(face, x, y, z, text, size = 1, extra = "") {
      const [tx, ty] = P(x, y, z);
      const m = face === "top" ? `${c} 0.5 ${-c} 0.5` : `${c} 0.5 0 1`;
      return `<text transform="matrix(${m} ${tx.toFixed(1)} ${ty.toFixed(1)})" font-size="${(size * u).toFixed(1)}" ${extra}>${text}</text>`;
    }
    return { P, box, label, u };
  }
  // Cae desde arriba y rebota un poco
  function drop(el, t, dist = 180, dur = 0.6) {
    tl.fromTo(el, { y: -dist, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: dur, ease: "back.out(1.6)" }, t);
  }
  // Aparece creciendo desde su centro
  function grow(el, t, dur = 0.45) {
    tl.fromTo(el, { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1, duration: dur, ease: "back.out(2)" }, t);
  }
  // Sube con un leve deslizamiento
  function slide(el, t, dur = 0.5, dist = 40) {
    tl.fromTo(el, { y: dist, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: dur, ease: "power3.out" }, t);
  }

  return {
    wordsPerGroup: 4,
    capClass: "cap-iso",
    captionIn: (box, t) => tl.fromTo(box, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "back.out(2)" }, t),
    wordOn: { color: "#4a47b8" },
    wordOff: { color: "#5d6679" },
    api: { space, drop, grow, slide, colors: ISO_COLORS },
  };
};

window.buildReel = function (tl) {
  const EP = window.EP;
  const stage = document.getElementById("stage");
  const bg = document.getElementById("bg");
  const grain = document.getElementById("grain");
  const STOP_FPS = 12; // ritmo "stop motion": 12 dibujos por segundo

  const seg = EP.segments;
  const DUR = +document.getElementById("root").dataset.duration; // voz + cierre en pantalla
  const S = (i) => seg[i].start;
  const E = (i) => (i + 1 < seg.length ? seg[i + 1].start : DUR);

  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  // Momento en que se dice una palabra, buscando desde `from`
  function at(word, from = 0) {
    const w = EP.words.find((w) => w.start >= from - 0.05 && norm(w.text) === norm(word));
    return w ? w.start : from;
  }

  // Pseudoaleatorio con semilla (el render debe ser determinista)
  function rng(seed) {
    let s = (seed * 2654435761) >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // Temblor de stop motion: cambia posición y giro 12 veces por segundo
  function boil(el, t0, t1, amp = 6, rot = 1.5, seed = 1) {
    const r = rng(seed);
    for (let t = t0; t < t1; t += 1 / STOP_FPS) {
      tl.set(el, { x: (r() - 0.5) * amp, y: (r() - 0.5) * amp, rotation: (r() - 0.5) * rot * 2 }, t);
    }
  }

  // Glitch RGB intermitente sobre texto
  function glitch(el, t0, t1, seed = 1) {
    const r = rng(seed);
    for (let t = t0; t < t1; t += 1 / STOP_FPS) {
      const on = r() < 0.3;
      const dx = 4 + Math.round(r() * 10);
      tl.set(el, { textShadow: on ? `${dx}px 0 #ff2e4d, ${-dx}px 0 #00e5ff` : "0 0 0 rgba(0,0,0,0)" }, t);
    }
    tl.set(el, { textShadow: "0 0 0 rgba(0,0,0,0)" }, t1);
  }

  // Entrada a saltos, como un recorte puesto en cuadro
  function pop(el, t) {
    tl.fromTo(el, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "steps(3)" }, t);
  }

  // Texto que se escribe solo, carácter a carácter, al ritmo stop motion
  function typeText(el, text, t0, cps = 36) {
    const perTick = Math.max(1, Math.round(cps / STOP_FPS));
    tl.set(el, { innerText: "" }, t0);
    for (let n = perTick, t = t0 + 1 / STOP_FPS; n < text.length + perTick; n += perTick, t += 1 / STOP_FPS) {
      tl.set(el, { innerText: text.slice(0, n) }, t);
    }
    return t0 + Math.ceil(text.length / perTick) / STOP_FPS; // momento en que termina
  }

  // --- Movimiento fluido (tema blueprint) ---

  // Sube y aparece con frenado suave
  function rise(el, t, dur = 0.7, dist = 50) {
    tl.fromTo(el, { autoAlpha: 0, y: dist }, { autoAlpha: 1, y: 0, duration: dur, ease: "expo.out" }, t);
  }

  // Se descubre de izquierda a derecha con una máscara
  function reveal(el, t, dur = 0.8) {
    tl.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)", autoAlpha: 1 }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: "expo.inOut" }, t);
  }

  // Dibuja el trazo de un path/línea SVG
  function draw(path, t, dur = 1) {
    const len = path.getTotalLength();
    tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, t);
  }

  // Contador numérico
  function countUp(el, from, to, t, dur = 1.2, fmt = (v) => Math.round(v).toLocaleString("en-US")) {
    const o = { v: from };
    el.textContent = fmt(from);
    tl.to(o, { v: to, duration: dur, ease: "expo.out", onUpdate: () => { el.textContent = fmt(o.v); } }, t);
  }

  // --- Movimiento editorial ---

  // Entra de golpe desde grande
  function slam(el, t, from = 1.8) {
    tl.fromTo(el, { autoAlpha: 0, scale: from }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power4.out" }, t);
  }

  // Cada línea (.ln > span) sube desde detrás de una máscara
  function lines(el, t, stagger = 0.09) {
    el.querySelectorAll(".ln > span").forEach((s, i) =>
      tl.fromTo(s, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power4.out" }, t + i * stagger));
  }

  // Tacha un elemento con su barra .strike-bar
  function strike(el, t) {
    tl.fromTo(el.querySelector(".strike-bar"), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power4.inOut" }, t);
  }

  // --- Terminal ---

  // Barra de progreso en texto: [██████░░░░] 60%
  function asciiBar(el, t, dur = 1.2, width = 16, label = (p) => `${p}%`) {
    const steps = Math.max(1, Math.round(dur * STOP_FPS));
    for (let k = 0; k <= steps; k++) {
      const p = k / steps;
      const n = Math.round(p * width);
      tl.set(el, { innerText: `[${"█".repeat(n)}${"░".repeat(width - n)}] ${label(Math.round(p * 100))}` }, t + (k * dur) / steps);
    }
  }

  // Ecualizador de barras verticales (onda de voz) que se mueve entre t0 y t1
  function equalizer(el, t0, t1, bars = 28, seed = 5) {
    const r = rng(seed);
    const cols = Array.from({ length: bars }, () => {
      const b = document.createElement("i");
      el.appendChild(b);
      return b;
    });
    for (let t = t0; t < t1; t += 1 / STOP_FPS) {
      cols.forEach((b, i) => {
        const env = Math.sin((i / (bars - 1)) * Math.PI);
        tl.set(b, { scaleY: 0.08 + env * (0.25 + r() * 0.75) }, t);
      });
    }
    cols.forEach((b) => tl.set(b, { scaleY: 0.08 }, t1));
  }

  function setBg(color, t) {
    tl.set(bg, { backgroundColor: color }, t);
  }

  function scene(i, html) {
    const el = document.createElement("section");
    el.className = "scene" + (i === 0 ? " first" : "");
    el.innerHTML = html;
    stage.appendChild(el);
    if (i > 0) tl.set(el, { autoAlpha: 1 }, S(i));
    tl.set(el, { autoAlpha: 0 }, E(i));
    return el;
  }

  // Etiqueta de serie (FALLAS TECH, IA HOY, FUTURO) definida por el episodio
  const tag = document.getElementById("tag");
  if (window.EPISODE_TAG) tag.textContent = window.EPISODE_TAG;
  if (window.EPISODE_TAG_COLOR) tag.style.background = window.EPISODE_TAG_COLOR;

  // Tema visual: "papel" (stop motion, recortes, grano) o "blueprint" (HUD futurista, fluido)
  const THEME = window.EPISODE_THEME || "papel";
  const theme = (THEMES[THEME] || THEMES.papel)({ tl, rng, DUR, S, seg, STOP_FPS, bg, grain, tag, stage });

  window.buildEpisode({ tl, scene, at, S, E, rng, boil, glitch, pop, setBg, typeText, rise, reveal, draw, countUp, slam, lines, strike, asciiBar, equalizer, doc: theme.api, pz: theme.api, iso: theme.api });

  // Palabras clave del episodio: el tema las marca en los subtítulos (clase .kw)
  const KW = new Set((window.EPISODE_KEYWORDS || []).map(norm));

  // Subtítulos: grupos cortos de palabras, resaltando la que suena
  const caps = document.getElementById("captions");
  const groups = [];
  let cur = [];
  EP.words.forEach((w, i) => {
    cur.push(w);
    const next = EP.words[i + 1];
    if (cur.length >= theme.wordsPerGroup || /[.,:;?!]$/.test(w.text) || !next || next.start - w.end > 0.3) {
      groups.push(cur);
      cur = [];
    }
  });
  groups.forEach((g, gi) => {
    const box = document.createElement("div");
    box.className = "cap " + theme.capClass;
    const line = document.createElement("div");
    line.className = "cap-line";
    box.appendChild(line);
    caps.appendChild(box);
    const spans = g.map((w) => {
      const s = document.createElement("span");
      s.textContent = w.text.replace(/[.,:;]+$/, "");
      if (KW.has(norm(s.textContent))) s.classList.add("kw");
      line.appendChild(s);
      return s;
    });
    const start = g[0].start;
    const end = gi + 1 < groups.length ? Math.min(groups[gi + 1][0].start, g[g.length - 1].end + 0.6) : DUR;
    theme.captionIn(box, start);
    tl.set(box, { autoAlpha: 0 }, end);
    g.forEach((w, wi) => {
      tl.set(spans[wi], theme.wordOn, w.start);
      if (wi + 1 < g.length) tl.set(spans[wi], theme.wordOff, g[wi + 1].start);
    });
  });

  tl.seek(0);
  return tl;
};
