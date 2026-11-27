// Text formatting for prices and check times. No dates are computed from the clock: the page only
// restates when each price was read.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function money(amount) {
  const [whole, cents] = amount.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return cents === '00' ? `$${grouped}` : `$${grouped}.${cents}`;
}

function dayAndMonth(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/** "27 Nov, 06:50 UTC" for a timed read, "25 Nov" for a dated one. */
export function checkedLabel(checked) {
  const date = dayAndMonth(checked.slice(0, 10));
  return checked.includes('T') ? `${date}, ${checked.slice(11, 16)} UTC` : date;
}

const HOW_LABELS = {
  live: 'read live at the store',
  copy: 'dated copy of store page',
  report: 'deals desk checked store',
};

export function howLabel(how) {
  return HOW_LABELS[how];
}
