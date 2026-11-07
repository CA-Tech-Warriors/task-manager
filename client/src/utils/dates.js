const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Works with "2026-11-12" and full ISO timestamps. Reads the date part only,
// so a due date never shifts a day because of time zones.
export function toISODate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function formatDate(value, { year = false } = {}) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toISODate(value));
  if (!match) return '';
  const [, y, m, d] = match;
  return `${MONTHS[Number(m) - 1]} ${Number(d)}${year ? `, ${y}` : ''}`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function isOverdue(value) {
  const date = toISODate(value);
  return Boolean(date) && date < todayISO();
}

export function isDueWithin(value, days) {
  const date = toISODate(value);
  return Boolean(date) && date >= todayISO() && date <= todayISO(days);
}
