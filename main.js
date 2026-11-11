const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const loader = $("#loader");

$("#yr").textContent = new Date().getFullYear();
setInterval(() => ($("#clock").textContent = new Date().toISOString().slice(11, 19) + " UTC"), 1000);

/* ---------- theme toggle ---------- */
const root = document.documentElement;
const toggle = $("#theme-toggle");
const syncToggle = () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  $(".ti", toggle).textContent = next === "light" ? "☀" : "☾";
  $(".tl", toggle).textContent = next;
  toggle.setAttribute("aria-label", `Switch to ${next} theme`);
};
const setTheme = t => {
  root.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch (e) {}
  syncToggle();
};
syncToggle();
toggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  if (!window.gsap || reduce) return setTheme(next);
  // glitch-stripe wipe sweeps in, theme swaps while covered, sweeps out
  gsap.timeline()
    .set("#wipe", { transformOrigin: "left center" })
    .to("#wipe", { scaleX: 1, duration: 0.35, ease: "power4.in" })
    .call(() => setTheme(next))
    .to("main, .nav", { x: 8, skewX: -6, duration: 0.05, repeat: 3, yoyo: true, ease: "steps(1)" })
    .set("main, .nav", { clearProps: "transform" })
    .set("#wipe", { transformOrigin: "right center" })
    .to("#wipe", { scaleX: 0, duration: 0.45, ease: "power4.out" });
});

if (!window.gsap) {
  loader.remove(); // CDN blocked: show the static page
} else {
  gsap.registerPlugin(ScrollTrigger);
  init();
}

/* text scramble: reveals `text` left→right through random glyphs */
const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEF$%&";
function scramble(el, text = el.dataset.final ?? el.textContent, duration = 0.9) {
  el.dataset.final = text;
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1, duration, ease: "none", overwrite: true,
    onUpdate() {
      const n = Math.floor(o.p * text.length);
      el.textContent = text.slice(0, n) +
        [...text.slice(n)].map(c => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    },
    onComplete() { el.textContent = text; },
  });
}

function init() {
  rain();
  cursor();

  if (reduce) { loader.remove(); return; }

  /* ---------- boot sequence ---------- */
  const lines = [
    "[ OK ] Initializing kernel modules...",
    "[ OK ] Mounting encrypted volume /dev/tv-sec",
    "[ OK ] Loading SIEM connectors: splunk, chronicle",
    "[ OK ] Suricata IDS ruleset synced",
    "[ OK ] MITRE ATT&CK matrix loaded",
    "[WARN] Unknown visitor detected... granting access",
    "> ACCESS GRANTED. Welcome.",
  ];
  const boot = $("#boot");
  const tl = gsap.timeline({ onComplete: intro });
  lines.forEach(l => tl.call(() => (boot.textContent += l + "\n"), null, "+=0.22"));
  tl.to(".loader-bar span", { width: "100%", duration: lines.length * 0.22, ease: "power1.in" }, 0)
    .to(loader, { clipPath: "inset(50% 0 50% 0)", duration: 0.5, ease: "power4.in" }, "+=0.25")
    .set(loader, { display: "none" });
  loader.addEventListener("click", () => tl.progress(1));

  gsap.set(".hero-name .glitch", { yPercent: 110, skewY: 8 });
  gsap.set([".role", ".lead", ".cta .btn", ".hud", ".scroll-hint", ".nav"], { autoAlpha: 0 });

  scrollAnimations();
}

function intro() {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.add(scramble($("#hero-tag"), undefined, 1))
    .to(".hero-name .glitch", { yPercent: 0, skewY: 0, duration: 1.3, stagger: 0.15 }, 0.1)
    .from(".hero-name", { letterSpacing: "0.3em", duration: 1.6 }, 0.1)
    .to(".nav", { autoAlpha: 1, duration: 0.8 }, 0.5)
    .fromTo(".role", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.7)
    .fromTo(".lead", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.85)
    .fromTo(".cta .btn", { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1 }, 1)
    .to(".hud", { autoAlpha: 1, duration: 0.3, stagger: 0.08, ease: "steps(3)" }, 1.1)
    .to(".scroll-hint", { autoAlpha: 1 }, 1.4)
    .call(roleLoop, null, 1.6)
    .call(glitchBursts, null, 2);
  $$("[data-scramble]").forEach(a => a.addEventListener("mouseenter", () => scramble(a, undefined, 0.5)));
}

