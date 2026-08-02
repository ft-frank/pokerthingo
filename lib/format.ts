/** Format a dollar amount, dropping the decimals when it's a whole number. */
export function money(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(2);
  return `${rounded < 0 ? "−" : ""}$${body}`;
}

/**
 * Format a blind amount for a stakes label. Amounts under a dollar are shown in
 * cents (e.g. 0.25 → "25c"); a dollar or more keeps the "$" form (e.g. 2 → "$2").
 */
export function blindLabel(amount: number): string {
  if (amount > 0 && amount < 1) return `${Math.round(amount * 100)}c`;
  return `$${amount}`;
}

/**
 * Pull the small blind out of a stakes label. The New game screen appends the
 * blinds to the end of the name as e.g. "Frank's night $1 / $2" or
 * "Frank's night 25c / 50c", so we read the first amount of the trailing pair.
 * Returns dollars ("25c" → 0.25). Falls back to `fallback` when none is found.
 */
export function parseSmallBlind(stakes: string, fallback = 5): number {
  const m = stakes.match(
    /\$?(\d+(?:\.\d+)?)(c)?\s*\/\s*\$?\d+(?:\.\d+)?c?\s*$/i
  );
  if (!m) return fallback;
  const n = m[2] ? Number(m[1]) / 100 : Number(m[1]);
  return n > 0 ? n : fallback;
}

/** Format an ISO yyyy-mm-dd date as e.g. "Fri 1 Aug". */
export function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
