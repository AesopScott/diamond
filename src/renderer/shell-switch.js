const SHELL_STORAGE_KEY = "diamond.shell";
const SHELL_ROUTES = {
  legacy: "./legacy-shell.html",
  levercast: "./posts-prototype.html",
};

const params = new URLSearchParams(window.location.search);
const requestedShell = normalizeShell(params.get("shell"));
const storedShell = normalizeShell(window.localStorage.getItem(SHELL_STORAGE_KEY));
const selectedShell = requestedShell || storedShell || "legacy";

if (requestedShell) {
  window.localStorage.setItem(SHELL_STORAGE_KEY, requestedShell);
}

window.location.replace(SHELL_ROUTES[selectedShell]);

function normalizeShell(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.hasOwn(SHELL_ROUTES, normalized) ? normalized : "";
}
