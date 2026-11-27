// Keeps the current search, filters and sort in the address bar's #fragment, so a filtered view can be
// bookmarked or sent to someone. Nothing is sent anywhere: the fragment never leaves the browser.

import { CATEGORIES, STORES } from './deals-data.js';
import { DISCOUNT_STEPS, emptyFilters } from './deal-filters.js';
import { DEFAULT_SORT, SORTS } from './deal-sorting.js';
import { VERDICTS } from './verdict-rules.js';

export function readViewLink(fragment) {
  const params = new URLSearchParams(fragment.replace(/^#/, ''));
  const filters = emptyFilters();
  filters.query = (params.get('q') || '').slice(0, 80);
  if (CATEGORIES.includes(params.get('cat'))) filters.category = params.get('cat');
  if (STORES.includes(params.get('store'))) filters.store = params.get('store');
  if (DISCOUNT_STEPS.includes(Number(params.get('off')))) filters.minDiscount = Number(params.get('off'));
  if (Object.hasOwn(VERDICTS, params.get('verdict') || '')) filters.verdict = params.get('verdict');
  const sort = Object.hasOwn(SORTS, params.get('sort') || '') ? params.get('sort') : DEFAULT_SORT;
  return { filters, sort, open: params.get('open') || '' };
}

export function writeViewLink(filters, sort) {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('cat', filters.category);
  if (filters.store) params.set('store', filters.store);
  if (filters.minDiscount) params.set('off', String(filters.minDiscount));
  if (filters.verdict) params.set('verdict', filters.verdict);
  if (sort !== DEFAULT_SORT) params.set('sort', sort);
  const fragment = params.toString();
  history.replaceState(null, '', fragment ? `#${fragment}` : location.pathname + location.search);
}
