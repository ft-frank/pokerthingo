export interface Player {
  id: string;
  name: string;
  buyin: number;
  cashout: number;
}

export interface Game {
  id: string;
  /** Display label for the stakes, e.g. "$1 / $2" or "25c / 50c". */
  stakes: string;
  /** ISO date string (yyyy-mm-dd) the game was played. */
  date: string;
  players: Player[];
}

export interface NetResult {
  id: string;
  name: string;
  /** cashout - buyin. Positive = up, negative = down. */
  net: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}
