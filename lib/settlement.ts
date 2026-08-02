import type { Player, NetResult, Transaction } from "./types";

/** Net position for each player, sorted from biggest winner to biggest loser. */
export function computeNets(players: Player[]): NetResult[] {
  return players
    .map((p) => ({ id: p.id, name: p.name, net: p.cashout - p.buyin }))
    .sort((a, b) => b.net - a.net);
}

/**
 * Greedy debt-settlement: repeatedly match the biggest debtor with the biggest
 * creditor. Produces a near-minimal set of "who pays who" transactions.
 */
export function computeTransactions(nets: NetResult[]): Transaction[] {
  const debtors = nets
    .filter((p) => p.net < 0)
    .map((p) => ({ name: p.name, amount: -p.net }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = nets
    .filter((p) => p.net > 0)
    .map((p) => ({ name: p.name, amount: p.net }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].amount, creditors[c].amount);
    if (amount > 0.001) {
      transactions.push({
        from: debtors[d].name,
        to: creditors[c].name,
        amount,
      });
    }
    debtors[d].amount -= amount;
    creditors[c].amount -= amount;
    if (debtors[d].amount <= 0.001) d++;
    if (creditors[c].amount <= 0.001) c++;
  }
  return transactions;
}

/** Sum of all buy-ins minus all cash-outs. Should be 0 for a balanced game. */
export function computeImbalance(players: Player[]): number {
  return players.reduce((sum, p) => sum + (p.buyin - p.cashout), 0);
}
