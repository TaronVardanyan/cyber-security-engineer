// Runs in <head> before first paint: saved choice, else the OS preference.
// Kept as a file (not inline) so the CSP can forbid inline scripts.
(function () {
  var t; try { t = localStorage.getItem("theme"); } catch (e) {}
  if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = t;
})();
