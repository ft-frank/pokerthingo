"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Game, Player } from "./types";

const STORAGE_KEY = "pokerapp:games";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function seedGames(): Game[] {
  return [
    {
      id: uid(),
      stakes: "$1 / $2",
      date: "2025-08-01",
      players: [
        { id: uid(), name: "Alex", buyin: 40, cashout: 95 },
        { id: uid(), name: "Sam", buyin: 60, cashout: 20 },
        { id: uid(), name: "Jordan", buyin: 40, cashout: 0 },
        { id: uid(), name: "Casey", buyin: 20, cashout: 55 },
        { id: uid(), name: "Riley", buyin: 40, cashout: 30 },
      ],
    },
    {
      id: uid(),
      stakes: "25c / 50c",
      date: "2025-07-26",
      players: [
        { id: uid(), name: "Player 1", buyin: 40, cashout: 0 },
        { id: uid(), name: "Player 2", buyin: 40, cashout: 0 },
      ],
    },
    {
      id: uid(),
      stakes: "5c / 10c",
      date: "2025-07-20",
      players: [{ id: uid(), name: "Player 1", buyin: 40, cashout: 0 }],
    },
  ];
}

interface StoreValue {
  games: Game[];
  ready: boolean;
  getGame: (id: string) => Game | undefined;
  addGame: (stakes: string, date: string) => Game;
  deleteGame: (id: string) => void;
  addPlayer: (gameId: string) => void;
  updatePlayer: (gameId: string, playerId: string, patch: Partial<Player>) => void;
  removePlayer: (gameId: string, playerId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  // Load once on mount from localStorage (falling back to seed data).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setGames(JSON.parse(raw) as Game[]);
      } else {
        setGames(seedGames());
      }
    } catch {
      setGames(seedGames());
    }
    setReady(true);
  }, []);

  // Persist on every change (after the initial load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [games, ready]);

  const value: StoreValue = {
    games,
    ready,
    getGame: (id) => games.find((g) => g.id === id),
    addGame: (stakes, date) => {
      const game: Game = { id: uid(), stakes, date, players: [] };
      setGames((prev) => [game, ...prev]);
      return game;
    },
    deleteGame: (id) => setGames((prev) => prev.filter((g) => g.id !== id)),
    addPlayer: (gameId) =>
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? {
                ...g,
                players: [
                  ...g.players,
                  {
                    id: uid(),
                    name: `Player ${g.players.length + 1}`,
                    buyin: 40,
                    cashout: 0,
                  },
                ],
              }
            : g
        )
      ),
    updatePlayer: (gameId, playerId, patch) =>
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? {
                ...g,
                players: g.players.map((p) =>
                  p.id === playerId ? { ...p, ...patch } : p
                ),
              }
            : g
        )
      ),
    removePlayer: (gameId, playerId) =>
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId
            ? { ...g, players: g.players.filter((p) => p.id !== playerId) }
            : g
        )
      ),
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
