// Entry point: holds the page state and redraws the list whenever search, a filter or the sort changes.

import { DEALS, STORES } from './deals-data.js';
import { applyFilters, emptyFilters, isFiltering } from './deal-filters.js';
import { el, renderDeals, renderNothingFound } from './deal-rendering.js';
import { SORTS, sortDeals } from './deal-sorting.js';
import { renderFilterPanel } from './filter-controls.js';
import { VERDICTS } from './verdict-rules.js';
import { readViewLink, writeViewLink } from './view-link.js';

const page = {
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  list: document.getElementById('deal-list'),
  tally: document.getElementById('tally'),
  active: document.getElementById('active-filters'),
  clear: document.getElementById('clear-filters'),
  facts: document.getElementById('desk-facts'),
  groups: {
    category: document.getElementById('filter-category'),
    store: document.getElementById('filter-store'),
    discount: document.getElementById('filter-discount'),
    verdict: document.getElementById('filter-verdict'),
  },
};

const start = readViewLink(location.hash);
const state = { filters: start.filters, sort: start.sort };

function describeFilters(filters) {
  const parts = [];
  if (filters.query) parts.push(`“${filters.query}”`);
  if (filters.category) parts.push(filters.category);
  if (filters.store) parts.push(filters.store);
  if (filters.minDiscount) parts.push(`${filters.minDiscount}% off or more`);
  if (filters.verdict) parts.push(VERDICTS[filters.verdict].label);
  return parts;
}

function draw() {
  const shown = sortDeals(applyFilters(DEALS, state.filters), state.sort);
  if (shown.length > 0) renderDeals(page.list, shown, DEALS);
  else renderNothingFound(page.list, clearFilters);

  page.tally.textContent = `${shown.length} of ${DEALS.length} deals`;
  page.active.replaceChildren(...describeFilters(state.filters).map((text) => el('span', { class: 'active-tag' }, text)));
  page.clear.hidden = !isFiltering(state.filters);

  renderFilterPanel(page.groups, DEALS, state.filters, changeFilters);
  writeViewLink(state.filters, state.sort);
}

function changeFilters(patch) {
  Object.assign(state.filters, patch);
  draw();
}

function clearFilters() {
  state.filters = emptyFilters();
  page.search.value = '';
  draw();
}

function fillSortMenu() {
  for (const [key, sort] of Object.entries(SORTS)) {
    page.sort.append(el('option', { value: key, selected: key === state.sort }, sort.label));
  }
}

function showDeskFacts() {
  const live = DEALS.filter((deal) => deal.how === 'live').length;
  page.facts.textContent = `${DEALS.length} deals · ${STORES.length} stores · ${live} read live at the store on 27 Nov 2026`;
}

// Opens the evidence drawer of the deal named in the address, e.g. #open=lg-c6-55.
function openLinkedDeal(id) {
  const row = id && page.list.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!row) return;
  row.querySelector('.why').click();
  row.scrollIntoView({ block: 'start' });
}

page.search.value = state.filters.query;
page.search.addEventListener('input', () => changeFilters({ query: page.search.value.trim() }));
page.sort.addEventListener('change', () => {
  state.sort = page.sort.value;
  draw();
});
page.clear.addEventListener('click', clearFilters);

fillSortMenu();
showDeskFacts();
draw();
openLinkedDeal(start.open);
