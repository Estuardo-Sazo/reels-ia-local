// Episodio 011: ¿Cómo se guardan los datos en el disco? (serie de bases de datos; no se menciona "curso" ni "clase")
// Tema ISOMÉTRICO: bloques 3D para el disco, las páginas, las filas y los bytes. Voz clonada (assets/voces/yo-curso.wav).
window.EPISODE_TAG = "BASES DE DATOS";
window.EPISODE_THEME = "isometrico";
window.buildEpisode = function ({ tl, scene, at, S, E, countUp, iso }) {
  const { space, drop, grow, slide } = iso;
  const q = (root, sel) => root.querySelector(sel);
  const qa = (root, sel) => [...root.querySelectorAll(sel)];
  const svg = (inner) => `<svg class="iso-svg" width="1080" height="1200" viewBox="0 0 1080 1200">${inner}</svg>`;
  const T = (cls, html, x, y, extra = "") => `<div class="iso-t ${cls}" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
  const C = (cls, html, y) => `<div class="iso-row" style="top:${y}px"><div class="iso-t ${cls}">${html}</div></div>`;
  // Etiqueta tipo ficha centrada en (x, y)
  const chip = (cls, html, x, y) => `<div class="iso-chip ${cls}" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%)">${html}</div>`;
  const mk = (i, html) => {
    const s = scene(i, html);
    s.classList.add("iso-scene");
    return s;
  };
  // Las fichas usan translate(-50%,-50%): se animan con autoAlpha/scale para no pisar ese transform
  const show = (el, t, dur = 0.35) => tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: "power2.out" }, t);
  const arrowPath = (x1, y1, x2, y2, cls = "ln") => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 22;
    return `<path class="${cls}" d="M${x1} ${y1} L${x2} ${y2} M${(x2 - h * Math.cos(a - 0.5)).toFixed(1)} ${(y2 - h * Math.sin(a - 0.5)).toFixed(1)} L${x2} ${y2} L${(x2 - h * Math.cos(a + 0.5)).toFixed(1)} ${(y2 - h * Math.sin(a + 0.5)).toFixed(1)}"/>`;
  };
  const cross = (cx, cy, r, cls = "") => `<g class="${cls}"><path d="M${cx - r} ${cy - r} L${cx + r} ${cy + r} M${cx + r} ${cy - r} L${cx - r} ${cy + r}" style="fill:none;stroke:#e0533f;stroke-width:22;stroke-linecap:round"/></g>`;
  // Mueve un grupo SVG a lo largo de los ejes isométricos (dx, dy, dz en unidades)
  const isoMove = (sp, dx, dy, dz = 0) => {
    const [x0, y0] = sp.P(0, 0, 0), [x1, y1] = sp.P(dx, dy, dz);
    return { x: x1 - x0, y: y1 - y0 };
  };

  // ===== 0 · No es una hoja de cálculo: son páginas llenas de bytes =====
  {
    const sp = space(540, 470, 52);
    let lines = "";
    for (let k = 1; k < 6; k++) {
      const a = sp.P(-3 + k, -3, 0.25), b = sp.P(-3 + k, 3, 0.25), c2 = sp.P(-3, -3 + k, 0.25), d = sp.P(3, -3 + k, 0.25);
      lines += `<path class="ln" style="stroke-width:2;opacity:.45" d="M${a} L${b} M${c2} L${d}"/>`;
    }
    const pages = [0, 1, 2, 3].map((k) => sp.box(-3, -3, k * 0.85, 6, 6, 0.6, "paper", `pg pg${k}`)).join("");
    const bytes = sp.label("top", -2.5, -2.1, 3.15, "4A 6E 61 00 07 …", 0.62, 'class="mono" fill="#4a47b8"');
    const s = mk(0, svg(`<g class="sheet">${sp.box(-3, -3, 0, 6, 6, 0.25, "ghost")}${lines}</g>${cross(540, 470, 120, "x")}
      <g class="stack">${pages}<g class="by">${bytes}</g></g>`) +
      chip("hcal", "hoja de cálculo", 540, 190) + chip("indigo pgs", "páginas", 300, 790) + chip("amber byt", "bytes", 790, 790));
    const t0 = at("tabla", 0);
    drop(q(s, ".sheet"), t0 - 0.1);
    show(q(s, ".hcal"), at("hoja", 0) - 0.2);
    grow(q(s, ".x"), at("hoja", 0));
    const td = at("disco", 0);
    tl.to([q(s, ".sheet"), q(s, ".x"), q(s, ".hcal")], { autoAlpha: 0, duration: 0.25 }, td - 0.4);
    qa(s, ".pg").forEach((g, k) => drop(g, td - 0.2 + k * 0.12, 220, 0.5));
    show(q(s, ".pgs"), at("paginas", td) - 0.1);
    tl.fromTo(q(s, ".by"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at("paginas", td));
    show(q(s, ".byt"), at("bytes", td) - 0.1);
  }

  // ===== 1 · Abramos el disco =====
  {
    const sp = space(540, 700, 50);
    const inner = [0, 1, 2].map((k) => sp.box(-2.6, -1.8, 1.25 + k * 0.45, 5.2, 3.6, 0.32, "paper", `in in${k}`)).join("");
    const s = mk(1, C("iso-h", "Abramos el disco", 150) +
      svg(`<g class="base">${sp.box(-4, -3, 0, 8, 6, 1.2, "slate")}${sp.label("left", -3.4, 3, 0.35, "DISCO", 0.62, 'fill="#ffffff"')}</g>${inner}
        <g class="lid">${sp.box(-4, -3, 1.2, 8, 6, 0.35, "slate")}</g>`) +
      C("iso-m indigo q", "¿cómo se guardan tus datos?", 1010));
    slide(q(s, ".iso-h"), S(1));
    drop(q(s, ".base"), S(1) + 0.1);
    drop(q(s, ".lid"), S(1) + 0.25);
    const ta = at("abrir", S(1));
    tl.to(q(s, ".lid"), { y: -170, x: 170, rotation: 14, duration: 0.7, ease: "back.out(1.4)", transformOrigin: "50% 50%" }, ta);
    qa(s, ".in").forEach((g, k) => tl.fromTo(g, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: -k * 18, duration: 0.5, ease: "back.out(2)" }, ta + 0.25 + k * 0.12));
    slide(q(s, ".q"), at("guardan", S(1)) - 0.2);
  }

  // ===== 2 · El motor guarda en archivos, pero no como un texto línea por línea =====
  {
    const sp = space(540, 360, 46);
    const m = sp.P(-3.5, 2.5, 1.6), f = sp.P(3, 2.5, 1.6);
    const s = mk(2, svg(`<g class="mot">${sp.box(-6, 0, 0, 3, 3, 3, "amber")}${sp.label("left", -5.75, 3, 1.05, "MOTOR", 0.68)}</g>
        <g class="ar">${arrowPath(m[0] + 30, m[1] - 50, f[0] - 80, f[1] - 120)}</g>
        <g class="fil">${sp.box(2, -1, 0, 3, 3, 4.2, "paper")}${sp.label("left", 2.2, 2, 1.3, "archivo", 0.66)}</g>`) +
      `<div class="txt" style="left:200px;top:700px;width:680px;padding:28px 34px;background:#fff;border:3px solid #1d2433;border-radius:18px;box-shadow:10px 10px 0 #1d2433">
        <div class="iso-mono" style="font-size:40px;line-height:1.6;color:#5d6679">Ana, Guatemala<br>Luis, México<br>Sofía, Guatemala</div></div>` +
      svg(cross(540, 830, 110, "x")) + chip("coral nt", "no como texto", 540, 640));
    drop(q(s, ".mot"), S(2) + 0.3);
    const ta = at("archivos", S(2));
    drop(q(s, ".fil"), ta - 0.5);
    tl.fromTo(q(s, ".ar"), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.4 }, ta - 0.2);
    const tt = at("texto", S(2));
    slide(q(s, ".txt"), at("pero", S(2)) - 0.4);
    show(q(s, ".nt"), at("pero", S(2)));
    grow(q(s, ".x"), at("linea", tt) - 0.1);
  }

  // ===== 3 · El archivo se divide en páginas del mismo tamaño =====
  {
    const sp = space(540, 560, 52);
    const parts = [0, 1, 2, 3].map((k) => sp.box(-6 + k * 3, -1, 0, 3, 2, 1.4, "paper", `pt pt${k}`)).join("");
    const s = mk(3, C("iso-m", "un archivo", 200) + svg(parts) +
      [0, 1, 2, 3].map((k) => { const [x, y] = sp.P(-4.5 + k * 3 + k * 0.7, 0, 1.4); return chip(`indigo lb lb${k}`, "página", x, y - 70); }).join("") +
      chip("amber eq", "mismo tamaño", 540, 900));
    slide(q(s, ".iso-m"), S(3));
    qa(s, ".pt").forEach((g, k) => drop(g, S(3) + 0.15 + k * 0.08, 140, 0.45));
    const tdv = Math.max(at("bloques", S(3)) - 0.2, S(3) + 0.9);
    qa(s, ".pt").forEach((g, k) => tl.to(g, { ...isoMove(sp, k * 0.7, 0), duration: 0.6, ease: "back.out(1.6)" }, tdv + 0.2));
    show(q(s, ".eq"), at("tamano", S(3)) - 0.2);
    qa(s, ".lb").forEach((c, k) => show(c, at("paginas", S(3)) - 0.15 + k * 0.08, 0.25));
  }

  // ===== 4 · Tamaño de página: PostgreSQL 8 KB, MySQL 16 KB, SQLite 4 KB =====
  {
    const sp = space(540, 900, 46);
    const cols = [["PostgreSQL", "8 KB", 2, "indigo", -6.5], ["MySQL", "16 KB", 4, "coral", -1], ["SQLite", "4 KB", 1, "teal", 4.5]];
    const s = mk(4, C("iso-m", "¿cuánto mide una página?", 120) +
      svg(cols.map(([, , h, c, x], k) => sp.box(x, 1, 0, 2.4, 2.4, h * 2.2, c, `col col${k}`)).join("")) +
      cols.map(([n, v, h, c, x], k) => { const [px, py] = sp.P(x + 1.2, 2.2, h * 2.2); return chip(`${c} nm${k}`, n, px, py - 150) + `<div class="iso-t iso-m vl${k}" style="left:${px - 90}px;top:${py - 100}px;width:180px;text-align:center">${v}</div>`; }).join(""));
    slide(q(s, ".iso-m"), S(4));
    ["postgresql", "mysql", "sqlite"].forEach((w, k) => {
      const t = at(w, S(4));
      tl.fromTo(q(s, `.col${k}`), { scaleY: 0, autoAlpha: 1, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.6, ease: "back.out(1.4)" }, t - 0.2);
      show(q(s, `.nm${k}`), t - 0.1);
      show(q(s, `.vl${k}`), t + 0.35);
    });
  }

  // ===== 5 · El disco no lee un dato suelto: siempre un bloque completo =====
  {
    const sp = space(540, 560, 54);
    const cells = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) cells.push([i, j]);
    cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const cube = (i, j, col, cls) => sp.box(-4 + i + 0.1, -2 + j + 0.1, 0.5, 0.8, 0.8, 0.8, col, cls);
    const base = cells.map(([i, j]) => cube(i, j, "paper", "c")).join("");
    const block = cells.filter(([i]) => i < 4).map(([i, j]) => cube(i, j, i === 1 && j === 2 ? "amber" : "indigo", "")).join("");
    const s = mk(5, C("iso-m", "¿Por qué páginas?", 150) +
      svg(`<g class="disk">${sp.box(-4.3, -2.3, 0, 8.6, 4.6, 0.5, "slate")}${base}</g>
        <g class="one">${cube(1, 2, "amber", "")}</g><g class="blk">${block}</g>`) +
      chip("amber c1", "1 dato", 330, 700) + chip("indigo c2", "lee el bloque completo", 540, 930));
    slide(q(s, ".iso-m"), S(5));
    drop(q(s, ".disk"), S(5) + 0.2, 120);
    const t1 = at("dato", S(5));
    tl.set(q(s, ".blk"), { autoAlpha: 0 }, 0);
    tl.fromTo(q(s, ".one"), { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: -40, duration: 0.4, ease: "back.out(2)" }, t1 - 0.2);
    show(q(s, ".c1"), t1);
    const tb = at("bloque", S(5));
    tl.set(q(s, ".one"), { autoAlpha: 0 }, tb - 0.1);
    tl.fromTo(q(s, ".blk"), { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: -60, duration: 0.5, ease: "back.out(1.6)" }, tb - 0.1);
    show(q(s, ".c2"), at("siempre", S(5)) - 0.1);
  }

  // ===== 6 · Una sola fila, pero se trae la página entera a la memoria =====
  {
    const sp = space(560, 560, 46);
    const page = (x, y, z) => sp.box(x, y, z, 4, 3, 0.4, "paper") +
      [0, 1, 2, 3].map((r) => sp.box(x + 0.3, y + 0.25 + r * 0.7, z + 0.4, 3.4, 0.5, 0.12, r === 2 ? "amber" : "ghost")).join("");
    const s = mk(6,
      svg(`<g class="disk">${sp.box(-6.5, 1.5, 0, 5, 4.5, 1.2, "slate")}${sp.label("left", -6, 6, 0.25, "DISCO", 0.72, 'fill="#ffffff"')}</g>
        <g class="mem">${sp.box(0.5, -5.5, 0, 5.5, 3.2, 0.8, "teal")}${sp.label("left", 0.8, -2.3, 0.12, "MEMORIA", 0.62, 'fill="#ffffff"')}</g>
        <g class="pg">${page(-6, 2.2, 1.2)}</g>`) +
      chip("amber fl", "1 fila", ...sp.P(-2.5, 8.5, -1)) + chip("indigo pe", "la página entera", ...sp.P(4, -1.5, -1.5)));
    drop(q(s, ".disk"), S(6));
    drop(q(s, ".mem"), S(6) + 0.15);
    drop(q(s, ".pg"), S(6) + 0.3, 120);
    show(q(s, ".fl"), at("fila", S(6)) - 0.2);
    const tt = at("traer", S(6));
    tl.to(q(s, ".pg"), { ...isoMove(sp, 6.8, -7.4, -0.4), duration: 1, ease: "power3.inOut" }, tt);
    show(q(s, ".pe"), at("entera", S(6)) - 0.1);
  }

  // ===== 7 · El disco es mucho más lento: importa cuántas páginas hay que leer =====
  {
    const lane = (y, cls, label, color) => `<div style="left:90px;top:${y}px;width:900px;height:120px;background:#fff;border:3px solid #1d2433;border-radius:20px;box-shadow:8px 8px 0 #1d2433"></div>
      <div class="iso-t iso-s" style="left:110px;top:${y - 56}px;color:#1d2433;font-weight:700">${label}</div>
      <div class="${cls}" style="left:120px;top:${y + 22}px;width:76px;height:76px;border-radius:14px;background:${color};border:3px solid #1d2433"></div>`;
    const s = mk(7, lane(330, "rm", "memoria", "#1fb48e") + lane(560, "rd", "disco", "#ff6b57") +
      C("iso-m imp", "lo que más importa:", 800) + C("iso-h indigo cp", "¿cuántas páginas?", 890));
    const t0 = S(7) + 0.3, tm = at("memoria", S(7));
    for (let k = 0; k < 5; k++) tl.fromTo(q(s, ".rm"), { x: 0 }, { x: 760, duration: 0.45, ease: "power1.in", immediateRender: k === 0 }, t0 + k * 0.6);
    tl.fromTo(q(s, ".rd"), { x: 0 }, { x: 760, duration: tm - t0 + 1.2, ease: "none" }, t0);
    const ti = at("importa", S(7));
    slide(q(s, ".imp"), ti - 0.3);
    slide(q(s, ".cp"), at("cuantas", S(7)) - 0.2);
  }

  // ===== 8–10 · Dentro de una página: encabezado, lista de filas, filas desde el final, espacio libre =====
  const ROWS = ["Ana · Guatemala", "Luis · México", "Sofía · Guatemala", "Carlos · Colombia"];
  const PX = 170, PY = 150, PW = 740, PH = 880;
  const rowTop = (k) => PY + PH - 30 - 76 - k * 86;
  const anatomy = (stage) => {
    const card = `<div class="card" style="left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;background:#fff;border:4px solid #1d2433;border-radius:22px;box-shadow:14px 14px 0 #1d2433"></div>`;
    const head = `<div class="head" style="left:${PX + 4}px;top:${PY + 4}px;width:${PW - 8}px;height:96px;border-radius:18px 18px 0 0;background:#4a47b8;display:flex;align-items:center;padding-left:34px">
      <span class="iso-t iso-m" style="color:#fff;position:relative">encabezado</span></div>`;
    const slots = [0, 1, 2, 3].map((k) => `<div class="slot slot${k}" style="left:${PX + 34 + k * 84}px;top:${PY + 124}px;width:64px;height:58px;border-radius:10px;background:#ffb020;border:3px solid #1d2433;display:flex;align-items:center;justify-content:center"><span class="iso-mono" style="font-size:30px;position:relative">${k + 1}</span></div>`).join("") +
      `<div class="iso-t iso-s sl" style="left:${PX + 34}px;top:${PY + 250}px">↑ dónde empieza cada fila</div>`;
    let arrows = "";
    for (let k = 0; k < 4; k++) {
      const sx = PX + 66 + k * 84, gx = PX + PW - 70 + k * 14, ry = rowTop(k) + 38;
      arrows += `<g class="pa pa${k}"><path class="ln" style="stroke-width:3;stroke:#c27c00" d="M${sx} ${PY + 184} V${PY + 206 + k * 8} H${gx} V${ry} H${PX + PW - 116}"/><path class="ln" style="stroke-width:3;stroke:#c27c00" d="M${PX + PW - 98} ${ry - 10} L${PX + PW - 116} ${ry} L${PX + PW - 98} ${ry + 10}"/></g>`;
    }
    const ghosts = [0, 1, 2, 3].map((k) => `<div class="ghost gh${k}" style="left:${PX + 30}px;top:${rowTop(k)}px;width:${PW - 160}px;height:76px;border-radius:12px;border:3px dashed #c9cede"></div>`).join("");
    const rows = ROWS.map((r, k) => `<div class="row row${k}" style="left:${PX + 30}px;top:${rowTop(k)}px;width:${PW - 160}px;height:76px;border-radius:12px;background:#eceef5;border:3px solid #1d2433;display:flex;align-items:center;padding-left:24px">
      <span class="iso-t iso-s" style="color:#1d2433;position:relative">${k + 1} · ${r}</span></div>`).join("");
    const free = `<div class="free" style="left:${PX + 30}px;top:${PY + 250}px;width:${PW - 160}px;height:${rowTop(3) - PY - 270}px;border-radius:14px;background:repeating-linear-gradient(135deg, rgba(31,180,142,.16) 0 14px, transparent 14px 28px);border:3px dashed #1fb48e;display:flex;align-items:center;justify-content:center">
      <span class="iso-t iso-m teal" style="position:relative">espacio libre</span></div>`;
    return { card, head, slots, arrows: svg(arrows), ghosts, rows, free };
  };
  {
    const a = anatomy();
    const s = mk(8, a.card + a.head + C("iso-s pgl", "una página", 1060));
    grow(q(s, ".card"), S(8) + 0.2, 0.5);
    show(q(s, ".pgl"), S(8) + 0.5);
    const th = at("encabezado", S(8));
    tl.fromTo(q(s, ".head"), { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.45, ease: "back.out(1.6)" }, th - 0.2);
  }
  {
    const a = anatomy();
    const s = mk(9, a.card + a.head + a.ghosts + a.slots + a.arrows);
    const tl0 = at("lista", S(9));
    qa(s, ".slot").forEach((el, k) => grow(el, tl0 - 0.1 + k * 0.1, 0.35));
    show(q(s, ".sl"), tl0 + 0.3);
    qa(s, ".ghost").forEach((el) => show(el, at("donde", S(9)) - 0.2, 0.3));
    qa(s, ".pa").forEach((el, k) => tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at("fila", S(9)) - 0.3 + k * 0.15));
  }
  {
    const a = anatomy();
    const s = mk(10, a.card + a.head + a.slots + a.arrows + a.free + a.rows);
    tl.set(q(s, ".sl"), { autoAlpha: 0 }, 0);
    tl.set(q(s, ".free"), { autoAlpha: 0 }, 0);
    const tf = at("final", S(10));
    qa(s, ".row").slice(0, 3).forEach((el, k) => drop(el, tf - 0.3 + k * 0.35, 120, 0.45));
    tl.set(q(s, ".row3"), { autoAlpha: 0 }, 0);
    show(q(s, ".free"), at("libre", S(10)) - 0.5, 0.4);
    drop(q(s, ".row3"), at("nuevas", S(10)) - 0.3, 160, 0.5);
  }

  // ===== 11 · Cada fila son solo bytes: entero = 4 bytes; texto = largo + letras =====
  {
    const sp = space(560, 640, 64);
    const cubes = [["00", "indigo"], ["00", "indigo"], ["00", "indigo"], ["07", "indigo"], null, ["03", "amber"], ["41", "coral"], ["6E", "coral"], ["61", "coral"]];
    let g = "";
    cubes.forEach((c, k) => {
      if (!c) return;
      const x = -5 + k * 1.05;
      g += `<g class="cb cb${k}">${sp.box(x, 0, 0, 0.9, 0.9, 0.9, c[1])}${sp.label("top", x + 0.1, 0.7, 0.9, c[0], 0.45, 'class="mono"')}</g>`;
    });
    const at3 = (k) => sp.P(-5 + k * 1.05 + 0.45, 0.9, 0);
    const [ix, iy] = at3(1.5), [lx, ly] = at3(5), [tx, ty] = at3(7);
    const s = mk(11, C("iso-m", "una fila = solo bytes", 150) +
      `<div class="rowc" style="left:210px;top:290px;width:660px;height:90px;border-radius:14px;background:#eceef5;border:3px solid #1d2433;box-shadow:8px 8px 0 #1d2433;display:flex;align-items:center;gap:40px;padding-left:30px">
        <span class="iso-t iso-m indigo" style="position:relative">7</span><span class="iso-t iso-m coral" style="position:relative">Ana</span></div>` +
      svg(g) + chip("indigo ci", "entero = 4 bytes", ix, iy + 90) + chip("amber cl", "largo: 3", lx, ly + 110) +
      chip("coral ct", "A · n · a", tx, ty + 200));
    slide(q(s, ".iso-m"), S(11));
    slide(q(s, ".rowc"), S(11) + 0.3);
    const tb = at("bytes", S(11));
    const ti = at("entero", S(11)), tt = at("texto", S(11));
    [0, 1, 2, 3].forEach((k) => drop(q(s, `.cb${k}`), ti - 0.2 + k * 0.1, 140, 0.45));
    show(q(s, ".ci"), at("cuatro", S(11)) - 0.1);
    tl.to(q(s, ".rowc"), { autoAlpha: 0.35, duration: 0.3 }, tb);
    drop(q(s, ".cb5"), at("mide", tt) - 0.3, 140, 0.45);
    show(q(s, ".cl"), at("mide", tt));
    [6, 7, 8].forEach((k, n) => drop(q(s, `.cb${k}`), at("luego", tt) - 0.5 + n * 0.12, 140, 0.45));
    show(q(s, ".ct"), at("luego", tt) - 0.2);
  }

  // ===== 12 · La página se llena, el motor usa otra: millones de páginas =====
  {
    const sp = space(540, 500, 34);
    const slabs = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) slabs.push([i, j]);
    slabs.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const g = slabs.map(([i, j], k) => sp.box(-8 + i * 4.2, -8 + j * 4.2, 0, 3.6, 3.6, 0.6, k === 0 ? "amber" : "paper", `sl sl${k}`)).join("");
    const s = mk(12, svg(`<g class="wall">${g}</g>`) + chip("amber fu", "página llena", 540, 240) + chip("indigo ot", "otra página", 540, 240) +
      C("iso-h indigo mil", "millones", 900) + C("iso-m mil2", "de páginas", 1010));
    const t0 = S(12);
    drop(q(s, ".sl0"), t0 + 0.1, 160, 0.45);
    show(q(s, ".fu"), t0 + 0.3);
    const to = at("otra", t0);
    tl.to(q(s, ".fu"), { autoAlpha: 0, duration: 0.15 }, to - 0.2);
    show(q(s, ".ot"), to - 0.1);
    qa(s, ".sl").slice(1).forEach((el, k) => drop(el, to - 0.1 + k * 0.12, 160, 0.4));
    const tm = at("millones", t0);
    tl.to(q(s, ".wall"), { scale: 0.75, duration: 0.6, ease: "power3.inOut", transformOrigin: "50% 50%" }, tm - 0.3);
    slide(q(s, ".mil"), tm - 0.2);
    slide(q(s, ".mil2"), tm + 0.1);
  }

  // ===== 13 · El motor guarda en memoria las páginas que más usa =====
  {
    const sp = space(560, 640, 34);
    let stack = "";
    for (let k = 0; k < 6; k++) stack += sp.box(-8, 2, k * 0.55, 5, 4, 0.42, "paper");
    const hot = [0, 1, 2].map((k) => `<g class="hp hp${k}">${sp.box(-8, 2, 3.4 + k * 0.55, 5, 4, 0.42, "amber")}</g>`).join("");
    const s = mk(13, C("iso-m", "para no ir al disco a cada rato…", 140) +
      svg(`<g class="disk">${sp.box(-8.4, 1.6, -1, 5.8, 4.8, 1, "slate")}${stack}</g>
        <g class="mem">${sp.box(2, -7, 0, 6.5, 5, 0.8, "teal")}${sp.label("left", 2.4, -2, 0.12, "MEMORIA", 0.7, 'fill="#ffffff"')}</g>${hot}`) +
      chip("amber mu", "las que más usa", 800, 330));
    slide(q(s, ".iso-m"), S(13));
    drop(q(s, ".disk"), S(13) + 0.1);
    drop(q(s, ".mem"), S(13) + 0.2);
    qa(s, ".hp").forEach((el) => tl.set(el, { autoAlpha: 0 }, 0));
    const tg = at("memoria", S(13));
    qa(s, ".hp").forEach((el, k) => {
      tl.set(el, { autoAlpha: 1 }, tg - 0.3 + k * 0.2);
      tl.fromTo(el, { x: 0, y: 0 }, { ...isoMove(sp, 10.5, -8.5, -2.6 - k * 0.5 + k * 0.5), duration: 0.8, ease: "power3.inOut", immediateRender: false }, tg - 0.3 + k * 0.2);
    });
    show(q(s, ".mu"), tg + 0.4);
  }

  // ===== 14 · Borrar una fila: se marca como borrada y su espacio se reutiliza =====
  {
    const rows = ["Ana · Guatemala", "Luis · México", "Sofía · Guatemala", "Carlos · Colombia"];
    const s = mk(14, C("iso-m", "¿y si borras una fila?", 140) +
      `<div class="card" style="left:170px;top:260px;width:740px;height:520px;background:#fff;border:4px solid #1d2433;border-radius:22px;box-shadow:14px 14px 0 #1d2433"></div>` +
      rows.map((r, k) => `<div class="r r${k}" style="left:210px;top:${300 + k * 112}px;width:660px;height:88px;border-radius:12px;background:#eceef5;border:3px solid #1d2433;display:flex;align-items:center;padding-left:26px">
        <span class="iso-t iso-s" style="color:#1d2433;position:relative">${r}</span></div>`).join("") +
      `<div class="del" style="left:210px;top:412px;width:660px;height:88px;border-radius:12px;background:repeating-linear-gradient(135deg, rgba(224,83,63,.28) 0 12px, rgba(224,83,63,.08) 12px 24px);border:3px solid #e0533f"></div>
       <div class="strike" style="left:236px;top:454px;width:200px;height:5px;background:#e0533f;border-radius:3px"></div>
       <div class="nr" style="left:210px;top:412px;width:660px;height:88px;border-radius:12px;background:#5fd6b5;border:3px solid #1d2433;display:flex;align-items:center;padding-left:26px">
        <span class="iso-t iso-s" style="color:#1d2433;position:relative">fila nueva</span></div>` +
      chip("coral bo", "borrada", 860, 456) + chip("teal re", "espacio reutilizado", 540, 900));
    slide(q(s, ".iso-m"), S(14));
    grow(q(s, ".card"), S(14) + 0.2, 0.4);
    qa(s, ".r").forEach((el, k) => slide(el, S(14) + 0.4 + k * 0.1, 0.35, 20));
    tl.set([q(s, ".del"), q(s, ".nr")], { autoAlpha: 0 }, 0);
    const tb = at("borras", S(14));
    tl.to(q(s, ".r1"), { x: 14, duration: 0.08, yoyo: true, repeat: 3 }, tb);
    const tm = at("marca", S(14));
    show(q(s, ".del"), tm - 0.1, 0.3);
    tl.fromTo(q(s, ".strike"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.3 }, tm);
    show(q(s, ".bo"), tm + 0.1);
    const tr = at("reutiliza", S(14));
    tl.to([q(s, ".r1"), q(s, ".del"), q(s, ".strike"), q(s, ".bo")], { autoAlpha: 0, duration: 0.2 }, tr - 0.2);
    drop(q(s, ".nr"), tr - 0.1, 120, 0.45);
    show(q(s, ".re"), tr + 0.2);
  }

  // ===== 15 · Un millón de clientes en miles de páginas: ¿cómo encuentra uno sin leerlas todas? =====
  {
    const sp = space(540, 470, 22);
    const cells = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) cells.push([i, j]);
    cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const g = cells.map(([i, j]) => sp.box(-12 + i * 2.4, -12 + j * 2.4, 0, 2, 2, 0.5, i === 6 && j === 3 ? "amber" : "paper", i === 6 && j === 3 ? "tg" : `w`)).join("");
    const s = mk(15, `<div class="iso-row cnt" style="top:110px"><div class="iso-t iso-h indigo n">0</div></div>` + C("iso-s cl", "clientes", 225) +
      svg(`<g class="wall">${g}</g>`) + chip("pm", "miles de páginas", 540, 820) + C("iso-h coral qm", "¿cuál leer?", 920));
    const tm = at("millon", S(15));
    countUp(q(s, ".n"), 0, 1000000, tm - 0.3, 1.2);
    tl.fromTo(q(s, ".cnt"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, tm - 0.3);
    show(q(s, ".cl"), tm);
    const tp = at("paginas", S(15));
    tl.fromTo(q(s, ".wall"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, tp - 0.8);
    show(q(s, ".pm"), tp - 0.2);
    tl.fromTo(q(s, ".tg"), { y: 0 }, { y: -40, duration: 0.4, ease: "back.out(2)" }, at("uno", S(15)) - 0.1);
    slide(q(s, ".qm"), at("todas", S(15)) - 0.5);
  }

  // ===== 16 · Próximo video: los índices =====
  {
    const sp = space(540, 470, 40);
    const levels = [[[0, 0]], [[-4, 0], [4, 0]], [[-6, 0], [-2, 0], [2, 0], [6, 0]]];
    let g = "", lines = "";
    levels.forEach((lv, d) => lv.forEach(([x], k) => {
      const [cx, cy] = [540 + x * 60, 380 + d * 210];
      if (d > 0) { const px = 540 + levels[d - 1][Math.floor(k / 2)][0] * 60, py = 380 + (d - 1) * 210; lines += `<path class="ln lk" d="M${px} ${py + 30} L${cx} ${cy - 40}"/>`; }
      const s2 = space(cx, cy, 34);
      g += `<g class="nd nd${d}">${s2.box(-1, -1, 0, 2, 2, 1, d === 0 ? "indigo" : d === 1 ? "coral" : "amber")}</g>`;
    }));
    const s = mk(16, chip("pv", "en el próximo video", 540, 190) + svg(`${lines}${g}`) + C("iso-h indigo ix", "Índices", 960));
    show(q(s, ".pv"), S(16));
    qa(s, ".nd").forEach((el) => {
      const d = +el.getAttribute("class").match(/nd(\d)/)[1];
      drop(el, S(16) + 0.3 + d * 0.35, 120, 0.45);
    });
    qa(s, ".lk").forEach((el) => tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, S(16) + 0.9));
    slide(q(s, ".ix"), at("indices", S(16)) - 0.4);
  }

  // ===== 17 · Cierre =====
  {
    const sp = space(540, 640, 44);
    const cube = sp.box(-1.5, -1.5, 0, 3, 3, 3, "indigo") + sp.box(-1.5, -1.5, 3.2, 3, 3, 0.6, "amber");
    const s = mk(17, C("iso-h", "Sígueme", 200) + C("iso-m indigo l1", "para seguir aprendiendo", 330) + svg(`<g class="cb">${cube}</g>`) +
      C("iso-m l2", "cómo funciona la tecnología", 860) + C("iso-m coral l3", "por dentro", 950));
    slide(q(s, ".iso-h"), S(17));
    slide(q(s, ".l1"), at("seguir", S(17)) - 0.2);
    drop(q(s, ".cb"), S(17) + 0.5, 200, 0.6);
    slide(q(s, ".l2"), at("como", S(17)) - 0.2);
    slide(q(s, ".l3"), at("dentro", S(17)) - 0.2);
  }
};
