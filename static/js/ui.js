(function () {
  const LS_FONT = "ss_font_px";
  const LS_NIGHT = "ss_night";
  const LS_LAST = "ss_last_path";

  const root = document.documentElement;
  const body = document.body;

  // Restore font size
  const savedFont = parseInt(localStorage.getItem(LS_FONT) || "", 10);
  if (!Number.isNaN(savedFont)) {
    root.style.setProperty("--font", savedFont + "px");
  }

  // Restore night mode
  const night = localStorage.getItem(LS_NIGHT);
  if (night === "1") body.classList.add("night");

  // Save last visited page (exclude homepage)
  if (location.pathname !== "/") {
    localStorage.setItem(LS_LAST, location.pathname);
  }

  function currentFont() {
    const val = getComputedStyle(root).getPropertyValue("--font").trim();
    const n = parseInt(val.replace("px",""), 10);
    return Number.isNaN(n) ? 20 : n;
  }

  function setFont(px) {
    const clamped = Math.max(16, Math.min(34, px));
    root.style.setProperty("--font", clamped + "px");
    localStorage.setItem(LS_FONT, String(clamped));
  }

  const inc = document.getElementById("incFont");
  const dec = document.getElementById("decFont");
  const tog = document.getElementById("toggleNight");

  if (inc) inc.addEventListener("click", () => setFont(currentFont() + 1));
  if (dec) dec.addEventListener("click", () => setFont(currentFont() - 1));
  if (tog) tog.addEventListener("click", () => {
    body.classList.toggle("night");
    localStorage.setItem(LS_NIGHT, body.classList.contains("night") ? "1" : "0");
  });

  // Optional: homepage auto-continue button support
  const cont = document.querySelector("[data-continue]");
  if (cont) {
    const last = localStorage.getItem(LS_LAST);
    if (last) cont.setAttribute("href", last);
    else cont.remove(); // hide if nothing to continue
  }
})();

// Hide top/bottom bars while reading (show only near top)
(() => {
  const THRESHOLD = 40; // px from top
  const cls = "ui-hidden";

  function apply() {
    if (window.scrollY > THRESHOLD) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
  }

  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("load", apply);
  apply();
})();
