// Narrowing the list: free-text search plus category, store, minimum discount and verdict.

import { discountPercent, judgeDeal } from './verdict-rules.js';

export const DISCOUNT_STEPS = [0, 25, 40, 50];

export function emptyFilters() {
  return { query: '', category: '', store: '', minDiscount: 0, verdict: '' };
}

export function isFiltering(filters) {
  return Boolean(filters.query || filters.category || filters.store || filters.minDiscount || filters.verdict);
}

// Every word typed must appear somewhere in the deal's own text.
function matchesQuery(deal, query) {
  const haystack = `${deal.product} ${deal.detail} ${deal.store} ${deal.category}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function matchesFilters(deal, filters) {
  if (filters.category && deal.category !== filters.category) return false;
  if (filters.store && deal.store !== filters.store) return false;
  if (filters.minDiscount && discountPercent(deal) < filters.minDiscount) return false;
  if (filters.verdict && judgeDeal(deal).key !== filters.verdict) return false;
  if (filters.query && !matchesQuery(deal, filters.query)) return false;
  return true;
}

export function applyFilters(deals, filters) {
  return deals.filter((deal) => matchesFilters(deal, filters));
}

/** How many deals each choice of one filter would leave, with the other filters kept as they are. */
export function countChoices(deals, filters, field, valueOf) {
  const others = { ...filters, [field]: field === 'minDiscount' ? 0 : '' };
  const counts = new Map();
  for (const deal of applyFilters(deals, others)) {
    const value = valueOf(deal);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}
