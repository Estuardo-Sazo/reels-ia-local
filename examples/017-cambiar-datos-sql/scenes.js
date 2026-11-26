// Episodio 017: SQL para cambiar datos, INSERT / UPDATE / DELETE y el WHERE olvidado (serie de bases de datos; no se menciona "curso" ni "clase").
// Tema ISOMÉTRICO (el de la serie desde el 011). Voz clonada (assets/voces/yo-curso.wav).
window.EPISODE_TAG = "BASES DE DATOS";
window.EPISODE_THEME = "isometrico";
window.buildEpisode = function ({ tl, scene, at, S, E, countUp, iso }) {
  const { space, drop, grow, slide } = iso;
  const q = (root, sel) => root.querySelector(sel);
  const qa = (root, sel) => [...root.querySelectorAll(sel)];
  const svg = (inner) => `<svg class="iso-svg" width="1080" height="1200" viewBox="0 0 1080 1200">${inner}</svg>`;
  const C = (cls, html, y) => `<div class="iso-row" style="top:${y}px"><div class="iso-t ${cls}">${html}</div></div>`;
  const chip = (cls, html, x, y) => `<div class="iso-chip ${cls}" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%)">${html}</div>`;
  const mk = (i, html) => {
    const s = scene(i, html);
    s.classList.add("iso-scene");
    return s;
  };
  const show = (el, t, dur = 0.35) => tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: "power2.out" }, t);
  const cross = (cx, cy, r, cls = "") => `<g class="${cls}"><path d="M${cx - r} ${cy - r} L${cx + r} ${cy + r} M${cx + r} ${cy - r} L${cx - r} ${cy + r}" style="fill:none;stroke:#e0533f;stroke-width:18;stroke-linecap:round"/></g>`;
  const KW = (w) => `<span style="color:#9d9bff">${w}</span>`;
  const code = (cls, x, y, w, lines, size = 40) => `<div class="${cls}" style="left:${x}px;top:${y}px;width:${w}px;background:#1d2433;border:3px solid #1d2433;border-radius:20px;box-shadow:10px 10px 0 #4a47b8;padding:24px 32px">` +
    lines.map((l, k) => `<div class="cl k${k}" style="font:500 ${size}px 'DM Mono',monospace;color:#ffd27a;white-space:pre;line-height:1.4">${l}</div>`).join("") + `</div>`;
  const ROWH = 52;
  const tbl = (cls, x, y, w, title, cols, rows, widths) => {
    const gw = widths.map((f) => f + "fr").join(" ");
    const head = `<div style="display:grid;grid-template-columns:${gw};gap:12px;padding:4px 12px 10px;border-bottom:3px solid #1d2433">${cols.map((c, j) => `<span class="th h${j}" style="font:700 30px Outfit,sans-serif;color:#1d2433;padding:0 6px;border-radius:8px">${c}</span>`).join("")}</div>`;
    const body = rows.map((r, k) => `<div class="tr tr${k}" style="display:grid;grid-template-columns:${gw};gap:12px;align-items:center;height:${ROWH}px;box-sizing:border-box;padding:0 12px;margin-top:8px;border-radius:10px;background:#eceef5">${r.map((v, j) => `<span class="td d${j}" style="font:500 30px 'DM Mono',monospace;color:#1d2433;white-space:nowrap;padding:0 6px;border-radius:8px">${v}</span>`).join("")}</div>`).join("");
    return `<div class="${cls}" style="left:${x}px;top:${y}px;width:${w}px;background:#fff;border:3px solid #1d2433;border-radius:20px;box-shadow:10px 10px 0 #1d2433;padding:16px 22px 22px">${title ? `<div class="iso-t iso-s" style="position:relative;color:#4a47b8;margin-bottom:6px">${title}</div>` : ""}${head}${body}</div>`;
  };
  const kw = (cls, word, meaning, y, color = "indigo") => `<div class="iso-row" style="top:${y}px"><div class="${cls}" style="display:flex;gap:26px;align-items:center">
    <span class="iso-chip ${color}" style="position:relative;font:700 70px 'DM Mono',monospace;padding:8px 30px">${word}</span><span class="iso-t iso-m" style="position:relative">= ${meaning}</span></div></div>`;
  const CLI = [["Ana", "Guatemala", "34"], ["Luis", "Antigua", "27"], ["Sofía", "Guatemala", "22"], ["Carlos", "Antigua", "41"], ["Pedro", "Guatemala", "52"]];
  const COLS = ["nombre", "ciudad", "edad"], W3 = [1.2, 1.7, 0.7];
  const hideLine = (s, k) => tl.set(q(s, `.k${k}`), { autoAlpha: 0 }, 0);
  const setCity = (s, k, t, color = "#ffd27a") => {
    const el = q(s, `.tr${k} .d1`);
    tl.set(el, { innerText: "Antigua" }, t);
    tl.fromTo(el, { backgroundColor: color }, { backgroundColor: "rgba(0,0,0,0)", duration: 0.9, immediateRender: false }, t);
  };

  // ===== 0 · La consulta más peligrosa: solo le falta una palabra =====
  {
    const s = mk(0, C("iso-m coral t", "⚠ la consulta más peligrosa", 140) +
      code("cd", 70, 260, 940, [`${KW("UPDATE")} clientes`, `${KW("SET")} ciudad = 'Antigua'`, `<span class="gh" style="display:inline-block;border:4px dashed #ff9b8a;border-radius:12px;padding:0 16px;color:#ff9b8a">WHERE …  ?</span>`]) +
      chip("coral fp", "le falta una palabra", 540, 680));
    slide(q(s, ".t"), at("peligrosa", 0) - 0.5);
    slide(q(s, ".cd"), at("sql", 0) - 0.3);
    hideLine(s, 2);
    const tf = at("falta", 0);
    show(q(s, ".k2"), tf - 0.3, 0.3);
    tl.fromTo(q(s, ".gh"), { opacity: 1 }, { opacity: 0.35, duration: 0.2, yoyo: true, repeat: 3, immediateRender: false }, tf);
    show(q(s, ".fp"), tf - 0.2);
  }

  // ===== 1 · Antes: leer datos. Hoy: cambiarlos, con tres palabras nuevas =====
  {
    const sp = space(540, 720, 40);
    const W = [["INSERT", "teal", -5], ["UPDATE", "amber", -1], ["DELETE", "coral", 3]];
    const s = mk(1, chip("an", "antes: SELECT (leer)", 540, 150) + C("iso-h indigo t", "cambiar datos", 230) +
      svg(W.map(([, c, x], k) => `<g class="b b${k}">${sp.box(x, -x - 2, 0, 3.2, 3.2, 2.2, c)}</g>`).join("")) +
      W.map(([w, c, x], k) => chip(`${c} w w${k}`, w, ...sp.P(x + 1.6, -x - 0.4, 3.4))).join("") + chip("tp", "3 palabras nuevas", 540, 980));
    show(q(s, ".an"), S(1));
    tl.to(q(s, ".an"), { autoAlpha: 0.35, duration: 0.3 }, at("hoy", S(1)));
    slide(q(s, ".t"), at("cambiarlos", S(1)) - 0.4);
    const tt = at("tres", S(1));
    qa(s, ".b").forEach((g, k) => drop(g, tt - 0.3 + k * 0.15, 140, 0.45));
    qa(s, ".w").forEach((c, k) => show(c, tt + 0.1 + k * 0.15, 0.25));
    show(q(s, ".tp"), at("tres", S(1)) + 0.1);
  }

  // ===== 2 · INSERT = agregar: INSERT INTO clientes y los valores entre paréntesis =====
  {
    const s = mk(2, kw("k", "INSERT", "agregar", 170, "teal") +
      code("cd", 70, 420, 940, [`${KW("INSERT INTO")} clientes`, `${KW("VALUES")} ('Marta', 'Antigua', 29);`], 38) + chip("amber pa", "( valores de la nueva fila )", 540, 690));
    slide(q(s, ".k"), at("insert", S(2)) - 0.4);
    slide(q(s, ".cd"), at("escribes", S(2)) - 0.2);
    hideLine(s, 1);
    show(q(s, ".k1"), at("parentesis", S(2)) - 0.3, 0.25);
    show(q(s, ".pa"), at("valores", S(2)) - 0.3);
  }

  // ===== 3 · Marta, Antigua, 29: el motor la agrega como una fila más =====
  {
    const s = mk(3, tbl("tb", 110, 150, 860, "clientes", COLS, [...CLI, ["Marta", "Antigua", "29"]], W3) + chip("teal nf", "+ 1 fila", 540, 700));
    show(q(s, ".tb"), S(3));
    const r = q(s, ".tr5");
    tl.set(r, { autoAlpha: 0 }, 0);
    [["marta", 0], ["antigua", 1], ["veintinueve", 2]].forEach(([w, j]) => tl.fromTo(q(s, `.tr5 .d${j}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, at(w, S(3)) - 0.1));
    tl.set(r, { autoAlpha: 1 }, at("marta", S(3)) - 0.15);
    qa(s, ".tr5 .td").forEach((d) => tl.set(d, { autoAlpha: 0 }, at("marta", S(3)) - 0.15));
    tl.fromTo(r, { backgroundColor: "#eceef5" }, { backgroundColor: "#c9f0e2", duration: 0.4, immediateRender: false }, at("agrega", S(3)) - 0.1);
    show(q(s, ".nf"), at("agrega", S(3)));
  }

  // ===== 4 · UPDATE = modificar filas que ya existen =====
  {
    const s = mk(4, kw("k", "UPDATE", "modificar", 300, "amber") + chip("ex", "filas que ya existen", 540, 520));
    slide(q(s, ".k"), at("update", S(4)) - 0.4);
    show(q(s, ".ex"), at("existen", S(4)) - 0.5);
  }

  // ===== 5 · UPDATE clientes SET ciudad = 'Antigua' WHERE nombre = 'Ana' =====
  {
    const s = mk(5, code("cd", 70, 200, 940, [`${KW("UPDATE")} clientes`, `${KW("SET")} ciudad = 'Antigua'`, `${KW("WHERE")} nombre = 'Ana';`], 42) +
      chip("amber c0", "¿qué tabla?", 540, 580) + chip("amber c1", "¿qué cambio?", 540, 670) + chip("teal c2", "¿a cuáles filas?", 540, 760));
    show(q(s, ".cd"), S(5));
    [1, 2].forEach((k) => hideLine(s, k));
    show(q(s, ".c0"), at("clientes", S(5)) - 0.2);
    show(q(s, ".k1"), at("set", S(5)) - 0.2, 0.2); show(q(s, ".c1"), at("antigua", S(5)) - 0.3);
    show(q(s, ".k2"), at("where", S(5)) - 0.2, 0.2); show(q(s, ".c2"), at("nombre", S(5)) - 0.1);
  }

  // ===== 6 · El WHERE dice a cuáles filas: solo a Ana =====
  {
    const s = mk(6, code("cd", 70, 130, 940, [`${KW("WHERE")} nombre = 'Ana';`], 40) + tbl("tb", 110, 310, 860, "", COLS, CLI, W3) + chip("teal sa", "solo Ana", 540, 760));
    show(q(s, ".cd"), S(6)); show(q(s, ".tb"), S(6) + 0.1);
    tl.to(q(s, ".tr0"), { backgroundColor: "#c9f0e2", duration: 0.3 }, at("filas", S(6)) - 0.2);
    qa(s, ".tr").slice(1).forEach((r) => tl.to(r, { autoAlpha: 0.3, duration: 0.3 }, at("filas", S(6))));
    setCity(s, 0, at("cambias", S(6)));
    show(q(s, ".sa"), at("solo", S(6)) - 0.4);
  }

  // ===== 7 · DELETE = borrar: DELETE FROM clientes WHERE nombre = 'Pedro' =====
  {
    const s = mk(7, kw("k", "DELETE", "borrar", 120, "coral") + code("cd", 70, 260, 940, [`${KW("DELETE FROM")} clientes`, `${KW("WHERE")} nombre = 'Pedro';`], 40) +
      tbl("tb", 110, 470, 860, "", COLS, CLI, W3));
    slide(q(s, ".k"), at("delete", S(7)) - 0.4);
    const td = at("delete", at("borrar", S(7)));
    show(q(s, ".cd"), td - 0.3); hideLine(s, 1); show(q(s, ".k1"), at("where", S(7)) - 0.2, 0.2);
    show(q(s, ".tb"), td);
    tl.to(q(s, ".tr4"), { backgroundColor: "#ff9b8a", duration: 0.25 }, at("pedro", S(7)) - 0.2);
    tl.to(q(s, ".tr4"), { autoAlpha: 0, x: 80, duration: 0.45, ease: "power2.in" }, at("borra", S(7)) + 0.3);
  }

  // ===== 8 · Ahora sí, la peligrosa: escribes el UPDATE y se te olvida el WHERE =====
  {
    const s = mk(8, C("iso-h coral t", "⚠ peligro", 130) +
      code("cd", 70, 290, 940, [`${KW("UPDATE")} clientes`, `${KW("SET")} ciudad = 'Antigua'`, `<span class="wh">${KW("WHERE")} nombre = 'Ana'</span>;`], 42) +
      svg(`<path class="sk" d="M90 560 L760 560" style="stroke:#e0533f;stroke-width:10;stroke-linecap:round"/>`) + chip("coral ol", "se te olvidó", 540, 720));
    slide(q(s, ".t"), at("peligrosa", S(8)) - 0.4);
    slide(q(s, ".cd"), at("escribes", S(8)) - 0.2);
    const to = at("olvida", S(8));
    show(q(s, ".sk"), to - 0.1, 0.2);
    tl.to(q(s, ".wh"), { autoAlpha: 0, duration: 0.4 }, at("final", S(8)) - 0.4);
    tl.to(q(s, ".sk"), { autoAlpha: 0, duration: 0.3 }, at("final", S(8)) - 0.2);
    show(q(s, ".ol"), to);
  }

  // ===== 9 · El motor no pregunta: cambia la ciudad de todos. Si tienes un millón, el millón =====
  {
    const s = mk(9, code("cd", 70, 120, 940, [`${KW("UPDATE")} clientes ${KW("SET")} ciudad = 'Antigua';`], 34) + tbl("tb", 110, 270, 860, "", COLS, CLI, W3) +
      `<div class="iso-row" style="top:760px"><div class="iso-t iso-h coral cn"><span class="n" style="position:relative">0</span> filas</div></div>` + chip("np", "sin preguntar", 540, 920));
    show(q(s, ".cd"), S(9)); show(q(s, ".tb"), S(9) + 0.1);
    show(q(s, ".np"), at("pregunta", S(9)) - 0.3);
    const tc = at("cambia", S(9));
    CLI.forEach((_, k) => setCity(s, k, tc + k * 0.18, "#ff9b8a"));
    const tm = at("millon", S(9));
    show(q(s, ".cn"), tm - 0.4, 0.2);
    countUp(q(s, ".n"), 0, 1000000, tm - 0.3, 1.2);
  }

  // ===== 10 · Con DELETE lo mismo: sin WHERE borra todas las filas =====
  {
    const s = mk(10, code("cd", 70, 130, 940, [`${KW("DELETE FROM")} clientes;`], 40) + tbl("tb", 110, 350, 860, "clientes", COLS, CLI, W3) +
      chip("coral sw", "sin WHERE", 540, 290) + C("iso-m coral vc", "tabla vacía", 860));
    show(q(s, ".cd"), S(10)); show(q(s, ".tb"), S(10) + 0.1);
    show(q(s, ".sw"), at("sin", S(10)) - 0.2);
    const tb = at("borra", S(10));
    qa(s, ".tr").forEach((r, k) => {
      tl.to(r, { backgroundColor: "#ff9b8a", duration: 0.15 }, tb - 0.2 + k * 0.12);
      tl.to(r, { autoAlpha: 0, x: 80, duration: 0.3, ease: "power2.in" }, tb + k * 0.12);
    });
    slide(q(s, ".vc"), at("tabla", S(10)) - 0.2);
  }

  // ===== 11 · No hay botón de deshacer: si ya se confirmó, es permanente =====
  {
    const s = mk(11, `<div class="bt" style="left:290px;top:260px;width:500px;height:170px;border-radius:30px;background:#eceef5;border:4px solid #1d2433;box-shadow:12px 12px 0 #1d2433;display:flex;align-items:center;justify-content:center">
      <span class="iso-t iso-m" style="position:relative">↺ deshacer</span></div>` + svg(cross(540, 345, 90, "x")) +
      chip("teal cf", "✓ confirmado", 540, 600) + C("iso-h coral pm", "permanente", 680));
    grow(q(s, ".bt"), S(11) + 0.1, 0.4);
    grow(q(s, ".x"), at("deshacer", S(11)) - 0.1, 0.35);
    show(q(s, ".cf"), at("confirmo", S(11)) - 0.4);
    slide(q(s, ".pm"), at("permanente", S(11)) - 0.5);
  }

  // ===== 12 · Antes de cambiar o borrar: un SELECT con el mismo WHERE y revisa cuántas filas salen =====
  {
    const s = mk(12, chip("teal t1", "✓ antes de cambiar o borrar", 540, 140) +
      code("cd", 70, 220, 940, [`${KW("SELECT")} * ${KW("FROM")} clientes`, `${KW("WHERE")} nombre = 'Ana';`], 40) +
      tbl("tb", 110, 470, 860, "", COLS, [CLI[0]], W3) + C("iso-m teal cf", "1 fila: ¡bien!", 720));
    show(q(s, ".t1"), S(12));
    slide(q(s, ".cd"), at("select", S(12)) - 0.3);
    hideLine(s, 1); show(q(s, ".k1"), at("where", S(12)) - 0.3, 0.2);
    slide(q(s, ".tb"), at("revisa", S(12)) - 0.2);
    slide(q(s, ".cf"), at("filas", S(12)) - 0.3);
  }

  // ===== 13 · Hazlo dentro de una transacción: si algo sale mal, la deshaces antes de confirmar =====
  {
    const s = mk(13, `<div class="wrap" style="left:60px;top:160px;width:960px;height:330px;border:5px dashed #4a47b8;border-radius:28px;background:rgba(74,71,184,0.07)"></div>` +
      chip("indigo tx", "transacción", 540, 160) + code("cd", 110, 220, 860, [`${KW("UPDATE")} clientes`, `${KW("SET")} ciudad = 'Antigua';`], 38) +
      chip("coral mal", "algo sale mal", 300, 600) + chip("teal ds", "↺ la deshaces", 760, 600) + chip("amber ac", "antes de confirmar", 540, 720));
    show(q(s, ".wrap"), at("dentro", S(13)) - 0.4, 0.4);
    grow(q(s, ".tx"), at("transaccion", S(13)) - 0.3, 0.35);
    show(q(s, ".cd"), at("dentro", S(13)) - 0.2);
    show(q(s, ".mal"), at("mal", S(13)) - 0.4);
    grow(q(s, ".ds"), at("deshaces", S(13)) - 0.3, 0.3);
    show(q(s, ".ac"), at("confirmar", S(13)) - 0.4);
  }

  // ===== 14 · Una palabra olvidada no se convierte en un desastre =====
  {
    const s = mk(14, `<div class="iso-row" style="top:250px"><div class="w" style="display:flex;gap:20px;align-items:center"><span class="iso-chip teal" style="position:relative;font:700 80px 'DM Mono',monospace;padding:10px 34px">WHERE</span><span style="font:700 80px Outfit,sans-serif;color:#178a6c">✓</span></div></div>` +
      C("iso-m t", "una palabra", 460) + C("iso-h coral d", "sin desastre", 560));
    grow(q(s, ".w"), S(14), 0.45);
    slide(q(s, ".t"), at("palabra", S(14)) - 0.2);
    slide(q(s, ".d"), at("desastre", S(14)) - 0.5);
  }

  // ===== 15 · Próximo video: juntar dos tablas en una sola consulta =====
  {
    const sp = space(540, 640, 40);
    const s = mk(15, chip("pv", "en el próximo video", 540, 150) + C("iso-h indigo jt", "juntar dos tablas", 230) +
      svg(`<g class="a">${sp.box(-7, -1, 0, 4, 4, 2.4, "indigo")}${sp.label("left", -6.6, 3, 0.9, "clientes", 0.8, 'fill="#ffffff"')}</g>
        <g class="b">${sp.box(2.5, -4.5, 0, 4, 4, 2.4, "teal")}${sp.label("left", 2.9, -0.5, 0.9, "compras", 0.8, 'fill="#ffffff"')}</g>`) +
      chip("amber sc", "en una sola consulta", 540, 960));
    show(q(s, ".pv"), S(15));
    slide(q(s, ".jt"), at("juntar", S(15)) - 0.4);
    drop(q(s, ".a"), at("tablas", S(15)) - 0.3); drop(q(s, ".b"), at("tablas", S(15)) - 0.1);
    show(q(s, ".sc"), at("consulta", S(15)) - 0.3);
    const tj = at("juntos", S(15));
    tl.to(q(s, ".a"), { x: 70, y: -40, duration: 0.5, ease: "power2.inOut" }, tj - 0.3);
    tl.to(q(s, ".b"), { x: -70, y: 40, duration: 0.5, ease: "power2.inOut" }, tj - 0.3);
  }

  // ===== 16 · Cierre =====
  {
    const sp = space(540, 640, 44);
    const cube = sp.box(-1.5, -1.5, 0, 3, 3, 3, "indigo") + sp.box(-1.5, -1.5, 3.2, 3, 3, 0.6, "amber");
    const s = mk(16, C("iso-h", "Sígueme", 200) + C("iso-m indigo l1", "para seguir aprendiendo", 330) + svg(`<g class="cb">${cube}</g>`) +
      C("iso-m l2", "cómo funciona la tecnología", 860) + C("iso-m coral l3", "por dentro", 950));
    slide(q(s, ".iso-h"), S(16));
    slide(q(s, ".l1"), at("seguir", S(16)) - 0.2);
    drop(q(s, ".cb"), S(16) + 0.5, 200, 0.6);
    slide(q(s, ".l2"), at("como", S(16)) - 0.2);
    slide(q(s, ".l3"), at("dentro", S(16)) - 0.2);
  }
};
