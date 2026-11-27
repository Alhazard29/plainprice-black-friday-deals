// Ordering the list. "Best first" uses the score from verdict-rules.js; the rest are plain comparisons.

import { daysSinceChecked, dealScore, discountPercent, savedDollars } from './verdict-rules.js';

export const SORTS = {
  best: { label: 'Best deals first', compare: (a, b) => dealScore(b) - dealScore(a) },
  discount: { label: 'Biggest % off', compare: (a, b) => discountPercent(b) - discountPercent(a) },
  saving: { label: 'Most dollars saved', compare: (a, b) => savedDollars(b) - savedDollars(a) },
  price: { label: 'Lowest price', compare: (a, b) => a.sale - b.sale },
  fresh: { label: 'Most recently checked', compare: (a, b) => daysSinceChecked(a) - daysSinceChecked(b) || (a.checked < b.checked ? 1 : -1) },
};

export const DEFAULT_SORT = 'best';

/** A sorted copy; ties keep the product name order so the list never shuffles between renders. */
export function sortDeals(deals, sortKey) {
  const compare = (SORTS[sortKey] || SORTS[DEFAULT_SORT]).compare;
  return [...deals].sort((a, b) => compare(a, b) || a.product.localeCompare(b.product, 'en'));
}
