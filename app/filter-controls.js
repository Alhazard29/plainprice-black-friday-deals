// The filter panel: chip groups for category, store, discount and verdict, each chip showing how many
// deals it would leave.

import { CATEGORIES, STORES } from './deals-data.js';
import { DISCOUNT_STEPS, countChoices } from './deal-filters.js';
import { el } from './deal-rendering.js';
import { VERDICTS, discountPercent, judgeDeal } from './verdict-rules.js';

const VERDICT_ORDER = ['low', 'strong', 'routine', 'doubt'];

function chip(label, count, pressed, onPick) {
  const button = el(
    'button',
    { type: 'button', class: 'chip', 'aria-pressed': String(pressed), disabled: count === 0 && !pressed },
    label,
    el('span', { class: 'count' }, String(count)),
  );
  button.addEventListener('click', onPick);
  return button;
}

function sum(counts) {
  let total = 0;
  for (const n of counts.values()) total += n;
  return total;
}

/** Fills one chip group. `choices` is a list of [value, label]; picking the pressed chip again clears it. */
function fillGroup(node, choices, counts, current, emptyValue, onChange) {
  const all = chip('All', sum(counts), current === emptyValue, () => onChange(emptyValue));
  const rest = choices.map(([value, label]) =>
    chip(label, counts.get(value) || 0, current === value, () => onChange(current === value ? emptyValue : value)),
  );
  node.replaceChildren(all, ...rest);
}

export function renderFilterPanel(nodes, deals, filters, onChange) {
  fillGroup(
    nodes.category,
    CATEGORIES.map((name) => [name, name]),
    countChoices(deals, filters, 'category', (deal) => deal.category),
    filters.category,
    '',
    (value) => onChange({ category: value }),
  );
  fillGroup(
    nodes.store,
    STORES.map((name) => [name, name]),
    countChoices(deals, filters, 'store', (deal) => deal.store),
    filters.store,
    '',
    (value) => onChange({ store: value }),
  );
  fillGroup(
    nodes.verdict,
    VERDICT_ORDER.map((key) => [key, VERDICTS[key].label]),
    countChoices(deals, filters, 'verdict', (deal) => judgeDeal(deal).key),
    filters.verdict,
    '',
    (value) => onChange({ verdict: value }),
  );

  // Discount chips are thresholds, so each count is "this much off or more".
  const pool = countChoices(deals, filters, 'minDiscount', (deal) => discountPercent(deal));
  const atLeast = (step) => {
    let total = 0;
    for (const [percent, n] of pool) if (percent >= step) total += n;
    return total;
  };
  nodes.discount.replaceChildren(
    ...DISCOUNT_STEPS.map((step) =>
      chip(step === 0 ? 'Any' : `${step}%+`, atLeast(step), filters.minDiscount === step, () => onChange({ minDiscount: step })),
    ),
  );
}
