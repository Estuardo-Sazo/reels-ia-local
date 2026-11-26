// Episodio 005: ¿programar en 2027? Lo que dicen los datos sobre la IA y el oficio.
// Primer episodio con el tema EDITORIAL (fondo claro, tipografía gigante, cortes secos).
window.EPISODE_TAG = "FUTURO — 005";
window.EPISODE_THEME = "editorial";
window.buildEpisode = function ({ tl, scene, at, S, E, setBg, countUp, slam, lines, strike, rise }) {
  const sc = (i, html) => {
    const el = scene(i, html);
    el.classList.add("ed-scene");
    return el;
  };

  // 0 — "En 2027 ya nadie va a programar"… los datos dicen otra cosa
  {
    const el = sc(0, `
      <div class="ed-kicker">dicen que en</div>
      <div class="ed-huge">2027</div>
      <div class="ed-big"><span class="ln"><span>ya <span class="strike">nadie<i class="strike-bar"></i></span> va a</span></span><span class="ln"><span>programar.</span></span></div>
      <div class="ed-serif ed-red"><span class="ln"><span>Los datos cuentan otra historia.</span></span></div>`);
    rise(el.querySelector(".ed-kicker"), 0, 0.4, 20);
    slam(el.querySelector(".ed-huge"), 0.15);
    lines(el.querySelector(".ed-big"), at("nadie", 0) - 0.3);
    strike(el.querySelector(".strike"), at("datos", 0) - 0.2);
    lines(el.querySelector(".ed-serif"), at("datos", 0));
  }

  // 1 — Google: 75 % del código nuevo lo genera la IA… y lo aprueban ingenieros
  {
    const el = sc(1, `
      <div class="ed-kicker">Google · abril 2026</div>
      <div class="ed-huge"><span class="num">0</span><span class="ed-red">%</span></div>
      <div class="ed-big" style="font-size:84px"><span class="ln"><span>del código nuevo</span></span><span class="ln"><span>lo genera la IA.</span></span></div>
      <div class="ed-box">…y lo aprueban ingenieros.</div>`);
    rise(el.querySelector(".ed-kicker"), S(1), 0.4, 20);
    countUp(el.querySelector(".num"), 0, 75, at("setenta", S(1)), 1.2);
    lines(el.querySelector(".ed-big"), at("codigo", S(1)) - 0.2);
    slam(el.querySelector(".ed-box"), at("ojo", S(1)), 1.3);
  }

  // 2 — METR: lo que creían vs. la realidad
  {
    const el = sc(2, `
      <div class="ed-kicker">estudio METR · devs expertos</div>
      <div class="ed-split">
        <div><div class="ed-kicker">lo que creían</div><div class="ed-big">+20%</div><div class="ed-serif" style="font-size:64px">más rápidos</div></div>
        <div><div class="ed-kicker">la realidad</div><div class="ed-big ed-red">−19%</div><div class="ed-serif ed-red" style="font-size:64px">más lentos</div></div>
      </div>`);
    rise(el.querySelector(".ed-kicker"), S(2), 0.4, 20);
    const [believed, real] = el.querySelectorAll(".ed-split > div");
    tl.fromTo(el.querySelector(".ed-split"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" }, S(2) + 0.3);
    // Primero se dice la realidad (−19 %), luego lo que creían (+20 %)
    const tReal = at("diecinueve", S(2)) - 0.2;
    const tBelieved = at("creian", S(2)) - 0.3;
    slam(real.querySelector(".ed-big"), tReal, 1.5);
    tl.fromTo(real.querySelector(".ed-serif"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, tReal + 0.3);
    slam(believed.querySelector(".ed-big"), tBelieved, 1.5);
    tl.fromTo(believed.querySelector(".ed-serif"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, tBelieved + 0.3);
  }

  // 3 — Stack Overflow 2026: < 7 % confía en la IA para decisiones importantes
  {
    const dots = Array.from({ length: 100 }, () => "<i></i>").join("");
    const el = sc(3, `
      <div class="ed-kicker">encuesta Stack Overflow 2026 · 30.903 respuestas</div>
      <div class="ed-dots">${dots}</div>
      <div class="ed-big" style="font-size:78px"><span class="ln"><span><span class="ed-red">&lt; 7%</span> confía en la IA</span></span><span class="ln"><span>para decisiones</span></span><span class="ln"><span>importantes.</span></span></div>`);
    rise(el.querySelector(".ed-kicker"), S(3), 0.4, 20);
    const ds = el.querySelectorAll(".ed-dots i");
    ds.forEach((d, i) => tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.25, ease: "power4.out" }, S(3) + 0.3 + i * 0.012));
    const tRed = at("siete", S(3)) - 0.1;
    [0, 1, 2, 3, 4, 5, 6].forEach((k, i) => tl.set(ds[k], { backgroundColor: "#d42a12" }, tRed + i * 0.06));
    lines(el.querySelector(".ed-big"), at("confia", S(3)) - 0.3);
  }

  // 4 — Lo que cambia: menos teclear, más decidir
  {
    const el = sc(4, `
      <div class="ed-kicker">lo que cambia no es si programas, sino qué haces</div>
      <div class="ed-huge" style="font-size:190px"><span class="ln"><span>menos <span class="strike">teclear<i class="strike-bar"></i></span></span></span></div>
      <div class="ed-huge ed-red" style="font-size:190px"><span class="ln"><span>más decidir.</span></span></div>`);
    rise(el.querySelector(".ed-kicker"), S(4) + 0.1, 0.4, 20);
    const [a, b] = el.querySelectorAll(".ed-huge");
    lines(a, at("menos", S(4)) - 0.3);
    strike(el.querySelector(".strike"), at("teclear", S(4)) + 0.3);
    lines(b, at("decidir", S(4)) - 0.4);
  }

  // 5 — Las habilidades que suben de valor
  {
    const items = [["01", "Diseñar sistemas"], ["02", "Revisar código ajeno"], ["03", "Escribir especificaciones"], ["04", "Entender seguridad"]];
    const el = sc(5, `
      <div class="ed-kicker">habilidades que suben de valor</div>
      <div class="ed-list">${items.map(([n, t]) => `<div><b>${n}</b><span>${t}</span><em>↑</em></div>`).join("")}</div>`);
    rise(el.querySelector(".ed-kicker"), S(5), 0.4, 20);
    const rows = el.querySelectorAll(".ed-list > div");
    ["diseñar", "revisar", "especificaciones", "seguridad"].forEach((w, i) =>
      tl.fromTo(rows[i], { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power4.out" }, at(w, S(5)) - 0.3));
  }

  // 6 — La IA escribe el código. Tú respondes por él. (escena invertida)
  {
    const el = sc(6, `
      <div class="ed-big"><span class="ln"><span>La IA escribe</span></span><span class="ln"><span>el código.</span></span></div>
      <div class="ed-serif ed-red" style="font-size:150px"><span class="ln"><span>Tú respondes</span></span><span class="ln"><span>por él.</span></span></div>`);
    el.classList.add("ed-inverse");
    setBg("#111111", S(6));
    // Cabecera en color papel mientras el fondo es negro
    const head = [document.getElementById("tag"), document.querySelector(".ed-counter")];
    tl.set(head, { color: "#f1ede4" }, S(6));
    tl.set(head, { color: "#111111" }, S(7));
    tl.set(".ed-rules i", { backgroundColor: "#f1ede4" }, S(6));
    tl.set(".ed-rules i", { backgroundColor: "#111111" }, S(7));
    lines(el.querySelector(".ed-big"), S(6) + 0.1);
    lines(el.querySelector(".ed-serif"), at("respondes", S(6)) - 0.3);
  }

  // 7 — Llamada a la acción
  {
    const el = sc(7, `
      <div class="ed-huge" style="font-size:230px">Sígueme</div>
      <div class="ed-serif ed-red"><span class="ln"><span>para no quedarte atrás.</span></span></div>`);
    setBg("#f1ede4", S(7));
    slam(el.querySelector(".ed-huge"), S(7), 1.6);
    lines(el.querySelector(".ed-serif"), S(7) + 0.5);
  }
};