function roleLoop() {
  const roles = ["Cyber Security Engineer", "SOC Analyst", "ISC2 Certified in Cybersecurity", "Google Cybersecurity Professional", "Detection & Response", "Software Engineer · 7+ yrs"];
  let i = 0;
  const el = $("#role");
  gsap.delayedCall(2.6, function next() {
    i = (i + 1) % roles.length;
    scramble(el, roles[i], 0.8);
    gsap.delayedCall(2.8, next);
  });
}

/* random hard glitch jolts on the hero name */
function glitchBursts() {
  const names = $$(".hero-name .glitch");
  (function burst() {
    const t = names[(Math.random() * names.length) | 0];
    gsap.timeline()
      .to(t, { x: () => gsap.utils.random(-12, 12), skewX: () => gsap.utils.random(-20, 20), duration: 0.05, repeat: 5, yoyo: true, ease: "steps(1)" })
      .set(t, { x: 0, skewX: 0 });
    gsap.delayedCall(gsap.utils.random(2, 5), burst);
  })();
}

function scrollAnimations() {
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  // hero parallax out
  gsap.to(".hero-inner", { yPercent: -30, autoAlpha: 0.1, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".grid-floor", { backgroundPosition: "0 600px, 0 0", ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  // marquee driven by scroll velocity
  const mq = gsap.to(".marquee-track", { xPercent: -50, duration: 25, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate: self => {
      const v = Math.abs(self.getVelocity() / 300);
      gsap.to(mq, { timeScale: gsap.utils.clamp(1, 6, v) * self.direction, duration: 0.2, overwrite: true });
      gsap.to(mq, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
    },
  });

  // section titles: slide + scramble
  $$(".sec-title").forEach(h => {
    const txt = $(".sec-text", h);
    gsap.from(h, {
      x: -60, autoAlpha: 0, duration: 0.9, ease: "power4.out",
      scrollTrigger: { trigger: h, start: "top 85%", onEnter: () => scramble(txt, undefined, 1) },
    });
  });

  // active nav link
  $$("section[id]").forEach(s => ScrollTrigger.create({
    trigger: s, start: "top center", end: "bottom center",
    onToggle: ({ isActive }) => isActive && $$(".nav nav a").forEach(a => a.classList.toggle("active", a.hash === "#" + s.id)),
  }));

  // about
  gsap.from(".about-text p", { y: 40, autoAlpha: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".about-text", start: "top 80%" } });
  $$(".stat").forEach((s, i) => {
    const b = $("b", s);
    gsap.from(s, {
      x: 80, autoAlpha: 0, duration: 0.9, delay: i * 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".stats", start: "top 80%" },
      onStart: () => gsap.to({ v: 0 }, { v: +b.dataset.count, duration: 1.6, ease: "power2.out", onUpdate() { b.textContent = Math.round(this.targets()[0].v); } }),
    });
  });

  // certs: unfold in 3D
  gsap.from(".cert", { rotateX: -70, y: 100, autoAlpha: 0, transformOrigin: "50% 0%", duration: 1.2, stagger: 0.2, ease: "expo.out", scrollTrigger: { trigger: ".cert-grid", start: "top 80%" } });
  gsap.from(".cert .chips li", { scale: 0, autoAlpha: 0, stagger: 0.04, duration: 0.4, ease: "back.out(3)", scrollTrigger: { trigger: ".cert-grid", start: "top 65%" } });

  // skills
  gsap.from(".skill", { y: 80, autoAlpha: 0, clipPath: "inset(0 0 100% 0)", duration: 1, stagger: 0.1, ease: "power4.out", scrollTrigger: { trigger: ".skill-grid", start: "top 80%" } });
  gsap.from(".skill li", { x: -20, autoAlpha: 0, stagger: 0.025, duration: 0.4, ease: "power2.out", scrollTrigger: { trigger: ".skill-grid", start: "top 70%" } });
  gsap.from(".op", { x: i => (i % 2 ? 100 : -100), autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".ops", start: "top 85%" } });

  // timeline: line draws with scroll, jobs pop in
  gsap.from(".tl-line span", { scaleY: 0, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: 0.5 } });
  $$(".job").forEach(j => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: j, start: "top 78%" } });
    tl.from($(".node", j), { scale: 0, rotate: 225, duration: 0.6, ease: "back.out(3)" })
      .from(j.children, { x: 50, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.1);
    tl.add(() => scramble($(".when", j), undefined, 0.6), 0.1);
  });

  // labs: cards slide in from opposite sides, stats count up
  gsap.from(".lab", { x: i => (i ? 120 : -120), autoAlpha: 0, rotateY: i => (i ? -25 : 25), duration: 1.1, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".lab-grid", start: "top 80%" } });
  gsap.from(".lab-parts li", { x: -30, autoAlpha: 0, stagger: 0.12, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".lab-parts", start: "top 85%" } });
  $$(".lab-stats b").forEach(b => gsap.to({ v: 0 }, {
    v: +b.dataset.count, duration: 2, ease: "power2.out",
    scrollTrigger: { trigger: ".lab-stats", start: "top 85%" },
    onUpdate() { b.textContent = Math.round(this.targets()[0].v).toLocaleString("en-US"); },
  }));

  // contact terminal types the command, then reveals output
  const typed = $(".typed");
  const out = $(".term-out");
  gsap.set(out.children, { autoAlpha: 0, y: 10 });
  gsap.from(".terminal", {
    scale: 0.92, autoAlpha: 0, duration: 0.8, ease: "power3.out",
    scrollTrigger: { trigger: ".terminal", start: "top 80%" },
    onComplete() {
      const txt = typed.dataset.text;
      gsap.timeline()
        .to({ n: 0 }, { n: txt.length, duration: txt.length * 0.04, ease: "none", onUpdate() { typed.textContent = txt.slice(0, this.targets()[0].n | 0); } })
        .to(out.children, { autoAlpha: 1, y: 0, stagger: 0.25, duration: 0.4 }, "+=0.3");
    },
  });

  // 3D tilt + glow follow
  if (fine) $$(".tilt").forEach(card => {
    // plain tween, not quickTo: the scroll intros also animate rotateX/Y and would break a quickTo
    const tilt = (x, y) => gsap.to(card, { rotateX: x, rotateY: y, duration: 0.5, ease: "power3", overwrite: "auto" });
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tilt((0.5 - py) * 14, (px - 0.5) * 14);
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
    });
    card.addEventListener("pointerleave", () => tilt(0, 0));
  });

  // magnetic buttons
  if (fine) $$(".magnetic").forEach(b => {
    // plain tween: hero buttons also get an intro y-tween, which breaks quickTo
    const pull = (x, y) => gsap.to(b, { x, y, duration: 0.4, ease: "power3", overwrite: "auto" });
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      pull((e.clientX - r.left - r.width / 2) * 0.35, (e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener("pointerleave", () => pull(0, 0));
  });
}

function cursor() {
  if (!fine) return;
  const ring = $("#cursor"), dot = $("#cursor-dot");
  const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", e => { rx(e.clientX); ry(e.clientY); gsap.set(dot, { x: e.clientX, y: e.clientY }); });
  $$("a, button, .tilt").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}

/* hex / katakana digital rain on canvas */
function rain() {
  const cv = $("#rain"), ctx = cv.getContext("2d");
  const chars = "アイウエオカキクケコサシスセソ0123456789ABCDEF<>/{}#$";
  const size = 16;
  let cols = [];
  const resize = () => {
    cv.width = innerWidth; cv.height = innerHeight;
    cols = Array.from({ length: Math.ceil(cv.width / size) }, () => Math.random() * -50);
  };
  resize();
  addEventListener("resize", resize);
  if (reduce) return;
  let last = 0;
  gsap.ticker.add(t => {
    if (t - last < 0.05) return; // ~20fps is plenty for ambience
    last = t;
    const css = getComputedStyle(root);
    const [bg, c, m] = ["--bg", "--c", "--m"].map(v => css.getPropertyValue(v).trim());
    ctx.globalAlpha = 0.12; // fade old glyphs into the current theme's background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = 1;
    ctx.font = size + "px Share Tech Mono, monospace";
    cols.forEach((y, i) => {
      ctx.fillStyle = Math.random() > 0.97 ? m : c;
      ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, y * size);
      cols[i] = y * size > cv.height && Math.random() > 0.975 ? 0 : y + 1;
    });
  });
}
