// =============================================================
//  PRO LIMPEE - bootstrap da landing
// =============================================================

import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/manrope";
import "./style.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initScene } from "./scene.js";
import { initForm } from "./form.js";
import { CONTACT, whatsappLink, phoneLink } from "./config.js";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ---------- Liga os links de contato (fonte unica: config.js) ----------
function wireContactLinks() {
  document.querySelectorAll(".js-wa").forEach((el) => {
    el.setAttribute("href", whatsappLink());
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  document.querySelectorAll(".js-phone").forEach((el) => {
    el.setAttribute("href", phoneLink());
  });
  document
    .querySelectorAll(".js-phone-text")
    .forEach((el) => (el.textContent = CONTACT.phoneDisplay.includes("00")
      ? "Ligar agora"
      : CONTACT.phoneDisplay));
  document
    .querySelectorAll(".js-wa-text")
    .forEach((el) => (el.textContent = "Toque para conversar agora"));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

// ---------- Navegacao ----------
function wireNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  ScrollTrigger.create({
    start: "top -40",
    end: 99999,
    onUpdate: (self) => {
      nav.classList.toggle("scrolled", self.scroll() > 40);
    },
  });
  // estado inicial
  nav.classList.toggle("scrolled", window.scrollY > 40);

  if (toggle) {
    toggle.addEventListener("click", () => nav.classList.toggle("menu-open"));
    nav.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("menu-open"))
    );
  }
}

// ---------- Reveals ----------
function wireReveals() {
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
    return;
  }
  document.querySelectorAll(".reveal").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 86%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
  });
}

// ---------- Processo: pan horizontal preso (Section 5.B) ----------
function wireHorizontalProcess() {
  const wrap = document.querySelector(".process-pin");
  const track = document.querySelector(".process-track");
  if (!wrap || !track) return;

  if (reduceMotion || window.innerWidth < 860) {
    // fallback: rolagem horizontal manual
    wrap.style.overflowX = "auto";
    track.style.paddingBlock = "60px";
    return;
  }

  const getDistance = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: wrap,
      start: "top top",
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

// ---------- Conecta o scroll global a cena 3D ----------
function wireScene() {
  const canvas = document.getElementById("scene-canvas");
  if (!canvas) return;

  let scene3d;
  try {
    scene3d = initScene(canvas);
  } catch (err) {
    console.warn("Cena 3D indisponivel, seguindo sem ela.", err);
    canvas.style.display = "none";
    return;
  }

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => scene3d.setScroll(self.progress),
  });
}

// ---------- Init ----------
function init() {
  wireContactLinks();
  wireNav();
  wireReveals();
  wireHorizontalProcess();
  wireScene();
  initForm();

  // garante medidas corretas apos carregar fontes/imagens
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
