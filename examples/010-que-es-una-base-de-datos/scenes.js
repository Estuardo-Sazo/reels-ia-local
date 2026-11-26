// Episodio 010: ¿Qué es una base de datos? (serie de bases de datos; no se menciona "curso" ni "clase")
// Tema PIZARRA: cada frase es un pizarrón nuevo; los diagramas se dibujan con tiza al ritmo de la voz
// y un borrador limpia entre escenas. Voz clonada del autor (assets/voces/yo-curso.wav).
window.EPISODE_TAG = "BASES DE DATOS";
window.EPISODE_THEME = "pizarra";
window.buildEpisode = function ({ tl, scene, at, S, E, countUp, typeText, pz }) {
  const { chalk, write, appear } = pz;
  const q = (root, sel) => root.querySelector(sel);

  // Piezas de texto: libre (x, y) o centrada en el ancho del escenario
  const T = (cls, html, x, y, extra = "") => `<div class="pz-t ${cls}" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
  const C = (cls, html, y) => `<div class="pz-row" style="top:${y}px"><div class="pz-t ${cls}">${html}</div></div>`;
  const svg = (inner) => `<svg class="pz-svg" width="1080" height="1200" viewBox="0 0 1080 1200">${inner}</svg>`;

  // Dibujos reutilizables (centrados en cx, cy)
  const cylinder = (cx, cy, rx = 150, h = 200, cls = "") => {
    const ry = rx * 0.27;
    const top = cy - h / 2, bot = cy + h / 2;
    const bands = [1, 2].map((k) => `<path class="ch thin ${cls}" d="M${cx - rx} ${top + (h * k) / 3} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + (h * k) / 3}"/>`).join("");
    return `<ellipse class="ch ${cls}" cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}"/>
      <path class="ch ${cls}" d="M${cx - rx} ${top} V${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} V${top}"/>${bands}`;
  };
  const stick = (x, y, cls = "") => `<g class="${cls}">
      <circle class="ch" cx="${x}" cy="${y - 110}" r="35"/><path class="ch" d="M${x} ${y - 75} V${y + 20}"/>
      <path class="ch" d="M${x - 50} ${y - 40} L${x} ${y - 55} L${x + 50} ${y - 40}"/><path class="ch" d="M${x - 40} ${y + 100} L${x} ${y + 20} L${x + 40} ${y + 100}"/></g>`;
  const gearPath = (cx, cy, R = 80, r = 62, teeth = 10) => {
    let d = "";
    for (let k = 0; k < teeth * 4; k++) {
      const a = (k / (teeth * 4)) * Math.PI * 2;
      const rad = k % 4 < 2 ? R : r;
      d += `${k ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)} `;
    }
    return `${d}Z`;
  };
  const gear = (cx, cy, cls = "y") => `<path class="ch ${cls}" d="${gearPath(cx, cy)}"/><circle class="ch ${cls}" cx="${cx}" cy="${cy}" r="24"/>`;
  // Flecha de (x1,y1) a (x2,y2), con curva opcional (bend = desplazamiento del punto de control)
  const arrow = (x1, y1, x2, y2, cls = "", bend = 0) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    const a = Math.atan2(y2 - cy, x2 - cx), h = 26;
    const p1 = `${(x2 - h * Math.cos(a - 0.45)).toFixed(1)} ${(y2 - h * Math.sin(a - 0.45)).toFixed(1)}`;
    const p2 = `${(x2 - h * Math.cos(a + 0.45)).toFixed(1)} ${(y2 - h * Math.sin(a + 0.45)).toFixed(1)}`;
    return `<path class="ch ${cls}" d="M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}"/><path class="ch ${cls}" d="M${p1} L${x2} ${y2} L${p2}"/>`;
  };
  const page = (x, y, w, h, lines, cls = "") => {
    let s = `<path class="ch ${cls}" d="M${x} ${y} H${x + w - 50} L${x + w} ${y + 50} V${y + h} H${x} Z"/><path class="ch thin ${cls}" d="M${x + w - 50} ${y} V${y + 50} H${x + w}"/>`;
    for (let k = 0; k < lines; k++) {
      const ly = y + 80 + k * ((h - 110) / Math.max(1, lines - 1));
      s += `<path class="ch thin pl" d="M${x + 30} ${ly.toFixed(1)} H${x + w - 40 - ((k * 37) % 60)}"/>`;
    }
    return s;
  };

  // ===== 0 · Iniciar sesión, comprar, me gusta → una base de datos detrás =====
  {
    const s = scene(0, svg(`
      <g class="i0"><path class="ch" d="M185 250 V215 A35 35 0 0 1 255 215 V250"/><rect class="ch" x="165" y="250" width="110" height="90" rx="12"/><circle class="ch thin" cx="220" cy="290" r="10"/><path class="ch thin" d="M220 300 V318"/></g>
      <g class="i1"><path class="ch" d="M455 215 H485 L510 305 H595 L620 240 H495"/><circle class="ch" cx="525" cy="335" r="13"/><circle class="ch" cx="585" cy="335" r="13"/></g>
      <g class="i2"><path class="ch p" d="M860 345 C770 285 800 205 860 250 C920 205 950 285 860 345 Z"/></g>
      <g class="ar">${arrow(220, 440, 440, 600, "thin", -30)}${arrow(540, 440, 540, 580, "thin")}${arrow(860, 440, 640, 600, "thin", 30)}</g>
      <g class="db">${cylinder(540, 760, 150, 220, "y")}</g>`) +
      T("pz-s l0", "iniciar sesión", 100, 360) + T("pz-s l1", "comprar", 465, 360) + T("pz-s l2", "me gusta", 780, 360) +
      C("pz-m y lb", "base de datos", 920));
    s.classList.add("pz-scene");
    const t0 = at("sesion", S(0)), t1 = at("compras", S(0)), t2 = at("gusta", S(0)), t3 = at("base", S(0));
    chalk(q(s, ".i0"), t0 - 0.2, 0.4, 0.08); write(q(s, ".l0"), t0);
    chalk(q(s, ".i1"), t1 - 0.2, 0.4, 0.08); write(q(s, ".l1"), t1);
    chalk(q(s, ".i2"), t2 - 0.2, 0.6); write(q(s, ".l2"), t2);
    chalk(q(s, ".ar"), t3 - 0.6, 0.35, 0.1);
    chalk(q(s, ".db"), t3, 0.5, 0.12);
    write(q(s, ".lb"), t3 + 0.3, 0.8);
  }

  // ===== 1 · ¿Qué es? ¿Cómo funciona por dentro? =====
  {
    const s = scene(1, C("pz-h y h1", "¿Qué es?", 170) + C("pz-m h2", "¿Cómo funciona por dentro?", 360) +
      svg(`<g class="db">${cylinder(500, 760, 140, 200)}</g>
        <g class="lens"><circle class="ch b" cx="640" cy="720" r="95"/><path class="ch b" d="M708 788 L800 880" style="stroke-width:14"/></g>`));
    s.classList.add("pz-scene");
    write(q(s, ".h1"), S(1) + 0.1, 0.6);
    chalk(q(s, ".db"), S(1) + 0.3, 0.5, 0.1);
    write(q(s, ".h2"), at("como", S(1)) - 0.1, 1);
    chalk(q(s, ".lens"), at("dentro", S(1)) - 0.2, 0.5);
  }

  // ===== 2 · Definición: guarda información ordenada para encontrarla, cambiarla y protegerla =====
  {
    const s = scene(2, C("pz-m d1", "un sistema que guarda", 110) + C("pz-m y d2", "información ordenada", 210) +
      svg(`<path class="ch y ul" d="M300 320 Q540 340 790 315"/>
        <g class="k0"><circle class="ch b" cx="205" cy="540" r="58"/><path class="ch b" d="M248 583 L300 635" style="stroke-width:12"/></g>
        <g class="k1"><path class="ch g" d="M480 640 L495 595 L580 510 L610 540 L525 625 Z"/><path class="ch g thin" d="M495 595 L525 625"/><path class="ch g thin" d="M565 525 L595 555"/></g>
        <g class="k2"><path class="ch p" d="M860 470 L925 495 V550 C925 595 890 615 860 630 C830 615 795 595 795 550 V495 Z"/><path class="ch p" d="M832 550 L854 573 L892 530"/></g>`) +
      T("pz-s b k0t", "encontrar", 140, 690) + T("pz-s g k1t", "cambiar", 470, 690) + T("pz-s p k2t", "proteger", 790, 690));
    s.classList.add("pz-scene");
    write(q(s, ".d1"), S(2) + 0.6, 0.8);
    write(q(s, ".d2"), at("informacion", S(2)), 0.8);
    chalk(q(s, ".ul"), at("ordenada", S(2)), 0.4);
    ["encontrarla", "cambiarla", "protegerla"].forEach((w, k) => {
      const t = at(w, S(2));
      chalk(q(s, `.k${k}`), t - 0.15, 0.4, 0.08);
      write(q(s, `.k${k}t`), t + 0.1, 0.4);
    });
  }

  // ===== 3 · ¿Por qué no un archivo de texto o un Excel? =====
  {
    let grid = `<rect class="ch g" x="600" y="430" width="320" height="270"/>`;
    for (let k = 1; k < 4; k++) grid += `<path class="ch thin g" d="M${600 + k * 80} 430 V700"/>`;
    for (let k = 1; k < 5; k++) grid += `<path class="ch thin g" d="M600 ${430 + k * 54} H920"/>`;
    const s = scene(3, C("pz-h y h", "¿Por qué no…?", 140) +
      svg(`<g class="f">${page(170, 420, 240, 290, 6)}</g><g class="x">${grid}</g>`) +
      T("pz-s f1", "archivo de texto", 150, 750) + T("pz-s g x1", "hoja de Excel", 640, 750));
    s.classList.add("pz-scene");
    write(q(s, ".h"), S(3) + 0.1, 0.7);
    const ta = at("archivo", S(3)), tx = at("hoja", S(3));
    chalk(q(s, ".f"), ta - 0.2, 0.35, 0.06); write(q(s, ".f1"), ta + 0.2);
    chalk(q(s, ".x"), tx - 0.5, 0.25, 0.04); write(q(s, ".x1"), tx - 0.1, 0.45);
  }

  // ===== 4 · Un millón de clientes: leer línea por línea =====
  {
    let rows = "";
    for (let k = 0; k < 9; k++) rows += `<path class="ch thin pl" d="M330 ${470 + k * 58} H${720 - ((k * 53) % 130)}"/>`;
    const s = scene(4, C("pz-h y n", "0", 100) + C("pz-m cl", "clientes", 250) +
      svg(`<g class="f"><path class="ch" d="M290 400 H720 L770 450 V1000 H290 Z"/><path class="ch thin" d="M720 400 V450 H770"/>${rows}</g>
        <g class="hl"><rect class="ch p" x="300" y="448" width="460" height="44" rx="10"/></g>
        ${arrow(200, 470, 285, 470, "p hla")}`) +
      C("pz-m p ln", "línea 1", 1030));
    s.classList.add("pz-scene");
    const tm = at("millon", S(4));
    tl.fromTo(q(s, ".n"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, tm - 0.4);
    countUp(q(s, ".n"), 0, 1000000, tm - 0.4, 1.3);
    write(q(s, ".cl"), at("clientes", S(4)), 0.6);
    chalk(q(s, ".f"), at("encontrar", S(4)) - 0.3, 0.4, 0.05);
    // La marca baja renglón por renglón mientras dice "línea por línea"
    const tl0 = at("encontrar", S(4)) + 0.4;
    const hl = q(s, ".hl"), lab = q(s, ".ln");
    tl.set([hl, lab], { autoAlpha: 0 }, 0);
    tl.set([hl, lab], { autoAlpha: 1 }, tl0);
    chalk(s.querySelectorAll(".hla"), tl0, 0.3, 0.2);
    const end = E(4) - 2.1;
    for (let k = 0; k < 9; k++) {
      const t = tl0 + ((end - tl0) * k) / 9;
      tl.set(hl, { y: k * 58 }, t);
      tl.set(lab, { innerText: `línea ${k + 1}` }, t);
    }
    tl.set(lab, { innerText: "línea 9 de 1,000,000" }, end);
  }

  // ===== 5 · Dos personas, el último producto, al mismo tiempo =====
  {
    const s = scene(5,
      svg(`${stick(160, 620, "a")}${stick(920, 620, "b")}
        <g class="box"><rect class="ch y" x="440" y="520" width="200" height="170" rx="10"/><path class="ch y thin" d="M440 575 H640 M540 520 V690"/></g>
        <g class="ar">${arrow(230, 580, 420, 600, "", -40)}${arrow(850, 580, 660, 600, "", 40)}</g>
        <g class="clk"><circle class="ch b" cx="540" cy="220" r="70"/><path class="ch b" d="M540 175 V220 L575 240"/></g>
        <path class="ch p qm" d="M505 400 C505 340 585 340 585 385 C585 420 545 420 545 455"/><circle class="ch p qd" cx="545" cy="490" r="5"/>`) +
      T("pz-s y bt", "último producto", 400, 720) + T("pz-s b ct", "al mismo tiempo", 685, 190));
    s.classList.add("pz-scene");
    chalk(q(s, ".a"), at("personas", S(5)) - 0.3, 0.3, 0.06);
    chalk(q(s, ".b"), at("personas", S(5)) - 0.1, 0.3, 0.06);
    const tb = at("ultimo", S(5));
    chalk(q(s, ".box"), tb - 0.1, 0.4, 0.1); write(q(s, ".bt"), tb + 0.2);
    const tt = at("mismo", S(5));
    chalk(q(s, ".clk"), tt - 0.2, 0.4, 0.1); write(q(s, ".ct"), tt);
    chalk(q(s, ".ar"), tt, 0.5, 0);
    chalk([q(s, ".qm"), q(s, ".qd")], at("sabe", S(5)) - 0.1, 0.4, 0.3);
  }

  // ===== 6 · Se va la luz a mitad de un cambio: archivo a medias o dañado =====
  {
    let top = "", bot = "";
    for (let k = 0; k < 4; k++) top += `<path class="ch thin" d="M330 ${560 + k * 50} H${700 - ((k * 41) % 90)}"/>`;
    for (let k = 0; k < 3; k++) bot += `<path class="ch thin" d="M330 ${820 + k * 50} H${640 - ((k * 57) % 120)}" style="stroke-dasharray:14 22;opacity:.45"/>`;
    const s = scene(6,
      svg(`<path class="ch y bolt" d="M575 90 L475 290 H555 L505 450 L665 230 H580 L635 90 Z"/>
        <g class="f"><path class="ch" d="M290 500 H700 L750 550 V990 H290 Z"/><path class="ch thin" d="M700 500 V550 H750"/>${top}</g>
        <path class="ch p tear" d="M270 770 L330 745 L390 785 L450 740 L510 790 L570 745 L630 785 L690 742 L770 778"/>
        <g class="lost">${bot}</g>
        <path class="ch p x" d="M820 840 L920 940 M920 840 L820 940"/>`) +
      T("pz-m p med", "a medias", 770, 650) + T("pz-m p dan", "dañado", 800, 960));
    s.classList.add("pz-scene");
    chalk(q(s, ".bolt"), at("luz", S(6)) - 0.2, 0.35);
    chalk(q(s, ".f"), at("mitad", S(6)) - 0.3, 0.3, 0.06);
    const tm = at("medias", S(6));
    chalk(q(s, ".tear"), tm - 0.4, 0.4);
    write(q(s, ".med"), tm - 0.1, 0.5);
    tl.fromTo(q(s, ".lost"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, tm);
    const td = at("danado", S(6));
    chalk(q(s, ".x"), td - 0.35, 0.2);
    write(q(s, ".dan"), td - 0.15, 0.3);
  }

  // ===== 7 · Resuelve los tres problemas =====
  {
    const items = ["buscar rápido", "muchos al mismo tiempo", "no perder datos"];
    const s = scene(7, C("pz-m y h", "Una base de datos resuelve:", 120) +
      svg(items.map((_, k) => `<rect class="ch box${k}" x="130" y="${330 + k * 200}" width="90" height="90" rx="10"/>
        <path class="ch g ok${k}" d="M145 ${375 + k * 200} L172 ${405 + k * 200} L235 ${320 + k * 200}" style="stroke-width:9"/>`).join("")) +
      items.map((txt, k) => T(`pz-m it${k}`, txt, 270, 322 + k * 200)).join(""));
    s.classList.add("pz-scene");
    write(q(s, ".h"), S(7) + 0.1, 1);
    ["buscar", "atender", "perder"].forEach((w, k) => {
      const t = at(w, S(7) + 1);
      chalk(q(s, `.box${k}`), t - 0.4, 0.25);
      write(q(s, `.it${k}`), t - 0.25, 0.5);
      chalk(q(s, `.ok${k}`), t + 0.25, 0.25);
    });
  }

  // ===== 8 · Dos partes: los datos (disco) y el motor =====
  {
    const s = scene(8, C("pz-m h", "Por dentro, dos partes", 100) +
      svg(`<g class="db">${cylinder(270, 560, 140, 220, "b")}</g>${arrow(445, 560, 625, 560, "thin ar1")}${arrow(625, 600, 445, 600, "thin ar2")}`) +
      `<svg class="pz-svg gear" style="left:690px;top:430px" width="260" height="260" viewBox="690 430 260 260">${gear(820, 560)}</svg>` +
      T("pz-m b dl", "DATOS", 175, 720) + T("pz-s dl2", "archivos en el disco", 95, 820) +
      T("pz-m y ml", "MOTOR", 715, 720) + T("pz-s ml2", "el programa que", 700, 820) + T("pz-s ml3", "los administra", 715, 875));
    s.classList.add("pz-scene");
    write(q(s, ".h"), S(8) + 0.1, 0.9);
    const td = at("datos", S(8));
    chalk(q(s, ".db"), td - 0.2, 0.45, 0.1); write(q(s, ".dl"), td); write(q(s, ".dl2"), at("disco", S(8)) - 0.6, 0.8);
    const tm = at("motor", S(8));
    const g = q(s, ".gear");
    chalk(g, tm - 0.2, 0.6, 0.1); write(q(s, ".ml"), tm);
    tl.fromTo(g, { rotation: 0 }, { rotation: 140, duration: E(8) - tm, ease: "none", transformOrigin: "50% 50%" }, tm);
    write(q(s, ".ml2"), at("programa", S(8)) - 0.2, 0.6); write(q(s, ".ml3"), at("administra", S(8)) - 0.2, 0.6);
    chalk(s.querySelectorAll(".ar1, .ar2"), at("administra", S(8)), 0.3, 0.1);
  }

  // ===== 9 · Tú nunca tocas los archivos: le pides al motor =====
  {
    const s = scene(9,
      svg(`${stick(150, 640, "me")}<g class="db">${cylinder(900, 610, 105, 170, "b")}</g>
        <g class="direct">${arrow(190, 440, 870, 470, "thin", -150)}</g><path class="ch p no" d="M490 330 L590 430 M590 330 L490 430" style="stroke-width:9"/>
        <g class="ask">${arrow(215, 610, 440, 610)}</g><g class="go">${arrow(625, 610, 780, 610)}</g>`) +
      `<svg class="pz-svg gear" style="left:410px;top:480px" width="260" height="260" viewBox="410 480 260 260">${gear(540, 610)}</svg>` +
      T("pz-s me2", "tú", 135, 760) + T("pz-s y mo", "motor", 490, 760) + T("pz-s b dt", "datos", 855, 760) +
      T("pz-s bub", "¿me das…?", 220, 520));
    s.classList.add("pz-scene");
    chalk(q(s, ".me"), S(9), 0.3, 0.05); write(q(s, ".me2"), S(9) + 0.2, 0.3);
    chalk(q(s, ".db"), S(9) + 0.3, 0.35, 0.08); write(q(s, ".dt"), S(9) + 0.6, 0.4);
    chalk(q(s, ".direct"), at("tocas", S(9)) - 0.1, 0.5, 0.3);
    chalk(q(s, ".no"), at("directamente", S(9)) + 0.1, 0.35);
    const tp = at("pides", S(9));
    const g = q(s, ".gear");
    chalk(g, tp - 0.3, 0.5, 0.1); write(q(s, ".mo"), tp - 0.1, 0.4);
    chalk(q(s, ".ask"), tp, 0.35, 0.2); write(q(s, ".bub"), tp + 0.3, 0.6);
    const te = at("encarga", S(9));
    chalk(q(s, ".go"), te - 0.4, 0.35, 0.2);
    tl.fromTo(g, { rotation: 0 }, { rotation: 120, duration: Math.max(0.5, E(9) - tp), ease: "none", transformOrigin: "50% 50%" }, tp);
  }

  // ===== 10 · Tablas: filas = registros, columnas = datos =====
  {
    const X0 = 140, Y0 = 250, W = 800, H = 560, cols = 4, rows = 6;
    let g = `<rect class="ch" x="${X0}" y="${Y0}" width="${W}" height="${H}"/>`;
    for (let k = 1; k < cols; k++) g += `<path class="ch thin" d="M${X0 + (k * W) / cols} ${Y0} V${Y0 + H}"/>`;
    for (let k = 1; k < rows; k++) g += `<path class="ch thin" d="M${X0} ${Y0 + (k * H) / rows} H${X0 + W}"/>`;
    const s = scene(10, C("pz-m h", "una tabla", 110) +
      svg(`<g class="g">${g}</g>
        <rect class="ch y fill-y row" x="${X0 - 14}" y="${Y0 + (3 * H) / rows - 8}" width="${W + 28}" height="${H / rows + 16}" rx="14"/>
        <rect class="ch b fill-b col" x="${X0 + W / cols - 8}" y="${Y0 - 14}" width="${W / cols + 16}" height="${H + 28}" rx="14"/>`) +
      T("pz-m y rl", "fila = registro", 140, 860) + T("pz-m b cl", "columna = dato", 140, 960));
    s.classList.add("pz-scene");
    write(q(s, ".h"), at("tablas", S(10)) - 0.2, 0.5);
    chalk(q(s, ".g"), at("tablas", S(10)), 0.4, 0.06);
    const tf = at("fila", S(10)), tc = at("columna", S(10));
    chalk(q(s, ".row"), tf - 0.1, 0.5); tl.fromTo(q(s, ".row"), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.3 }, tf + 0.3);
    write(q(s, ".rl"), tf + 0.1, 0.8);
    chalk(q(s, ".col"), tc - 0.1, 0.5); tl.fromTo(q(s, ".col"), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.3 }, tc + 0.3);
    write(q(s, ".cl"), tc + 0.1, 0.8);
  }

  // ===== 11 · La tabla de clientes: nombre, correo, ciudad =====
  // Filas de ejemplo (ilustrativas); la siguiente escena filtra las de Guatemala
  const PEOPLE = [["Ana", "ana@correo.com", "Guatemala"], ["Luis", "luis@correo.com", "México"], ["Sofía", "sofia@correo.com", "Guatemala"], ["Carlos", "carlos@correo.com", "Colombia"]];
  const COLX = [60, 270, 720], COLW = [210, 450, 300];
  {
    const Y0 = 330, RH = 100;
    let g = `<rect class="ch" x="60" y="${Y0}" width="960" height="${RH * 5}"/><path class="ch" d="M60 ${Y0 + RH} H1020"/>`;
    g += `<path class="ch thin" d="M270 ${Y0} V${Y0 + RH * 5} M720 ${Y0} V${Y0 + RH * 5}"/>`;
    for (let k = 2; k < 5; k++) g += `<path class="ch thin" d="M60 ${Y0 + k * RH} H1020"/>`;
    const head = ["nombre", "correo", "ciudad"].map((h, c) => T(`pz-t y hd${c}`, h, COLX[c] + 22, Y0 + 20, "font-size:56px")).join("");
    const body = PEOPLE.map((p, r) => p.map((v, c) => T(`pz-s r${r}c${c}`, v, COLX[c] + 22, Y0 + RH * (r + 1) + 26, c === 1 ? "font-size:34px" : "")).join("")).join("");
    const s = scene(11, T("pz-m tab", "clientes", 80, 200) + svg(`<path class="ch y tabu" d="M75 300 H330"/><g class="g">${g}</g>`) + head + body);
    s.classList.add("pz-scene");
    const tc = at("clientes", S(11));
    write(q(s, ".tab"), tc - 0.2, 0.5); chalk(q(s, ".tabu"), tc + 0.2, 0.3);
    chalk(q(s, ".g"), tc + 0.2, 0.4, 0.05);
    const tr = at("cliente", tc + 0.5);
    PEOPLE.forEach((_, r) => write(q(s, `.r${r}c0`), tr - 0.2 + r * 0.25, 0.3));
    ["nombre", "correo", "ciudad"].forEach((w, c) => {
      const t = at(w, S(11));
      write(q(s, `.hd${c}`), t - 0.35, 0.3);
      if (c > 0) PEOPLE.forEach((_, r) => write(q(s, `.r${r}c${c}`), t - 0.15 + r * 0.08, 0.25));
    });
  }

  // ===== 12 · SQL: "dame todos los clientes de Guatemala" =====
  {
    const s = scene(12, C("pz-h y h", "SQL", 120) + C("pz-s sub", "el lenguaje para pedirle cosas al motor", 290) +
      T("pz-code b c0", "", 110, 430) + T("pz-code b c1", "", 110, 505) + T("pz-code b c2", "", 110, 580) +
      C("pz-m p tr", "“dame todos los clientes de Guatemala”", 760) +
      svg(`<path class="ch thin br" d="M80 410 Q60 410 60 440 V610 Q60 640 80 640"/><path class="ch thin br2" d="M1000 410 Q1020 410 1020 440 V610 Q1020 640 1000 640"/>`));
    s.classList.add("pz-scene");
    const ts = at("sql", S(12));
    write(q(s, ".h"), ts - 0.2, 0.5);
    write(q(s, ".sub"), ts + 0.3, 1);
    const tg = at("algo", ts) - 0.1;
    chalk([q(s, ".br"), q(s, ".br2")], tg, 0.3, 0);
    let t = typeText(q(s, ".c0"), "SELECT *", tg + 0.1, 30);
    t = typeText(q(s, ".c1"), "FROM clientes", t + 0.05, 30);
    typeText(q(s, ".c2"), "WHERE ciudad = 'Guatemala';", t + 0.05, 36);
    write(q(s, ".tr"), at("dame", ts) - 0.1, 1.6);
  }

  // ===== 13 · El motor busca el camino más rápido y devuelve el resultado =====
  {
    const s = scene(13,
      `<svg class="pz-svg gear" style="left:70px;top:290px" width="260" height="260" viewBox="70 290 260 260">${gear(200, 420)}</svg>` +
      svg(`<g class="db">${cylinder(880, 420, 100, 160, "b")}</g>
        <path class="ch thin long" d="M285 380 C360 180 460 560 540 300 C600 120 700 520 770 380" style="opacity:.55"/>
        <path class="ch p xl" d="M500 230 L560 290 M560 230 L500 290"/>
        <path class="ch y fast" d="M290 450 H770" style="stroke-width:9"/>
        ${arrow(780, 560, 330, 720, "res", 40)}
        <g class="tb"><rect class="ch" x="200" y="760" width="680" height="200"/><path class="ch thin" d="M200 860 H880 M460 760 V960"/></g>`) +
      T("pz-s y rf", "el más rápido", 430, 470) + T("pz-s b rr", "resultado", 70, 640) +
      PEOPLE.filter((p) => p[2] === "Guatemala").map((p, r) => T(`pz-s o${r}`, `${p[0]}`, 240, 785 + r * 100) + T(`pz-s o${r}b`, p[2], 500, 785 + r * 100)).join(""));
    s.classList.add("pz-scene");
    const g = q(s, ".gear");
    chalk(g, S(13), 0.4, 0.1);
    tl.fromTo(g, { rotation: 0 }, { rotation: 180, duration: E(13) - S(13), ease: "none", transformOrigin: "50% 50%" }, S(13));
    chalk(q(s, ".db"), S(13) + 0.2, 0.35, 0.08);
    const tr = at("rapida", S(13));
    chalk(q(s, ".long"), at("decide", S(13)), 0.8);
    chalk(q(s, ".xl"), tr - 0.3, 0.3);
    chalk(q(s, ".fast"), tr - 0.1, 0.35); write(q(s, ".rf"), tr + 0.2, 0.5);
    const tres = at("resultado", S(13));
    chalk(s.querySelectorAll(".res"), tres - 1.3, 0.3, 0.15);
    chalk(q(s, ".tb"), tres - 1.0, 0.25, 0.06); write(q(s, ".rr"), tres - 1.0, 0.4);
    [0, 1].forEach((r) => { write(q(s, `.o${r}`), tres - 0.7 + r * 0.2, 0.25); write(q(s, `.o${r}b`), tres - 0.6 + r * 0.2, 0.3); });
  }

  // ===== 14 · Motores que vas a escuchar mucho =====
  {
    const names = ["MySQL", "PostgreSQL", "SQLite", "SQL Server"];
    const pos = [[90, 330], [570, 330], [90, 600], [570, 600]];
    const cls = ["b", "y", "g", "p"];
    const s = scene(14, C("pz-m h", "motores que vas a escuchar", 140) +
      svg(pos.map(([x, y], k) => `<rect class="ch ${cls[k]} bx${k}" x="${x}" y="${y}" width="420" height="190" rx="22"/>`).join("")) +
      names.map((n, k) => `<div class="pz-row" style="top:${pos[k][1] + 52}px;left:${pos[k][0]}px;width:420px"><div class="pz-t pz-m ${cls[k]} nm${k}">${n}</div></div>`).join(""));
    s.classList.add("pz-scene");
    write(q(s, ".h"), at("motores", S(14)) - 0.1, 1);
    const ts = [at("mysql", S(14)), at("postgresql", S(14)), at("sqlite", S(14)), at("server", S(14)) - 0.3];
    ts.forEach((t, k) => { chalk(q(s, `.bx${k}`), t - 0.25, 0.35); write(q(s, `.nm${k}`), t - 0.1, 0.45); });
  }

  // ===== 15 · Próximo video: abrir el disco =====
  {
    const bits = ["01001011", "11010010", "00110101"];
    const s = scene(15, C("pz-m y nx", "en el próximo video", 110) +
      svg(`<g class="body"><path class="ch b" d="M390 560 V840 A150 40 0 0 0 690 840 V560"/><path class="ch b thin" d="M390 653 A150 40 0 0 0 690 653 M390 746 A150 40 0 0 0 690 746"/></g>
        <g class="lid"><ellipse class="ch b" cx="540" cy="560" rx="150" ry="40"/></g>`) +
      bits.map((b, k) => C(`pz-code g bt${k}`, b, 460 - k * 80)).join("") +
      C("pz-m q1", "¿cómo se guardan", 930) + C("pz-m y q2", "de verdad tus datos?", 1020));
    s.classList.add("pz-scene");
    write(q(s, ".nx"), S(15) + 0.05, 0.8);
    chalk(q(s, ".body"), S(15) + 0.3, 0.4, 0.1);
    chalk(q(s, ".lid"), S(15) + 0.5, 0.4);
    const ta = at("abrir", S(15));
    tl.to(q(s, ".lid"), { x: 260, y: -40, rotation: 28, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(1.6)" }, ta);
    bits.forEach((_, k) => tl.fromTo(q(s, `.bt${k}`), { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, ta + 0.3 + k * 0.2));
    const tg = at("guardan", S(15));
    write(q(s, ".q1"), tg - 0.5, 0.7);
    write(q(s, ".q2"), at("verdad", S(15)) - 0.1, 0.8);
  }

  // ===== 16 · Cierre: sígueme =====
  {
    const s = scene(16, C("pz-h y h", "Sígueme", 260) +
      svg(`<path class="ch y ul" d="M330 420 Q540 450 760 410"/>`) +
      C("pz-m l1", "para seguir aprendiendo", 520) + C("pz-m b l2", "cómo funciona la tecnología", 640) + C("pz-m b l3", "por dentro", 740));
    s.classList.add("pz-scene");
    write(q(s, ".h"), S(16), 0.6);
    chalk(q(s, ".ul"), S(16) + 0.5, 0.4);
    write(q(s, ".l1"), at("seguir", S(16)) - 0.1, 0.9);
    write(q(s, ".l2"), at("como", S(16)) - 0.1, 1.1);
    write(q(s, ".l3"), at("dentro", S(16)) - 0.2, 0.6);
  }
};
