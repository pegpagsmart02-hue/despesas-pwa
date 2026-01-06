function parseBRL(input) {
  // aceita "25,90" ou "25.90" ou "1.234,56"
  const v = String(input).trim()
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pad2(x) { return String(x).padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return ${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())};
}

let despesas = [];

function getMesISO(dateISO) {
  // "2026-01-05" -> "2026-01"
  return String(dateISO).slice(0, 7);
}

function render() {
  const tbody = document.getElementById("lista");
  const totalEl = document.getElementById("total");
  const filtroMes = document.getElementById("filtroMes").value;

  const view = filtroMes
    ? despesas.filter(d => getMesISO(d.data) === filtroMes)
    : despesas;

  // total
  const total = view.reduce((acc, d) => acc + d.valor, 0);
  totalEl.textContent = Total: ${formatBRL(total)};

  // lista
  if (view.length === 0) {
    tbody.innerHTML = <tr><td colspan="5" class="muted">Nenhuma despesa nesse filtro.</td></tr>;
    return;
  }

  // ordena por data desc
  view.sort((a,b) => (a.data < b.data ? 1 : -1));

  tbody.innerHTML = view.map(d => `
    <tr>
      <td>${d.data.split("-").reverse().join("/")}</td>
      <td>${escapeHtml(d.desc)}</td>
      <td>${escapeHtml(d.cat)}</td>
      <td>${formatBRL(d.valor)}</td>
      <td><button data-id="${d.id}" class="secondary" style="padding:6px 10px;">Excluir</button></td>
    </tr>
  `).join("");

  // botão excluir
  tbody.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      despesas = despesas.filter(x => x.id !== id);
      saveDespesas(despesas);
      render();
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("DOMContentLoaded", () => {
  // carregar
  despesas = loadDespesas();

  // defaults
  document.getElementById("data").value = todayISO();
  document.getElementById("filtroMes").value = getMesISO(todayISO());

  // form submit
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const desc = document.getElementById("desc").value.trim();
    const valorRaw = document.getElementById("valor").value;
    const data = document.getElementById("data").value;
    const cat = document.getElementById("cat").value;

    const valor = parseBRL(valorRaw);
    if (!desc) return alert("Digite uma descrição.");
    if (!data) return alert("Selecione uma data.");
    if (!Number.isFinite(valor) || valor <= 0) return alert("Valor inválido.");

    const item = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      desc,
      valor,
      data,
      cat
    };

    despesas.push(item);
    saveDespesas(despesas);

    // limpar campos
    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("data").value = todayISO();

    render();
  });

  // filtro mês
  document.getElementById("filtroMes").addEventListener("change", render);

  // limpar tudo
  document.getElementById("limpar").addEventListener("click", () => {
    if (!confirm("Tem certeza que deseja apagar todas as despesas?")) return;
    despesas = [];
    saveDespesas(despesas);
    render();
  });

  // service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  }

  render();
});