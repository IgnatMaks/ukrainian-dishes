/* Страви України — невеликий скрипт: меню, пауза анімації, пошук страв, вкладки */
(function () {
  "use strict";

  /* меню на телефоні */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* анімація: пауза/відновлення (для тих, кого відволікає рух) */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-anim]").forEach(function (img) {
    var anim = img.getAttribute("data-anim");
    var poster = img.getAttribute("data-poster");
    var holder = img.closest(".arch, .anim-box");
    var b = holder ? holder.querySelector(".pause") : null;
    var pic = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
    var sources = pic ? Array.prototype.slice.call(pic.querySelectorAll("source")) : [];
    sources.forEach(function (s) { s.setAttribute("data-srcset", s.getAttribute("srcset")); });
    var playing = !reduce;
    function apply() {
      /* <source srcset> має пріоритет над src, тому на паузі прибираємо його */
      sources.forEach(function (s) {
        if (playing) s.setAttribute("srcset", s.getAttribute("data-srcset"));
        else s.removeAttribute("srcset");
      });
      img.src = playing ? anim : poster;
      if (b) {
        b.textContent = playing ? "Пауза" : "Запустити";
        b.setAttribute("aria-pressed", playing ? "false" : "true");
      }
    }
    if (b) b.addEventListener("click", function () { playing = !playing; apply(); });
    if (reduce) apply();
  });

  /* пошук і фільтр страв на головній */
  var box = document.getElementById("finder");
  if (box) {
    var input = box.querySelector("input[type=search]");
    var chips = box.querySelectorAll(".chip");
    var items = box.querySelectorAll(".dish-grid li");
    var empty = box.querySelector(".empty");
    var kind = "all";
    var norm = function (s) {
      return s.toLowerCase().replace(/[’'ʼ`]/g, "").trim();
    };
    function run() {
      var q = norm(input.value), shown = 0;
      items.forEach(function (li) {
        var hay = norm(li.getAttribute("data-key") || "");
        var ok = (kind === "all" || li.getAttribute("data-kind") === kind) && (!q || hay.indexOf(q) !== -1);
        li.hidden = !ok;
        if (ok) shown++;
      });
      empty.classList.toggle("show", shown === 0);
    }
    input.addEventListener("input", run);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        kind = c.getAttribute("data-kind");
        run();
      });
    });
  }

  /* вкладки (начинки вареників) */
  document.querySelectorAll(".tabs").forEach(function (t) {
    var tabs = t.querySelectorAll("[role=tab]");
    var panels = t.querySelectorAll("[role=tabpanel]");
    function pick(i, focus) {
      tabs.forEach(function (x, k) {
        var on = k === i;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
        if (on && focus) x.focus();
      });
    }
    tabs.forEach(function (x, i) {
      x.addEventListener("click", function () { pick(i, false); });
      x.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); pick((i + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); pick((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  });
})();
