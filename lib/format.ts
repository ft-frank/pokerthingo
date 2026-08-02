/** Format a dollar amount, dropping the decimals when it's a whole number. */
export function money(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(2);
  return `${rounded < 0 ? "−" : ""}$${body}`;
}

/**
 * Pull the small blind out of a stakes label. The New game screen appends the
 * blinds to the end of the name as e.g. "Frank's night $1 / $2", so we read the
 * first number of the trailing "$X / $Y" pair. Falls back to `fallback` when no
 * blind can be found.
 */
export function parseSmallBlind(stakes: string, fallback = 5): number {
  const m = stakes.match(/\$?(\d+(?:\.\d+)?)\s*\/\s*\$?\d+(?:\.\d+)?\s*$/);
  if (!m) return fallback;
  const n = Number(m[1]);
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
