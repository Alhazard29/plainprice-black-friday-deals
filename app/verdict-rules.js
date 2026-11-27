// Turns a deal's dated price history into a plain verdict: is this really a deal?
// The rules read only facts recorded in deals-data.js; nothing here is a hand-picked label.

import { SALE_DAY } from './deals-data.js';
import { money } from './price-format.js';

const DAY_MS = 86400000;

// A price that has sat unchanged this long before sale day is not a Black Friday price.
const ROUTINE_AFTER_DAYS = 21;

export const VERDICTS = {
  low: { label: 'New low', rank: 3, blurb: 'Cheaper than any earlier price we could find.' },
  strong: { label: 'Strong price', rank: 2, blurb: 'A real cut, but not a record.' },
  routine: { label: 'Routine sale', rank: 1, blurb: 'The same price, or better, was around before.' },
  doubt: { label: 'Padded "was" price', rank: 0, blurb: 'The discount leans on a usual price we could not confirm.' },
};

export function discountPercent(deal) {
  return Math.round(((deal.usual - deal.sale) / deal.usual) * 100);
}

export function savedDollars(deal) {
  return Math.round((deal.usual - deal.sale) * 100) / 100;
}

function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS);
}

export function daysSinceChecked(deal) {
  return Math.max(0, daysBetween(deal.checked.slice(0, 10), SALE_DAY));
}

/** The verdict key for a deal and the one-line reason that decided it. */
export function judgeDeal(deal) {
  const h = deal.history;
  if (h.usualDoubt) {
    return { key: 'doubt', reason: h.usualDoubt };
  }
  if (h.cheaperBefore) {
    return { key: 'routine', reason: `Cheaper before: ${money(h.cheaperBefore.price)} on ${h.cheaperBefore.when}.` };
  }
  if (h.sameEverywhere) {
    return { key: 'routine', reason: h.sameEverywhere };
  }
  if (h.seenSince) {
    const heldDays = daysBetween(h.seenSince, SALE_DAY);
    if (heldDays >= ROUTINE_AFTER_DAYS && !h.lowestSeen) {
      return { key: 'routine', reason: `Same price seen ${heldDays} days before Black Friday.` };
    }
    if (h.lowestSeen) {
      return { key: 'strong', reason: `Lowest on record, but held for ${heldDays} days: no rush.` };
    }
  }
  if (h.cheaperElsewhere) {
    const e = h.cheaperElsewhere;
    return { key: 'strong', reason: `${e.where} was ${money(e.price)} on ${e.when}.` };
  }
  if (h.priorLow && deal.sale < h.priorLow.price) {
    const under = money(Math.round((h.priorLow.price - deal.sale) * 100) / 100);
    return { key: 'low', reason: `${under} under the old low, ${money(h.priorLow.price)} (${h.priorLow.when}).` };
  }
  return { key: 'strong', reason: 'Deep cut; no earlier lower price on record.' };
}

/** 0 to 100: how much a shopper should care. Verdict first, then depth of cut, minus stale or indirect reads. */
export function dealScore(deal) {
  const base = { low: 58, strong: 42, routine: 18, doubt: 12 }[judgeDeal(deal).key];
  const depth = Math.min(discountPercent(deal), 70) * 0.5;
  const stale = Math.min(daysSinceChecked(deal), 8);
  const indirect = deal.linkKind === 'shelf' ? 4 : 0;
  return Math.max(0, Math.min(100, Math.round(base + depth - stale - indirect)));
}
