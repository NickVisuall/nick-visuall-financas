(() => {
  "use strict";

  const STORAGE_KEY = "nickVisuallFinancas:v1";
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  const shortMonthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

  const elements = {
    currentMonthLabel: document.querySelector("#currentMonthLabel"),
    shoppingMonthLabel: document.querySelector("#shoppingMonthLabel"),
    monthlySpend: document.querySelector("#monthlySpend"),
    plannedItems: document.querySelector("#plannedItems"),
    completionRate: document.querySelector("#completionRate"),
    completionHelper: document.querySelector("#completionHelper"),
    excessCount: document.querySelector("#excessCount"),
    forecastSpend: document.querySelector("#forecastSpend"),
    estimatedSaving: document.querySelector("#estimatedSaving"),
    trendBadge: document.querySelector("#trendBadge"),
    trendBars: document.querySelector("#trendBars"),
    coverageBars: document.querySelector("#coverageBars"),
    itemsBody: document.querySelector("#itemsBody"),
    shoppingList: document.querySelector("#shoppingList"),
    listProgress: document.querySelector("#listProgress"),
    resultsText: document.querySelector("#resultsText"),
    searchInput: document.querySelector("#searchInput"),
    categoryFilter: document.querySelector("#categoryFilter"),
    stateFilter: document.querySelector("#stateFilter"),
    clearFiltersBtn: document.querySelector("#clearFiltersBtn"),
    addItemBtn: document.querySelector("#addItemBtn"),
    exportBtn: document.querySelector("#exportBtn"),
    backupBtn: document.querySelector("#backupBtn"),
    restoreBtn: document.querySelector("#restoreBtn"),
    restoreInput: document.querySelector("#restoreInput"),
    resetBtn: document.querySelector("#resetBtn"),
    toast: document.querySelector("#toast")
  };

  let state = loadState();
  let toastTimer;
  ensureMonthRecords();
  saveState();
  bindEvents();
  render();

  function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function shiftMonth(key, amount) {
    const [year, month] = key.split("-").map(Number);
    return monthKey(new Date(year, month - 1 + amount, 1));
  }

  function dateFromMonth(key) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function currentMonth() {
    return monthKey(new Date());
  }

  function makeDefaultState() {
    const current = currentMonth();
    const previous = shiftMonth(current, -1);
    const older = shiftMonth(current, -2);
    const items = [
      { id: "arroz", name: "Arroz", category: "Mercearia", ideal: 4 },
      { id: "feijao", name: "Feijão", category: "Mercearia", ideal: 4 },
      { id: "leite", name: "Leite", category: "Laticínios", ideal: 12 },
      { id: "ovos", name: "Ovos", category: "Frios e ovos", ideal: 4 },
      { id: "cafe", name: "Café", category: "Mercearia", ideal: 2 },
      { id: "frango", name: "Frango", category: "Carnes", ideal: 5 },
      { id: "papel", name: "Papel higiênico", category: "Higiene", ideal: 2 },
      { id: "detergente", name: "Detergente", category: "Limpeza", ideal: 4 }
    ];

    return {
      version: 1,
      items,
      months: {
        [older]: recordsFrom(items, [
          [4, 39.6, true], [4, 29.2, true], [11, 57.2, true], [4, 69.9, true],
          [2, 35.8, true], [5, 94.5, true], [2, 44.9, true], [4, 13.2, true]
        ]),
        [previous]: recordsFrom(items, [
          [4, 41.4, true], [5, 38, true], [12, 67.2, true], [4, 76, true],
          [2, 37.8, true], [5, 110, true], [2, 52.8, true], [4, 14.4, true]
        ]),
        [current]: recordsFrom(items, [
          [5, 44.9, true], [4, 31.6, true], [10, 55.9, false], [3, 62.7, true],
          [2, 39.8, false], [4, 86.4, false], [1, 26.9, false], [6, 18.6, false]
        ])
      }
    };
  }

  function recordsFrom(items, values) {
    return Object.fromEntries(items.map((item, index) => {
      const [purchased, spent, checked] = values[index] || [0, 0, false];
      return [item.id, { purchased, spent, checked }];
    }));
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return makeDefaultState();
      return normalizeState(JSON.parse(stored));
    } catch (error) {
      console.warn("Não foi possível carregar os dados locais.", error);
      return makeDefaultState();
    }
  }

  function normalizeState(candidate) {
    if (!candidate || !Array.isArray(candidate.items) || typeof candidate.months !== "object" || !candidate.months) {
      throw new Error("Formato de dados inválido");
    }

    const items = candidate.items.map((item, index) => ({
      id: String(item.id || `item-${index + 1}`),
      name: String(item.name || "Item sem nome"),
      category: String(item.category || "Outros"),
      ideal: toNonNegative(item.ideal)
    }));
    const months = {};

    Object.entries(candidate.months).forEach(([key, records]) => {
      if (!/^\d{4}-\d{2}$/.test(key) || !records || typeof records !== "object") return;
      months[key] = {};
      items.forEach((item) => {
        const record = records[item.id] || {};
        months[key][item.id] = {
          purchased: toNonNegative(record.purchased),
          spent: toNonNegative(record.spent),
          checked: Boolean(record.checked)
        };
      });
    });

    return { version: 1, items, months };
  }

  function ensureMonthRecords() {
    const key = currentMonth();
    if (!state.months[key]) state.months[key] = {};
    state.items.forEach((item) => {
      if (!state.months[key][item.id]) {
        state.months[key][item.id] = { purchased: 0, spent: 0, checked: false };
      }
    });
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Não foi possível salvar os dados locais.", error);
      showToast("Não foi possível salvar neste navegador.");
    }
  }

  function recordFor(itemId, key = currentMonth()) {
    return state.months[key]?.[itemId] || { purchased: 0, spent: 0, checked: false };
  }

  function averageSpend(itemId) {
    const months = Object.keys(state.months).filter((key) => state.months[key]?.[itemId]);
    const total = months.reduce((sum, key) => sum + toNonNegative(state.months[key][itemId].spent), 0);
    return { value: months.length ? total / months.length : 0, months: months.length };
  }

  function unitAverage(itemId) {
    const records = Object.values(state.months).map((recordsByItem) => recordsByItem[itemId]).filter(Boolean);
    const purchased = records.reduce((sum, record) => sum + toNonNegative(record.purchased), 0);
    const spent = records.reduce((sum, record) => sum + toNonNegative(record.spent), 0);
    return purchased ? spent / purchased : 0;
  }

  function excessFor(item, key = currentMonth()) {
    return Math.max(0, recordFor(item.id, key).purchased - item.ideal);
  }

  function shortageFor(item, key) {
    return Math.max(0, item.ideal - recordFor(item.id, key).purchased);
  }

  function toBuyFor(item) {
    return Math.max(0, item.ideal - recordFor(item.id).purchased);
  }

  function totalForMonth(key) {
    return state.items.reduce((sum, item) => sum + recordFor(item.id, key).spent, 0);
  }

  function filteredItems() {
    const query = elements.searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const category = elements.categoryFilter.value;
    const filterState = elements.stateFilter.value;

    return state.items.filter((item) => {
      const record = recordFor(item.id);
      const matchesQuery = !query || item.name.toLocaleLowerCase("pt-BR").includes(query);
      const matchesCategory = !category || item.category === category;
      let matchesState = true;
      if (filterState === "pending") matchesState = !record.checked;
      if (filterState === "done") matchesState = record.checked;
      if (filterState === "excess") matchesState = excessFor(item) > 0;
      return matchesQuery && matchesCategory && matchesState;
    });
  }

  function render() {
    renderLabels();
    renderCategoryFilter();
    renderMetrics();
    renderAnalytics();
    renderMainTable();
    renderShoppingList();
  }

  function renderLabels() {
    const date = dateFromMonth(currentMonth());
    const label = capitalize(monthFormatter.format(date));
    elements.currentMonthLabel.textContent = label;
    elements.currentMonthLabel.dateTime = currentMonth();
    elements.shoppingMonthLabel.textContent = label;
  }

  function renderCategoryFilter() {
    const currentValue = elements.categoryFilter.value;
    const categories = [...new Set(state.items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    elements.categoryFilter.innerHTML = `<option value="">Todas as categorias</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
    if (categories.includes(currentValue)) elements.categoryFilter.value = currentValue;
  }

  function renderMetrics() {
    const items = state.items;
    const currentRecords = items.map((item) => recordFor(item.id));
    const checked = currentRecords.filter((record) => record.checked).length;
    const completion = items.length ? Math.round((checked / items.length) * 100) : 0;
    const forecast = items.reduce((sum, item) => sum + item.ideal * unitAverage(item.id), 0);
    const currentSpend = totalForMonth(currentMonth());

    elements.monthlySpend.textContent = formatMoney(currentSpend);
    elements.plannedItems.textContent = String(items.length);
    elements.completionRate.textContent = `${completion}%`;
    elements.completionHelper.textContent = `${checked} de ${items.length} itens`;
    elements.excessCount.textContent = String(items.filter((item) => excessFor(item) > 0).length);
    elements.forecastSpend.textContent = formatMoney(forecast);
    elements.estimatedSaving.textContent = formatMoney(forecast - currentSpend);
    elements.estimatedSaving.style.color = forecast - currentSpend < 0 ? "var(--red)" : "var(--green)";
    elements.listProgress.textContent = `${checked} de ${items.length}`;
  }

  function renderAnalytics() {
    const keys = [shiftMonth(currentMonth(), -2), shiftMonth(currentMonth(), -1), currentMonth()];
    const values = keys.map(totalForMonth);
    const max = Math.max(...values, 1);
    elements.trendBars.innerHTML = keys.map((key, index) => barMarkup(
      capitalize(shortMonthFormatter.format(dateFromMonth(key)).replace(".", "")),
      Math.round((values[index] / max) * 100),
      formatMoney(values[index])
    )).join("");

    const previous = values[1];
    const current = values[2];
    if (!previous) {
      elements.trendBadge.textContent = "histórico local";
    } else {
      const difference = Math.round(((current - previous) / previous) * 100);
      elements.trendBadge.textContent = difference === 0 ? "igual ao mês passado" : `${Math.abs(difference)}% ${difference > 0 ? "acima" : "abaixo"}`;
    }

    const ideal = state.items.reduce((sum, item) => sum + item.ideal, 0);
    const purchased = state.items.reduce((sum, item) => sum + recordFor(item.id).purchased, 0);
    const remaining = state.items.reduce((sum, item) => sum + toBuyFor(item), 0);
    const excess = state.items.reduce((sum, item) => sum + excessFor(item), 0);
    const scale = Math.max(ideal, purchased, 1);
    elements.coverageBars.innerHTML = [
      barMarkup("Comprado", Math.min(100, Math.round((purchased / scale) * 100)), `${formatQuantity(purchased)} un.`),
      barMarkup("Falta comprar", Math.min(100, Math.round((remaining / scale) * 100)), `${formatQuantity(remaining)} un.`),
      barMarkup("Em excesso", Math.min(100, Math.round((excess / scale) * 100)), `${formatQuantity(excess)} un.`)
    ].join("");
  }

  function barMarkup(label, percentage, value) {
    return `<div class="bar-row"><span>${escapeHtml(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, percentage)}%"></div></div><strong>${escapeHtml(value)}</strong></div>`;
  }

  function renderMainTable() {
    const items = filteredItems();
    const previousKey = shiftMonth(currentMonth(), -1);
    elements.resultsText.textContent = `${items.length} de ${state.items.length} ${state.items.length === 1 ? "item exibido" : "itens exibidos"}`;

    if (!items.length) {
      elements.itemsBody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><strong>Nenhum item encontrado</strong>Limpe os filtros ou adicione um novo item.</div></td></tr>`;
      return;
    }

    elements.itemsBody.innerHTML = items.map((item) => {
      const average = averageSpend(item.id);
      const currentRecord = recordFor(item.id);
      const currentExcess = excessFor(item);
      const previousExcess = excessFor(item, previousKey);
      const previousShortage = shortageFor(item, previousKey);
      const rowState = purchaseStateClass(item, currentRecord);
      return `<tr class="${rowState}">
        <td>
          <input class="cell-input item-name-input" data-field="name" data-id="${escapeHtml(item.id)}" value="${escapeHtml(item.name)}" aria-label="Nome do item ${escapeHtml(item.name)}">
          <span class="category-tag">${escapeHtml(item.category)}</span>
        </td>
        <td><span class="money-value">${formatMoney(average.value)}</span><span class="money-helper">média de ${average.months} ${average.months === 1 ? "mês" : "meses"}</span></td>
        <td><input class="cell-input quantity-input" type="number" min="0" step="0.1" inputmode="decimal" data-field="ideal" data-id="${escapeHtml(item.id)}" value="${item.ideal}" aria-label="Quantidade ideal de ${escapeHtml(item.name)}"></td>
        <td><strong>${formatQuantity(currentRecord.purchased)}</strong><small>pela lista abaixo</small></td>
        <td>${badgeForExcess(currentExcess)}</td>
        <td>${badgeForExcess(previousExcess)}</td>
        <td>${badgeForShortage(previousShortage)}</td>
        <td><button class="delete-button" type="button" data-action="delete" data-id="${escapeHtml(item.id)}" aria-label="Excluir ${escapeHtml(item.name)}" title="Excluir item">×</button></td>
      </tr>`;
    }).join("");
  }

  function badgeForExcess(value) {
    return value > 0
      ? `<span class="status-badge warning">+${formatQuantity(value)} un.</span>`
      : `<span class="status-badge neutral">0 un.</span>`;
  }

  function badgeForShortage(value) {
    return value > 0
      ? `<span class="status-badge danger">−${formatQuantity(value)} un.</span>`
      : `<span class="status-badge success">0 un.</span>`;
  }

  function purchaseStateClass(item, record) {
    if (record.purchased > item.ideal) return "row-over";
    if (record.checked && record.purchased < item.ideal) return "row-saved";
    return "";
  }

  function renderShoppingList() {
    if (!state.items.length) {
      elements.shoppingList.innerHTML = `<div class="empty-state"><strong>Sua lista está vazia</strong>Adicione um item na tabela principal pelo computador.</div>`;
      return;
    }

    elements.shoppingList.innerHTML = state.items.map((item) => {
      const record = recordFor(item.id);
      const toBuy = toBuyFor(item);
      const rowState = purchaseStateClass(item, record);
      return `<div class="shopping-row${record.checked ? " is-checked" : ""}${rowState ? ` ${rowState}` : ""}" data-row-id="${escapeHtml(item.id)}">
        <label class="check-wrap">
          <input type="checkbox" data-field="checked" data-id="${escapeHtml(item.id)}" ${record.checked ? "checked" : ""} aria-label="Marcar ${escapeHtml(item.name)} como comprado">
          <span aria-hidden="true"></span>
        </label>
        <div class="shopping-item"><strong>${escapeHtml(item.name)}</strong><small>${toBuy ? `Faltam ${formatQuantity(toBuy)} de ${formatQuantity(item.ideal)}` : "Quantidade planejada atendida"}</small></div>
        <div class="shopping-field to-buy-field"><span>A comprar</span><strong>${formatQuantity(toBuy)}</strong></div>
        <label class="shopping-field purchased-field"><span>Comprado</span><input type="number" min="0" step="0.1" inputmode="decimal" data-field="purchased" data-id="${escapeHtml(item.id)}" value="${record.purchased}" aria-label="Quantidade de ${escapeHtml(item.name)} comprada"></label>
        <label class="shopping-field spent-field"><span>Valor gasto</span><input type="number" min="0" step="0.01" inputmode="decimal" data-field="spent" data-id="${escapeHtml(item.id)}" value="${record.spent}" aria-label="Valor gasto com ${escapeHtml(item.name)}"></label>
      </div>`;
    }).join("");
  }

  function bindEvents() {
    [elements.searchInput, elements.categoryFilter, elements.stateFilter].forEach((control) => {
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", () => renderMainTable());
    });

    elements.clearFiltersBtn.addEventListener("click", () => {
      elements.searchInput.value = "";
      elements.categoryFilter.value = "";
      elements.stateFilter.value = "";
      renderMainTable();
    });

    elements.itemsBody.addEventListener("change", (event) => {
      const field = event.target.dataset.field;
      const item = state.items.find((candidate) => candidate.id === event.target.dataset.id);
      if (!item || !field) return;
      if (field === "name") item.name = event.target.value.trim() || "Item sem nome";
      if (field === "ideal") item.ideal = toNonNegative(event.target.value);
      saveState();
      render();
      showToast("Alteração salva.");
    });

    elements.itemsBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action='delete']");
      if (!button) return;
      const item = state.items.find((candidate) => candidate.id === button.dataset.id);
      if (!item || !confirm(`Excluir “${item.name}” e todo o histórico desse item?`)) return;
      state.items = state.items.filter((candidate) => candidate.id !== item.id);
      Object.values(state.months).forEach((records) => delete records[item.id]);
      saveState();
      render();
      showToast("Item excluído.");
    });

    elements.shoppingList.addEventListener("change", (event) => {
      const field = event.target.dataset.field;
      const itemId = event.target.dataset.id;
      if (!field || !itemId) return;
      const record = recordFor(itemId);
      if (field === "checked") record.checked = event.target.checked;
      if (field === "purchased") record.purchased = toNonNegative(event.target.value);
      if (field === "spent") record.spent = toNonNegative(event.target.value);
      state.months[currentMonth()][itemId] = record;
      saveState();
      render();
      showToast("Lista atualizada.");
    });

    elements.addItemBtn.addEventListener("click", () => {
      const id = `item-${Date.now().toString(36)}`;
      state.items.push({ id, name: "Novo item", category: "Outros", ideal: 1 });
      state.months[currentMonth()][id] = { purchased: 0, spent: 0, checked: false };
      saveState();
      render();
      requestAnimationFrame(() => {
        const input = elements.itemsBody.querySelector(`[data-field="name"][data-id="${id}"]`);
        input?.select();
        input?.focus();
      });
    });

    elements.exportBtn.addEventListener("click", exportCsv);
    elements.backupBtn.addEventListener("click", downloadBackup);
    elements.restoreBtn.addEventListener("click", () => elements.restoreInput.click());
    elements.restoreInput.addEventListener("change", restoreBackup);
    elements.resetBtn.addEventListener("click", () => {
      if (!confirm("Restaurar os dados de exemplo? As alterações locais serão substituídas.")) return;
      state = makeDefaultState();
      saveState();
      render();
      showToast("Dados de exemplo restaurados.");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach((candidate) => candidate.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  function exportCsv() {
    const previousKey = shiftMonth(currentMonth(), -1);
    const rows = [["Item", "Categoria", "Média mensal gasta", "Quantidade ideal", "Comprado no mês", "Excesso no mês", "Excesso no mês passado", "Comprado a menos no mês passado", "Valor gasto no mês"]];
    state.items.forEach((item) => rows.push([
      item.name,
      item.category,
      averageSpend(item.id).value.toFixed(2),
      item.ideal,
      recordFor(item.id).purchased,
      excessFor(item),
      excessFor(item, previousKey),
      shortageFor(item, previousKey),
      recordFor(item.id).spent.toFixed(2)
    ]));
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\n");
    downloadFile(`compras-${currentMonth()}.csv`, csv, "text/csv;charset=utf-8");
    showToast("Planilha exportada.");
  }

  function downloadBackup() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), app: "Nick Visuall Finanças", ...state }, null, 2);
    downloadFile(`backup-financas-${new Date().toISOString().slice(0, 10)}.json`, payload, "application/json");
    showToast("Backup baixado.");
  }

  async function restoreBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const restored = normalizeState(JSON.parse(await file.text()));
      state = restored;
      ensureMonthRecords();
      saveState();
      render();
      showToast("Backup restaurado.");
    } catch (error) {
      console.warn("Backup inválido.", error);
      showToast("Este arquivo não é um backup válido.");
    }
  }

  function downloadFile(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
  }

  function toNonNegative(value) {
    const number = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function formatMoney(value) {
    return currency.format(Number.isFinite(value) ? value : 0);
  }

  function formatQuantity(value) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value || 0);
  }

  function capitalize(value) {
    return value ? value[0].toLocaleUpperCase("pt-BR") + value.slice(1) : value;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2100);
  }
})();
