const DB_KEY = "despesas_pwa_v1";

function loadDespesas() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao carregar:", e);
    return [];
  }
}

function saveDespesas(items) {
  localStorage.setItem(DB_KEY, JSON.stringify(items));
}