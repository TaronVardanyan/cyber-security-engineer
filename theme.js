// Runs in <head> before first paint: the visitor's saved choice, else dark.
// Kept as a file (not inline) so the CSP can forbid inline scripts.
(function () {
  var t; try { t = localStorage.getItem("theme"); } catch (e) {}
  if (t !== "light") t = "dark";
  document.documentElement.dataset.theme = t;
})();
