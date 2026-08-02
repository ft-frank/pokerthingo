"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Game, Player } from "./types";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import { useAuth } from "./auth";

const STORAGE_KEY = "pokerapp:games";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Demo data — only used in the local-storage fallback (no Supabase keys). */
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
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  // A live mirror of `games` so mutations can compute the next state without
  // running side effects inside a setState updater (avoids double-fire in
  // React strict mode).
  const gamesRef = useRef<Game[]>(games);
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  // One reusable Supabase browser client.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function sb() {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }

  // Debounce timers per game id so rapid edits (typing a name, tapping a
  // stepper) collapse into a single write.
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function persistGame(game: Game, immediate = false) {
    if (!isSupabaseConfigured || !user) return;
    clearTimeout(saveTimers.current[game.id]);
    const run = async () => {
      const { error } = await sb().from("games").upsert({
        id: game.id,
        stakes: game.stakes,
        date: game.date,
        players: game.players,
      });
      if (error) console.error("Failed to save game:", error.message);
    };
    if (immediate) run();
    else saveTimers.current[game.id] = setTimeout(run, 400);
  }

  async function deleteGameRow(id: string) {
    if (!isSupabaseConfigured || !user) return;
    clearTimeout(saveTimers.current[id]);
    const { error } = await sb().from("games").delete().eq("id", id);
    if (error) console.error("Failed to delete game:", error.message);
  }

  // Load games: from Supabase for the signed-in user, or from localStorage
  // when the app is running without Supabase keys.
  useEffect(() => {
    let active = true;

    async function load() {
      if (!isSupabaseConfigured) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          setGames(raw ? (JSON.parse(raw) as Game[]) : seedGames());
        } catch {
          setGames(seedGames());
        }
        setReady(true);
        return;
      }

      if (!user) {
        // Wait for auth to resolve (middleware guarantees a user in-app).
        setGames([]);
        setReady(false);
        return;
      }

      setReady(false);
      const { data, error } = await sb()
        .from("games")
        .select("id,stakes,date,players")
        .order("date", { ascending: false });

      if (!active) return;
      if (error) {
        console.error("Failed to load games:", error.message);
        setGames([]);
      } else {
        setGames(
          (data ?? []).map((r) => ({
            id: r.id as string,
            stakes: r.stakes as string,
            date: r.date as string,
            players: (r.players ?? []) as Player[],
          }))
        );
      }
      setReady(true);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  // Persist to localStorage only in the no-Supabase fallback mode.
  useEffect(() => {
    if (isSupabaseConfigured || !ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [games, ready]);

  /** Apply a pure transform to one game, update state, and persist it. */
  function mutateGame(gameId: string, fn: (g: Game) => Game) {
    let updated: Game | undefined;
    const next = gamesRef.current.map((g) => {
      if (g.id !== gameId) return g;
      updated = fn(g);
      return updated;
    });
    gamesRef.current = next;
    setGames(next);
    if (updated) persistGame(updated);
  }

  const value: StoreValue = {
    games,
    ready,
    getGame: (id) => games.find((g) => g.id === id),

    addGame: (stakes, date) => {
      const game: Game = { id: uid(), stakes, date, players: [] };
      const next = [game, ...gamesRef.current];
      gamesRef.current = next;
      setGames(next);
      persistGame(game, true); // write immediately so edits can follow
      return game;
    },

    deleteGame: (id) => {
      const next = gamesRef.current.filter((g) => g.id !== id);
      gamesRef.current = next;
      setGames(next);
      deleteGameRow(id);
    },

    addPlayer: (gameId) =>
      mutateGame(gameId, (g) => ({
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
      })),

    updatePlayer: (gameId, playerId, patch) =>
      mutateGame(gameId, (g) => ({
        ...g,
        players: g.players.map((p) =>
          p.id === playerId ? { ...p, ...patch } : p
        ),
      })),

    removePlayer: (gameId, playerId) =>
      mutateGame(gameId, (g) => ({
        ...g,
        players: g.players.filter((p) => p.id !== playerId),
      })),
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
