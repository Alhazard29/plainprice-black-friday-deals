// Builds the DOM for the deal list: one row per deal, with its evidence drawer.

import { checkedLabel, howLabel, money } from './price-format.js';
import { VERDICTS, dealScore, discountPercent, judgeDeal, savedDollars } from './verdict-rules.js';

/** Small element builder: el('a', { href }, 'text', childNode). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (name === 'class') node.className = value;
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...children.filter((child) => child !== null && child !== false));
  return node;
}

function storeLink(deal) {
  const label = deal.linkKind === 'shelf' ? `${deal.store} shelf` : `View at ${deal.store}`;
  return el('a', { class: 'go', href: deal.url, rel: 'noopener noreferrer', target: '_blank' }, label, el('span', { 'aria-hidden': 'true' }, ' ↗'));
}

// The verdict cell also carries the button that opens the row's evidence drawer.
function verdictBadge(deal, drawer) {
  const verdict = judgeDeal(deal);
  const toggle = el('button', { type: 'button', class: 'why', 'aria-expanded': 'false' }, 'Evidence');
  toggle.addEventListener('click', () => {
    drawer.hidden = !drawer.hidden;
    toggle.setAttribute('aria-expanded', String(!drawer.hidden));
  });
  return el(
    'div',
    { class: `verdict verdict-${verdict.key}` },
    el('span', { class: 'verdict-name' }, VERDICTS[verdict.key].label),
    el('span', { class: 'score', title: 'Deal score out of 100' }, String(dealScore(deal))),
    toggle,
  );
}

function evidenceItem(item) {
  const source = item.source
    ? el('a', { href: item.source.url, rel: 'noopener noreferrer', target: '_blank' }, item.source.name)
    : null;
  return el('li', {}, item.text, source && ' ', source);
}

// The same product at other stores, cheapest first, so the row answers "where should I buy it?".
function otherStores(deal, allDeals) {
  if (!deal.group) return null;
  const rivals = allDeals.filter((other) => other.group === deal.group && other.id !== deal.id);
  if (rivals.length === 0) return null;
  const rows = rivals
    .sort((a, b) => a.sale - b.sale)
    .map((other) => {
      const gap = Math.round((other.sale - deal.sale) * 100) / 100;
      const versus = gap === 0 ? 'same price' : gap > 0 ? `${money(gap)} more` : `${money(-gap)} less`;
      return el(
        'li',
        {},
        el('a', { href: other.url, rel: 'noopener noreferrer', target: '_blank' }, other.store),
        ` ${money(other.sale)} · ${versus} · checked ${checkedLabel(other.checked)}, ${howLabel(other.how)}`,
      );
    });
  return el('div', { class: 'drawer-block' }, el('h4', {}, 'Same product at other stores'), el('ul', {}, ...rows));
}

function evidenceDrawer(deal, allDeals) {
  const verdict = judgeDeal(deal);
  return el(
    'div',
    { class: 'drawer', hidden: true },
    el(
      'div',
      { class: 'drawer-block' },
      el('h4', {}, `${VERDICTS[verdict.key].label}: ${VERDICTS[verdict.key].blurb}`),
      el('p', {}, verdict.reason),
      el('ul', {}, ...deal.evidence.map(evidenceItem)),
    ),
    el(
      'div',
      { class: 'drawer-block' },
      el('h4', {}, 'Where the price was read'),
      el('p', {}, `${deal.detail}.`),
      el('p', {}, deal.readFrom),
      el('p', {}, `Usual price is the store's ${deal.usualKind}. You save ${money(savedDollars(deal))}.`),
      deal.condition ? el('p', { class: 'condition' }, deal.condition) : null,
    ),
    otherStores(deal, allDeals),
  );
}

export function dealRow(deal, allDeals) {
  const verdict = judgeDeal(deal);
  const twin = deal.group ? allDeals.filter((other) => other.group === deal.group).length : 0;
  const drawer = evidenceDrawer(deal, allDeals);
  return el(
    'li',
    { class: 'deal', dataset: { id: deal.id, verdict: verdict.key } },
    verdictBadge(deal, drawer),
    el(
      'div',
      { class: 'what' },
      el('h3', {}, deal.product, twin > 1 ? el('span', { class: 'twin' }, `${twin} stores`) : null),
      el('p', { class: 'reason' }, verdict.reason),
    ),
    el('div', { class: 'store' }, deal.store, el('span', { class: 'cat' }, deal.category)),
    el(
      'div',
      { class: 'prices' },
      el('span', { class: 'now' }, money(deal.sale)),
      el('s', { class: 'was', title: `Usual price: ${deal.usualKind}` }, money(deal.usual)),
      el('span', { class: 'off' }, `−${discountPercent(deal)}%`),
    ),
    el(
      'div',
      { class: `checked how-${deal.how}` },
      el('time', { datetime: deal.checked }, checkedLabel(deal.checked)),
      el('span', {}, howLabel(deal.how)),
    ),
    storeLink(deal),
    drawer,
  );
}

export function renderDeals(listNode, deals, allDeals) {
  listNode.replaceChildren(...deals.map((deal) => dealRow(deal, allDeals)));
}

export function renderNothingFound(listNode, onClear) {
  const clear = el('button', { type: 'button', class: 'link-button' }, 'Clear every filter');
  clear.addEventListener('click', onClear);
  listNode.replaceChildren(el('li', { class: 'nothing' }, 'No deal matches all of that. ', clear));
}
