// Episodio 004: "cosecha ahora, descifra después" y la criptografía post-cuántica.
// Primer episodio con el tema BLUEPRINT (HUD futurista, movimiento fluido).
window.EPISODE_TAG = "// FUTURO 004";
window.EPISODE_THEME = "blueprint";
window.buildEpisode = function ({ tl, scene, at, S, E, rise, reveal, draw, countUp, typeText }) {
  const HEX = "8f3a e91c 07d2 b44e 1a9f c3d0 5e71 aa08 6b2c f019 d7e4 3c88 902b e5af 41d6 0c7e";

  // 0 — Gancho: alguien intercepta y guarda tus datos cifrados
  {
    const el = scene(0, `
      <div class="bp-label">◉ interceptando tráfico cifrado…</div>
      <div class="bp-glass bp-hex"><div class="bp-mono hex" data-layout-ignore></div></div>
      <div class="bp-timeline">
        <div class="bp-tl-track"><div class="bp-tl-fill"></div><div class="bp-tl-dot"></div></div>
        <div class="bp-tl-labels"><span>HOY · guardado</span><span class="hot">+10 AÑOS · descifrado</span></div>
      </div>`);
    rise(el.querySelector(".bp-label"), 0, 0.5);
    rise(el.querySelector(".bp-hex"), 0.1);
    typeText(el.querySelector(".hex"), `${HEX} ${HEX}`, 0.2, 90);
    const tTl = at("leerlos", 0) - 0.4;
    rise(el.querySelector(".bp-timeline"), tTl - 0.3, 0.5);
    tl.fromTo(el.querySelector(".bp-tl-fill"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, tTl);
    tl.fromTo(el.querySelector(".bp-tl-dot"), { left: "0%" }, { left: "100%", duration: 1.4, ease: "power2.inOut" }, tTl);
  }

  // 1 — Cosecha ahora, descifra después + computadora cuántica
  {
    const el = scene(1, `
      <div class="bp-title">Cosecha ahora,</div>
      <div class="bp-title hot">descifra después.</div>
      <svg class="bp-atom" viewBox="-120 -120 240 240">
        <circle r="16" fill="#4de8ff"/>
        <g class="orb"><ellipse rx="105" ry="36" fill="none" stroke="#4de8ff" stroke-width="3"/></g>
        <g class="orb"><ellipse rx="105" ry="36" fill="none" stroke="#ff4fd8" stroke-width="3" transform="rotate(60)"/></g>
        <g class="orb"><ellipse rx="105" ry="36" fill="none" stroke="#ffffff" stroke-width="3" transform="rotate(-60)"/></g>
      </svg>
      <div class="bp-label">computadora cuántica</div>`);
    const [t1, t2] = el.querySelectorAll(".bp-title");
    reveal(t1, at("cosecha", S(1)) - 0.1, 0.6);
    reveal(t2, at("descifra", S(1)) - 0.1, 0.6);
    const atom = el.querySelector(".bp-atom");
    const tQ = at("llave", S(1));
    tl.fromTo(atom, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "expo.out" }, tQ);
    el.querySelectorAll(".orb").forEach((o, i) =>
      tl.fromTo(o, { rotation: 0 }, { rotation: i % 2 ? -360 : 360, duration: 6, ease: "none", svgOrigin: "0 0" }, tQ));
    rise(el.querySelector(".bp-label"), at("cuantica", S(1)) - 0.2, 0.5);
  }

  // 2 — RSA y ECC protegen internet; Shor los rompe
  {
    const lock = (name, sub) => `
      <div class="bp-glass bp-lock"><div class="lock-ico">🔒</div><div class="bp lock-name">${name}</div><div class="bp-label">${sub}</div>
      <div class="bp-broken">VULNERABLE</div></div>`;
    const el = scene(2, `
      <div class="bp-label">lo que protege internet hoy</div>
      <div class="bp-row">${lock("RSA", "N = p × q")}${lock("ECC", "curvas elípticas")}</div>
      <div class="bp-glass bp-shor"><span class="bp-mono">algoritmo de Shor</span> → factoriza en tiempo polinómico</div>`);
    rise(el.querySelector(".bp-label"), S(2), 0.5);
    const locks = el.querySelectorAll(".bp-lock");
    rise(locks[0], at("rsa", S(2)) - 0.1);
    rise(locks[1], at("curvas", S(2)) - 0.1);
    const tShor = at("shor", S(2));
    rise(el.querySelector(".bp-shor"), at("algoritmo", S(2)) - 0.2);
    locks.forEach((l, i) => {
      tl.to(l, { borderColor: "rgba(255,79,216,0.9)", boxShadow: "0 0 60px rgba(255,79,216,0.35)", duration: 0.3 }, at("romperlos", S(2)) + i * 0.15);
      tl.fromTo(l.querySelector(".bp-broken"), { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "expo.out" }, at("romperlos", S(2)) + i * 0.15);
    });
  }

  // 3 — De 20 millones a menos de un millón de qubits
  {
    const el = scene(3, `
      <div class="bp-label">qubits estimados para romper RSA-2048</div>
      <div class="bp-chart">
        <div class="bar-col"><div class="bar-val bp" id="v19">0</div><div class="bar b19"></div><div class="bp-mono">2019</div></div>
        <div class="bar-col"><div class="bar-val bp hot" id="v25">0</div><div class="bar b25"></div><div class="bp-mono">2025</div></div>
      </div>
      <div class="bp-glass bp-note"><span class="bp-mono">Gidney (Google), 2025</span> · &lt; 1 semana de cálculo</div>`);
    rise(el.querySelector(".bp-label"), S(3), 0.5);
    const t19 = at("veinte", S(3));
    tl.fromTo(el.querySelector(".b19"), { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "expo.out" }, t19);
    countUp(el.querySelector("#v19"), 0, 20000000, t19, 1.2);
    const t25 = at("bajo", S(3));
    tl.fromTo(el.querySelector(".b25"), { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "expo.out" }, t25);
    tl.fromTo(el.querySelector("#v25"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, t25);
    countUp(el.querySelector("#v25"), 20000000, 1000000, t25, 1.4, (v) => "< " + Math.round(v).toLocaleString("en-US"));
    rise(el.querySelector(".bp-note"), t25 + 0.5);
  }

  // 4 — NIST: estándares post-cuánticos y calendario
  {
    const el = scene(4, `
      <div class="bp-glass bp-std"><div class="bp-label">NIST · FIPS 203</div><div class="bp-title">ML-KEM</div><div class="bp-mono">basado en retículas (lattices)</div></div>
      <svg class="bp-cal-line" viewBox="0 0 900 20"><line x1="10" y1="10" x2="890" y2="10" stroke="#4de8ff" stroke-width="4"/></svg>
      <div class="bp-cal">
        <div><b>2024</b><span>estándares PQC</span></div>
        <div><b>2030</b><span>retirar RSA / ECC</span></div>
        <div class="hot"><b>2035</b><span>prohibidos</span></div>
      </div>`);
    rise(el.querySelector(".bp-std"), S(4) + 0.3);
    const tCal = at("retirar", S(4)) - 0.6;
    draw(el.querySelector(".bp-cal-line line"), tCal, 0.9);
    el.querySelectorAll(".bp-cal > div").forEach((d, i) => rise(d, tCal + 0.25 * i, 0.6, 30));
  }

  // 5 — Ya lo usas: 2/3 del tráfico humano en Cloudflare
  {
    const C = 2 * Math.PI * 150;
    const el = scene(5, `
      <div class="bp-ring">
        <svg viewBox="-180 -180 360 360">
          <circle r="150" fill="none" stroke="rgba(77,232,255,0.15)" stroke-width="28"/>
          <circle class="arc" r="150" fill="none" stroke="#4de8ff" stroke-width="28" stroke-linecap="round" transform="rotate(-90)"
            stroke-dasharray="${C}" stroke-dashoffset="${C}"/>
        </svg>
        <div class="ring-val bp">0%</div>
      </div>
      <div class="bp-label">del tráfico humano en Cloudflare usa ML&#8209;KEM híbrido</div>
      <div class="bp-row chips"><span>Chrome</span><span>Firefox</span><span>Safari</span><span>Edge</span></div>`);
    const tR = at("tercios", S(5)) - 0.3;
    rise(el.querySelector(".bp-ring"), S(5) + 0.1, 0.6);
    tl.to(el.querySelector(".arc"), { strokeDashoffset: C * (1 - 0.67), duration: 1.4, ease: "expo.out" }, tR);
    countUp(el.querySelector(".ring-val"), 0, 67, tR, 1.4, (v) => `${Math.round(v)}%`);
    rise(el.querySelector(".bp-label"), tR + 0.3, 0.5);
    el.querySelectorAll(".chips span").forEach((c, i) => rise(c, at("hibrido", S(5)) - 0.3 + i * 0.12, 0.5, 24));
  }

  // 6 — Qué hacer si programas
  {
    const item = (n, title, sub) => `
      <div class="bp-glass bp-check"><svg viewBox="0 0 40 40"><path d="M8 21 L17 30 L33 11" fill="none" stroke="#4de8ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div><div class="bp check-title">${n}. ${title}</div><div class="bp-label">${sub}</div></div></div>`;
    const el = scene(6, `
      <div class="bp-label">si programas</div>
      <div class="bp-col list">
        ${item(1, "Inventario criptográfico", "¿dónde usas RSA / ECC?")}
        ${item(2, "Librerías al día", "OpenSSL 3.5+, BoringSSL, liboqs")}
        ${item(3, "Cripto-agilidad", "cambiar de algoritmo sin reescribir")}
      </div>`);
    rise(el.querySelector(".bp-label"), S(6), 0.5);
    const items = el.querySelectorAll(".bp-check");
    ["inventario", "actualiza", "diseña"].forEach((w, i) => {
      const t = at(w, S(6)) - 0.2;
      rise(items[i], t, 0.6, 40);
      draw(items[i].querySelector("path"), t + 0.3, 0.5);
    });
  }

  // 7 — Llamada a la acción
  {
    const el = scene(7, `
      <div class="bp-title">Sígueme</div>
      <div class="bp-mono cta-mono">// prepárate para la tecnología que viene</div>`);
    reveal(el.querySelector(".bp-title"), S(7), 0.7);
    rise(el.querySelector(".cta-mono"), S(7) + 0.5, 0.6);
  }
};
