/** Format a dollar amount, dropping the decimals when it's a whole number. */
export function money(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(2);
  return `${rounded < 0 ? "−" : ""}$${body}`;
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
