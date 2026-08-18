(() => {
  "use strict";

  const STORAGE_KEY = "nickVisuallFinancas:v3";
  const LEGACY_KEY = "nickVisuallFinancas:v2";
  const DEFAULT_MARKET = "Atacadão Taipas";
  const DEFAULT_COLUMN_ORDER = ["item", "brand", "market", "ideal", "currentPurchased", "currentExcess", "previousExcess", "previousShortage"];
  const COLUMN_LABELS = {
    item: "Item", brand: "Marca (pela lista)", market: "Mercado (pela lista)", ideal: "Quantidade ideal / mês",
    currentPurchased: "Comprado no mês", currentExcess: "Excesso no mês", previousExcess: "Excesso no mês passado",
    previousShortage: "Comprado a menos no mês passado"
  };
  const DEFAULT_ITEMS = [
    ["fosforo", "Fósforo", "Paraná", "Utilidades", 1, 3.69], ["saco-lixo", "Saco de lixo", "Embalixo", "Limpeza", 1, 18.98],
    ["leite", "Leite", "Aurora", "Laticínios", 6, 4.99], ["arroz", "Arroz", "Sabor Máximo", "Mercearia", 1, 16.99],
    ["feijao", "Feijão", "Da Casa", "Mercearia", 3, 8.49], ["acucar", "Açúcar", "Caravelas", "Mercearia", 5, 2.94],
    ["oleo", "Óleo", "Soya", "Mercearia", 3, 7.49], ["sal-cisne", "Sal Cisne", "Cisne", "Mercearia", 1, 4.79],
    ["farofa", "Farofa", "Yoki", "Mercearia", 1, 6.49], ["farinha-mandioca", "Farinha de mandioca", "Gluten Free", "Mercearia", 1, 2.49],
    ["farinha-trigo", "Farinha de trigo", "Nita", "Mercearia", 1, 4.49], ["cuzcuz", "Cuzcuz", "Kisabor", "Mercearia", 1, 1.89],
    ["pipoca", "Pipoca", "Kisabor", "Mercearia", 1, 3.89], ["sabao-ype", "Sabão Ypê", "Ypê", "Limpeza", 4, 2.59],
    ["sabao-po-omo", "Sabão em pó Omo (1,6 kg)", "Omo", "Limpeza", 0.5, 28.9], ["sabao-coco", "Sabão de coco", "Urca", "Limpeza", 1, 2.99],
    ["pao", "Pão", "Atacadão", "Padaria", 1, 12.9], ["guardanapo", "Guardanapo", "Bellevue", "Utilidades", 2, 1.29],
    ["papel-toalha", "Papel toalha", "Extrusa-Pack", "Utilidades", 1, 16.98], ["papel-neve", "Papel Neve (12 un)", "Neve", "Higiene", 1, 32.9],
    ["papel-generico", "Papel genérico (16 un)", "Qualité", "Higiene", 1, 29.9], ["detergente", "Detergente", "Limpol", "Limpeza", 1, 2.4],
    ["bombril", "Bombril", "Bombril", "Limpeza", 4, 2.49], ["alcool", "Álcool (1 L)", "Tupi", "Limpeza", 0, 7.99],
    ["amaciante", "Amaciante (2 L)", "Minuano", "Limpeza", 0.5, 12.99], ["candida", "Cândida (2 L)", "Qboa", "Limpeza", 0.5, 9.99],
    ["bolacha-doce", "Bolacha doce", "Marilan", "Mercearia", 2, 4.99], ["bolacha-salgada", "Bolacha salgada", "Marilan", "Mercearia", 2, 4.49],
    ["macarrao", "Macarrão", "Renata", "Mercearia", 2, 3.49], ["queijo-ralado", "Queijo ralado", "Teixeira", "Laticínios", 4, 3.29],
    ["miojo", "Miojo", "Nissin", "Mercearia", 4, 2.29], ["massa-tomate", "Massa de tomate (850 g)", "Quero", "Mercearia", 1, 8.99],
    ["molho-tomate", "Molho de tomate", "Fugini", "Mercearia", 4, 1.49], ["cafe", "Café (500 g)", "3 Corações", "Mercearia", 2, 18.99],
    ["cha", "Chá", "Leão", "Mercearia", 2, 4.99], ["francis", "Francis", "Francis", "Higiene", 6, 2.29],
    ["pasta-dente", "Pasta de dente", "Sorriso", "Higiene", 1, 3.99], ["protex", "Protex", "Protex", "Higiene", 2, 3.99],
    ["vinagre-branco", "Vinagre branco", "Castelo", "Mercearia", 1, 2.99], ["margarina", "Margarina", "Doriana", "Laticínios", 1, 5.98],
    ["ovo", "Ovo", "Somai", "Frios e ovos", 1, 12.99]
  ].map(([id, name, brand, category, ideal, price]) => ({ id, name, brand, market: DEFAULT_MARKET, category, ideal, price }));
  const DEFAULTS = new Map(DEFAULT_ITEMS.map((item) => [item.id, item]));
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const monthLong = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const $ = (selector) => document.querySelector(selector);
  const el = Object.fromEntries([
    "currentMonthLabel", "shoppingMonthLabel", "monthlySpend", "plannedItems", "completionRate", "completionHelper", "excessCount",
    "forecastSpend", "estimatedSaving", "trendBadge", "trendBars", "coverageBars", "mainHeaderRow", "itemsBody", "shoppingList",
    "listProgress", "resultsText", "searchInput", "categoryFilter", "stateFilter", "clearFiltersBtn", "resetOrderBtn", "exportBtn",
    "backupBtn", "restoreBtn", "restoreInput", "resetBtn", "averageSearchInput", "averagePeriodFilter", "averageCategoryFilter",
    "clearAverageFiltersBtn", "averageMonthlySpend", "highestAverageItem", "highestAverageValue", "averageUnitPrice", "averageMonthsCount",
    "averageTrendBars", "averageItemBars", "averagesBody", "averagePeriodLabel", "averageResultsText", "toast"
  ].map((id) => [id, $(`#${id}`)]));
  let state = loadState(), toastTimer, draggedColumn, draggedItem;
  ensureCurrentMonth(); saveState(); bindEvents(); render();
  setView(location.hash === "#averages" ? "averages" : location.hash === "#ideas" ? "ideas" : "purchases");

  function currentKey() { return keyFromDate(new Date()); }
  function keyFromDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
  function dateFromKey(key) { const [y, m] = key.split("-").map(Number); return new Date(y, m - 1, 1); }
  function shiftKey(key, offset) { const d = dateFromKey(key); d.setMonth(d.getMonth() + offset); return keyFromDate(d); }
  function emptyRecord(price = 0) { return { purchased: 0, price: positive(price), checked: false }; }
  function defaultState() {
    const items = DEFAULT_ITEMS.map(({ price, ...item }) => ({ ...item }));
    return { version: 3, items, columnOrder: [...DEFAULT_COLUMN_ORDER], months: { [currentKey()]: Object.fromEntries(DEFAULT_ITEMS.map((item) => [item.id, emptyRecord(item.price)])) } };
  }
  function loadState() {
    try { const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY); return saved ? normalize(JSON.parse(saved)) : defaultState(); }
    catch (error) { console.warn(error); return defaultState(); }
  }
  function normalize(candidate) {
    if (!candidate?.items || !Array.isArray(candidate.items) || typeof candidate.months !== "object") throw new Error("Dados inválidos");
    const items = candidate.items.map((item, index) => {
      const fallback = DEFAULTS.get(String(item.id)) || {};
      return { id: String(item.id || `item-${index + 1}`), name: String(item.name || "Item sem nome"), brand: String(item.brand ?? fallback.brand ?? ""), market: String(item.market ?? fallback.market ?? DEFAULT_MARKET), category: String(item.category || fallback.category || "Outros"), ideal: positive(item.ideal) };
    });
    const months = {};
    Object.entries(candidate.months).forEach(([key, records]) => {
      if (!/^\d{4}-\d{2}$/.test(key) || !records) return;
      months[key] = {};
      items.forEach((item) => {
        const record = records[item.id] || {}, purchased = positive(record.purchased), fallback = DEFAULTS.get(item.id)?.price || 0;
        const migratedPrice = purchased ? positive(record.spent) / purchased : positive(record.spent);
        months[key][item.id] = { purchased, price: positive(record.price ?? migratedPrice) || fallback, checked: Boolean(record.checked) };
      });
    });
    const requested = Array.isArray(candidate.columnOrder) ? candidate.columnOrder : [];
    const valid = requested.filter((key, index) => DEFAULT_COLUMN_ORDER.includes(key) && requested.indexOf(key) === index);
    return { version: 3, items, months, columnOrder: [...valid, ...DEFAULT_COLUMN_ORDER.filter((key) => !valid.includes(key))] };
  }
  function latestPrice(id) { return Object.keys(state.months).sort().reverse().map((key) => state.months[key]?.[id]?.price).find((value) => value > 0) || DEFAULTS.get(id)?.price || 0; }
  function ensureCurrentMonth() { const key = currentKey(); state.months[key] ||= {}; state.items.forEach((item) => { state.months[key][item.id] ||= emptyRecord(latestPrice(item.id)); }); }
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { console.warn(error); toast("Não foi possível salvar neste navegador."); } }
  function record(id, key = currentKey()) { return state.months[key]?.[id] || emptyRecord(); }
  function hasRecord(id, key) { return Boolean(state.months[key] && Object.hasOwn(state.months[key], id)); }
  function spend(id, key = currentKey()) { const r = record(id, key); return r.purchased * r.price; }
  function total(key, items = state.items) { return items.reduce((sum, item) => sum + spend(item.id, key), 0); }
  function excess(item, key = currentKey()) { return Math.max(0, record(item.id, key).purchased - item.ideal); }
  function shortage(item, key) { return Math.max(0, item.ideal - record(item.id, key).purchased); }
  function previous(item) { const key = shiftKey(currentKey(), -1); return hasRecord(item.id, key) ? { available: true, excess: excess(item, key), shortage: shortage(item, key) } : { available: false, excess: 0, shortage: 0 }; }
  function rowClass(item) { const p = previous(item); return !p.available ? "" : p.excess > 0 ? "row-over" : p.shortage > 0 ? "row-saved" : ""; }
  function toBuy(item) { return Math.max(0, item.ideal - record(item.id).purchased); }

  function periodKeys() {
    const value = el.averagePeriodFilter.value, available = Object.keys(state.months).sort();
    if (value === "all") return available;
    const allowed = new Set(Array.from({ length: Number(value) || 3 }, (_, i) => shiftKey(currentKey(), -i)));
    return available.filter((key) => allowed.has(key));
  }
  function averages(item, keys = periodKeys()) {
    const records = keys.filter((key) => hasRecord(item.id, key)).map((key) => record(item.id, key)), months = records.length;
    const prices = records.filter((r) => r.price > 0);
    return { months, spend: months ? records.reduce((sum, r) => sum + r.purchased * r.price, 0) / months : 0, purchased: months ? records.reduce((sum, r) => sum + r.purchased, 0) / months : 0, price: prices.length ? prices.reduce((sum, r) => sum + r.price, 0) / prices.length : 0 };
  }
  function filteredItems() {
    const query = el.searchInput.value.trim().toLocaleLowerCase("pt-BR"), category = el.categoryFilter.value, status = el.stateFilter.value;
    return state.items.filter((item) => {
      const r = record(item.id), text = `${item.name} ${item.brand} ${item.market}`.toLocaleLowerCase("pt-BR");
      return (!query || text.includes(query)) && (!category || item.category === category) && (!status || status === "pending" && !r.checked || status === "done" && r.checked || status === "excess" && excess(item) > 0);
    });
  }
  function filteredAverageItems() {
    const query = el.averageSearchInput.value.trim().toLocaleLowerCase("pt-BR"), category = el.averageCategoryFilter.value;
    return state.items.filter((item) => (!query || `${item.name} ${item.brand} ${item.market}`.toLocaleLowerCase("pt-BR").includes(query)) && (!category || item.category === category));
  }

  function render() { renderLabels(); renderCategoryFilters(); renderMetrics(); renderTopCharts(); renderPlanning(); renderShopping(); renderAverages(); }
  function renderLabels() { const label = capitalize(monthLong.format(dateFromKey(currentKey()))); el.currentMonthLabel.textContent = label; el.currentMonthLabel.dateTime = currentKey(); el.shoppingMonthLabel.textContent = label; }
  function renderCategoryFilters() {
    const categories = [...new Set(state.items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    [el.categoryFilter, el.averageCategoryFilter].forEach((select) => { const current = select.value; select.innerHTML = `<option value="">Todas as categorias</option>${categories.map((category) => `<option value="${escape(category)}">${escape(category)}</option>`).join("")}`; if (categories.includes(current)) select.value = current; });
  }
  function renderMetrics() {
    const checked = state.items.filter((item) => record(item.id).checked).length, forecast = state.items.reduce((sum, item) => sum + item.ideal * latestPrice(item.id), 0), current = total(currentKey());
    el.monthlySpend.textContent = money(current); el.plannedItems.textContent = state.items.length; el.completionRate.textContent = `${state.items.length ? Math.round(checked / state.items.length * 100) : 0}%`;
    el.completionHelper.textContent = `${checked} de ${state.items.length} itens`; el.excessCount.textContent = state.items.filter((item) => excess(item) > 0).length;
    el.forecastSpend.textContent = money(forecast); el.estimatedSaving.textContent = money(forecast - current); el.estimatedSaving.style.color = forecast - current < 0 ? "var(--red)" : "var(--green)"; el.listProgress.textContent = `${checked} de ${state.items.length}`;
  }
  function renderTopCharts() {
    const keys = [shiftKey(currentKey(), -2), shiftKey(currentKey(), -1), currentKey()], values = keys.map((key) => total(key)), max = Math.max(...values, 1);
    el.trendBars.innerHTML = keys.map((key, i) => bar(capitalize(monthShort.format(dateFromKey(key)).replace(".", "")), values[i] / max * 100, money(values[i]))).join("");
    const old = values[1], current = values[2]; el.trendBadge.textContent = old ? `${Math.abs(Math.round((current - old) / old * 100))}% ${current > old ? "acima" : current < old ? "abaixo" : "igual"}` : "histórico local";
    const ideal = state.items.reduce((sum, item) => sum + item.ideal, 0), purchased = state.items.reduce((sum, item) => sum + record(item.id).purchased, 0), remaining = state.items.reduce((sum, item) => sum + toBuy(item), 0), over = state.items.reduce((sum, item) => sum + excess(item), 0), scale = Math.max(ideal, purchased, 1);
    el.coverageBars.innerHTML = [["Comprado", purchased], ["Falta comprar", remaining], ["Em excesso", over]].map(([label, value]) => bar(label, Math.min(100, value / scale * 100), `${qty(value)} un.`)).join("");
  }
  function bar(label, percent, value) { return `<div class="bar-row"><span>${escape(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, percent)}%"></div></div><strong>${escape(value)}</strong></div>`; }

  function renderPlanning() {
    el.mainHeaderRow.innerHTML = `${state.columnOrder.map((key) => `<th draggable="true" data-column-key="${key}" title="Arraste para mover"><span class="column-drag-handle">⋮⋮</span>${escape(COLUMN_LABELS[key])}</th>`).join("")}<th class="action-column"><span class="sr-only">Ações</span></th>`;
    const items = filteredItems(); el.resultsText.textContent = `${items.length} de ${state.items.length} itens exibidos`;
    el.itemsBody.innerHTML = items.length ? items.map((item) => `<tr class="${rowClass(item)}" data-item-id="${escape(item.id)}">${state.columnOrder.map((key) => planningCell(key, item)).join("")}<td><button class="delete-button" type="button" data-action="delete" data-id="${escape(item.id)}" aria-label="Excluir ${escape(item.name)}">×</button></td></tr>`).join("") : `<tr><td colspan="${state.columnOrder.length + 1}"><div class="empty-state">Nenhum item encontrado.</div></td></tr>`;
  }
  function planningCell(key, item) {
    const r = record(item.id), p = previous(item);
    if (key === "item") return `<td><div class="item-cell-wrap"><span class="row-drag-handle" draggable="true" tabindex="0" data-id="${escape(item.id)}">⋮⋮</span><div><input class="cell-input item-name-input" data-field="name" data-id="${escape(item.id)}" value="${escape(item.name)}"><span class="category-tag">${escape(item.category)}</span></div></div></td>`;
    if (key === "brand") return `<td><strong>${escape(item.brand || "—")}</strong><small>editável na lista</small></td>`;
    if (key === "market") return `<td><strong>${escape(item.market || "—")}</strong><small>editável na lista</small></td>`;
    if (key === "ideal") return `<td><input class="cell-input quantity-input" type="number" min="0" step="0.1" data-field="ideal" data-id="${escape(item.id)}" value="${item.ideal}"></td>`;
    if (key === "currentPurchased") return `<td><strong>${qty(r.purchased)}</strong><small>pela lista abaixo</small></td>`;
    if (key === "currentExcess") return `<td>${excessBadge(excess(item))}</td>`;
    if (key === "previousExcess") return `<td>${p.available ? excessBadge(p.excess) : noData()}</td>`;
    if (key === "previousShortage") return `<td>${p.available ? shortageBadge(p.shortage) : noData()}</td>`;
    return "<td>—</td>";
  }
  function excessBadge(value) { return value > 0 ? `<span class="status-badge warning">+${qty(value)} un.</span>` : `<span class="status-badge neutral">0 un.</span>`; }
  function shortageBadge(value) { return value > 0 ? `<span class="status-badge success">−${qty(value)} un.</span>` : `<span class="status-badge neutral">0 un.</span>`; }
  function noData() { return `<span class="status-badge neutral" title="Sem dados do mês passado">—</span>`; }

  function renderShopping() {
    const rows = state.items.map((item) => {
      const r = record(item.id), highlight = rowClass(item);
      return `<div class="shopping-row${r.checked ? " is-checked" : ""}${highlight ? ` ${highlight}` : ""}" data-item-id="${escape(item.id)}">
        <span class="row-drag-handle shopping-drag-handle" draggable="true" tabindex="0" data-id="${escape(item.id)}">⋮⋮</span>
        <label class="check-wrap"><input type="checkbox" data-field="checked" data-id="${escape(item.id)}" ${r.checked ? "checked" : ""}><span></span></label>
        <div class="shopping-item"><strong>${escape(item.name)}</strong><small>${toBuy(item) ? `Faltam ${qty(toBuy(item))} de ${qty(item.ideal)}` : "Quantidade planejada atendida"}</small></div>
        <label class="shopping-field brand-field"><span>Marca</span><input type="text" data-field="brand" data-id="${escape(item.id)}" value="${escape(item.brand)}"></label>
        <label class="shopping-field market-field"><span>Mercado</span><input type="text" data-field="market" data-id="${escape(item.id)}" value="${escape(item.market)}"></label>
        <div class="shopping-field to-buy-field"><span>A comprar</span><strong>${qty(toBuy(item))}</strong></div>
        <label class="shopping-field purchased-field"><span>Comprado</span><input type="number" min="0" step="0.1" data-field="purchased" data-id="${escape(item.id)}" value="${r.purchased}"></label>
        <label class="shopping-field price-field"><span>Preço</span><input type="number" min="0" step="0.01" data-field="price" data-id="${escape(item.id)}" value="${r.price}"></label>
      </div>`;
    }).join("");
    el.shoppingList.innerHTML = `${rows}<div class="shopping-row new-item-row" data-new-item-row>
      <span class="new-row-plus">+</span><span class="new-check-placeholder"></span>
      ${newField("name", "Novo item", "Escreva o item", "text", "new-name-field")}${newField("brand", "Marca", "Marca")}${newField("market", "Mercado", DEFAULT_MARKET, "text", "market-field")}${newField("ideal", "A comprar", "0", "number", "to-buy-field")}${newField("purchased", "Comprado", "0", "number", "purchased-field")}${newField("price", "Preço", "0,00", "number", "price-field")}
      <small class="new-item-help">Preencha o item e pressione Enter para adicionar</small>
    </div>`;
  }
  function newField(field, label, placeholder, type = "text", className = "brand-field") { return `<label class="shopping-field ${className}"><span>${label}</span><input type="${type}" ${type === "number" ? 'min="0" step="0.1"' : ""} data-new-field="${field}" placeholder="${escape(placeholder)}"></label>`; }

  function renderAverages() {
    const keys = periodKeys(), items = filteredAverageItems(), stats = items.map((item) => ({ item, ...averages(item, keys) }));
    const monthlyAverage = keys.length ? keys.reduce((sum, key) => sum + total(key, items), 0) / keys.length : 0, priced = stats.filter((row) => row.price > 0), highest = [...stats].sort((a, b) => b.spend - a.spend)[0];
    el.averageMonthlySpend.textContent = money(monthlyAverage); el.highestAverageItem.textContent = highest?.spend ? highest.item.name : "—"; el.highestAverageValue.textContent = highest?.spend ? money(highest.spend) : "sem compras registradas";
    el.averageUnitPrice.textContent = money(priced.length ? priced.reduce((sum, row) => sum + row.price, 0) / priced.length : 0); el.averageMonthsCount.textContent = keys.length; el.averageResultsText.textContent = `${items.length} itens no período selecionado.`; el.averagePeriodLabel.textContent = periodLabel(keys);
    const monthly = keys.map((key) => ({ key, value: total(key, items) })), maxMonth = Math.max(...monthly.map((entry) => entry.value), 1);
    el.averageTrendBars.innerHTML = monthly.length ? monthly.map(({ key, value }) => bar(capitalize(monthShort.format(dateFromKey(key)).replace(".", "")), value / maxMonth * 100, money(value))).join("") : chartEmpty();
    const top = stats.filter((row) => row.spend > 0).sort((a, b) => b.spend - a.spend).slice(0, 5), maxItem = Math.max(...top.map((row) => row.spend), 1);
    el.averageItemBars.innerHTML = top.length ? top.map((row) => bar(row.item.name, row.spend / maxItem * 100, money(row.spend))).join("") : chartEmpty();
    el.averagesBody.innerHTML = stats.length ? stats.map((row) => `<tr><td><strong>${escape(row.item.name)}</strong><small>${escape(row.item.category)}</small></td><td>${escape(row.item.brand || "—")}</td><td><strong>${money(row.spend)}</strong></td><td>${qty(row.purchased)} un.</td><td>${money(row.price)}</td><td>${row.purchased > row.item.ideal ? `<span class="status-badge warning">+${qty(row.purchased - row.item.ideal)}</span>` : row.purchased < row.item.ideal ? `<span class="status-badge success">−${qty(row.item.ideal - row.purchased)}</span>` : `<span class="status-badge neutral">0</span>`}</td><td>${row.months}</td></tr>`).join("") : `<tr><td colspan="7"><div class="empty-state">Nenhum item encontrado.</div></td></tr>`;
  }
  function periodLabel(keys) { if (!keys.length) return "Sem histórico"; if (keys.length === 1) return capitalize(monthLong.format(dateFromKey(keys[0]))); return `${capitalize(monthShort.format(dateFromKey(keys[0])).replace(".", ""))} – ${capitalize(monthShort.format(dateFromKey(keys.at(-1))).replace(".", ""))}`; }
  function chartEmpty() { return `<div class="chart-empty">Ainda não há compras nesse período.</div>`; }

  function bindEvents() {
    [el.searchInput, el.categoryFilter, el.stateFilter].forEach((control) => control.addEventListener(control.tagName === "INPUT" ? "input" : "change", renderPlanning));
    el.clearFiltersBtn.addEventListener("click", () => { el.searchInput.value = el.categoryFilter.value = el.stateFilter.value = ""; renderPlanning(); });
    [el.averageSearchInput, el.averagePeriodFilter, el.averageCategoryFilter].forEach((control) => control.addEventListener(control.tagName === "INPUT" ? "input" : "change", renderAverages));
    el.clearAverageFiltersBtn.addEventListener("click", () => { el.averageSearchInput.value = el.averageCategoryFilter.value = ""; el.averagePeriodFilter.value = "3"; renderAverages(); });
    el.itemsBody.addEventListener("change", handlePlanningChange); el.itemsBody.addEventListener("click", handleDelete);
    el.shoppingList.addEventListener("change", handleShoppingChange); el.shoppingList.addEventListener("keydown", handleNewItem);
    bindColumnDrag(); bindRowDrag(el.itemsBody); bindRowDrag(el.shoppingList);
    el.resetOrderBtn.addEventListener("click", resetOrder); el.exportBtn.addEventListener("click", exportCsv); el.backupBtn.addEventListener("click", backup);
    el.restoreBtn.addEventListener("click", () => el.restoreInput.click()); el.restoreInput.addEventListener("change", restore);
    el.resetBtn.addEventListener("click", () => { if (!confirm("Restaurar a lista das fotos e as referências do Atacadão Taipas?")) return; state = defaultState(); saveState(); render(); toast("Lista restaurada."); });
    document.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); setView(link.dataset.view); history.replaceState(null, "", link.getAttribute("href")); }));
  }
  function setView(view) { document.querySelectorAll(".purchase-view").forEach((node) => node.hidden = view !== "purchases"); $("#averages").hidden = view !== "averages"; $("#ideas").hidden = view !== "ideas"; document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view)); if (view === "averages") renderAverages(); }
  function handlePlanningChange(event) { const item = state.items.find((candidate) => candidate.id === event.target.dataset.id); if (!item) return; if (event.target.dataset.field === "name") item.name = event.target.value.trim() || "Item sem nome"; if (event.target.dataset.field === "ideal") item.ideal = positive(event.target.value); saveState(); render(); toast("Alteração salva."); }
  function handleDelete(event) { const button = event.target.closest("[data-action='delete']"); if (!button) return; const item = state.items.find((candidate) => candidate.id === button.dataset.id); if (!item || !confirm(`Excluir “${item.name}” e todo o histórico?`)) return; state.items = state.items.filter((candidate) => candidate.id !== item.id); Object.values(state.months).forEach((records) => delete records[item.id]); saveState(); render(); toast("Item excluído."); }
  function handleShoppingChange(event) {
    const field = event.target.dataset.field, id = event.target.dataset.id; if (!field || !id) return; const item = state.items.find((candidate) => candidate.id === id), r = record(id);
    if (field === "brand") item.brand = event.target.value.trim(); if (field === "market") item.market = event.target.value.trim(); if (field === "checked") r.checked = event.target.checked; if (field === "purchased") r.purchased = positive(event.target.value); if (field === "price") r.price = positive(event.target.value);
    state.months[currentKey()][id] = r; saveState(); render(); toast("Lista atualizada.");
  }
  function handleNewItem(event) {
    if (event.key !== "Enter" || !event.target.closest("[data-new-item-row]")) return; event.preventDefault(); const row = event.target.closest("[data-new-item-row]"), value = (field) => row.querySelector(`[data-new-field="${field}"]`)?.value.trim() || "", name = value("name");
    if (!name) { row.querySelector('[data-new-field="name"]')?.focus(); toast("Escreva o nome do novo item."); return; }
    const id = `item-${Date.now().toString(36)}`; state.items.push({ id, name, brand: value("brand"), market: value("market") || DEFAULT_MARKET, category: "Outros", ideal: positive(value("ideal")) }); state.months[currentKey()][id] = { purchased: positive(value("purchased")), price: positive(value("price")), checked: false }; saveState(); render(); requestAnimationFrame(() => el.shoppingList.querySelector('[data-new-field="name"]')?.focus()); toast(`${name} adicionado.`);
  }

  function bindColumnDrag() {
    el.mainHeaderRow.addEventListener("dragstart", (event) => { const header = event.target.closest("[data-column-key]"); if (!header) return; draggedColumn = header.dataset.columnKey; header.classList.add("is-dragging"); event.dataTransfer.effectAllowed = "move"; });
    el.mainHeaderRow.addEventListener("dragover", (event) => { const target = event.target.closest("[data-column-key]"); if (!target || target.dataset.columnKey === draggedColumn) return; event.preventDefault(); target.classList.add("drop-target"); });
    el.mainHeaderRow.addEventListener("dragleave", (event) => event.target.closest("[data-column-key]")?.classList.remove("drop-target"));
    el.mainHeaderRow.addEventListener("drop", (event) => { const target = event.target.closest("[data-column-key]"); if (!target || !draggedColumn) return; event.preventDefault(); moveBefore(state.columnOrder, draggedColumn, target.dataset.columnKey); saveState(); renderPlanning(); toast("Ordem das colunas salva."); });
    el.mainHeaderRow.addEventListener("dragend", () => { draggedColumn = null; el.mainHeaderRow.querySelectorAll(".is-dragging,.drop-target").forEach((node) => node.classList.remove("is-dragging", "drop-target")); });
  }
  function bindRowDrag(container) {
    container.addEventListener("dragstart", (event) => { const handle = event.target.closest(".row-drag-handle"); if (!handle) return; draggedItem = handle.dataset.id; handle.closest("[data-item-id]")?.classList.add("is-dragging"); event.dataTransfer.effectAllowed = "move"; });
    container.addEventListener("dragover", (event) => { const target = event.target.closest("[data-item-id]"); if (!target || target.dataset.itemId === draggedItem) return; event.preventDefault(); target.classList.add("row-drop-target"); });
    container.addEventListener("dragleave", (event) => event.target.closest("[data-item-id]")?.classList.remove("row-drop-target"));
    container.addEventListener("drop", (event) => { const target = event.target.closest("[data-item-id]"); if (!target || !draggedItem) return; event.preventDefault(); reorderItem(draggedItem, target.dataset.itemId); });
    container.addEventListener("dragend", () => { draggedItem = null; document.querySelectorAll(".is-dragging,.row-drop-target").forEach((node) => node.classList.remove("is-dragging", "row-drop-target")); });
    container.addEventListener("keydown", (event) => { const handle = event.target.closest(".row-drag-handle"); if (!handle || !event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return; event.preventDefault(); moveItemOffset(handle.dataset.id, event.key === "ArrowUp" ? -1 : 1); });
  }
  function moveBefore(list, moved, target) { const index = list.indexOf(moved); if (index < 0 || moved === target) return; list.splice(index, 1); list.splice(list.indexOf(target), 0, moved); }
  function reorderItem(moved, target) { const ids = state.items.map((item) => item.id); moveBefore(ids, moved, target); const order = new Map(ids.map((id, index) => [id, index])); state.items.sort((a, b) => order.get(a.id) - order.get(b.id)); saveState(); render(); toast("Ordem das linhas salva."); }
  function moveItemOffset(id, offset) { const index = state.items.findIndex((item) => item.id === id), target = Math.max(0, Math.min(state.items.length - 1, index + offset)); if (index < 0 || index === target) return; const [item] = state.items.splice(index, 1); state.items.splice(target, 0, item); saveState(); render(); }
  function resetOrder() { state.columnOrder = [...DEFAULT_COLUMN_ORDER]; const order = new Map(DEFAULT_ITEMS.map((item, index) => [item.id, index])); state.items.sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)); saveState(); render(); toast("Ordem original restaurada."); }

  function exportCsv() {
    const keys = periodKeys(), last = shiftKey(currentKey(), -1), rows = [["Item", "Marca", "Mercado", "Categoria", "Quantidade ideal", "Comprado no mês", "Preço unitário", "Gasto no mês", "Excesso no mês", "Excesso no mês passado", "Comprado a menos no mês passado", "Média mensal gasta", "Quantidade média comprada/mês"]];
    state.items.forEach((item) => { const avg = averages(item, keys), r = record(item.id); rows.push([item.name, item.brand, item.market, item.category, item.ideal, r.purchased, r.price.toFixed(2), spend(item.id).toFixed(2), excess(item), hasRecord(item.id, last) ? excess(item, last) : "", hasRecord(item.id, last) ? shortage(item, last) : "", avg.spend.toFixed(2), avg.purchased.toFixed(2)]); });
    download(`compras-${currentKey()}.csv`, "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\n"), "text/csv;charset=utf-8"); toast("Planilha exportada.");
  }
  function backup() { download(`backup-financas-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), app: "Nick Visuall Finanças", ...state }, null, 2), "application/json"); toast("Backup baixado."); }
  async function restore(event) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; try { state = normalize(JSON.parse(await file.text())); ensureCurrentMonth(); saveState(); render(); toast("Backup restaurado."); } catch (error) { console.warn(error); toast("Este arquivo não é um backup válido."); } }
  function download(filename, content, type) { const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
  function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
  function positive(value) { const parsed = Number(String(value ?? 0).replace(",", ".")); return Number.isFinite(parsed) ? Math.max(0, parsed) : 0; }
  function money(value) { return currency.format(Number.isFinite(value) ? value : 0); }
  function qty(value) { return number.format(value || 0); }
  function capitalize(value) { return value ? value[0].toLocaleUpperCase("pt-BR") + value.slice(1) : value; }
  function escape(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
  function toast(message) { clearTimeout(toastTimer); el.toast.textContent = message; el.toast.classList.add("show"); toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2100); }
})();
