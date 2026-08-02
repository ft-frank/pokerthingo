"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

export default function GamesListScreen() {
  const { games, ready } = useStore();
  const router = useRouter();

  return (
    <div className="screen">
      <div className="header">
        <h1>Games</h1>
        <div className="header-spacer" />
        <button
          className="icon-btn"
          aria-label="New game"
          onClick={() => router.push("/new")}
        >
          <Icon name="plus" />
        </button>
      </div>

      {!ready ? (
        <p className="center-note">Loading…</p>
      ) : games.length === 0 ? (
        <p className="center-note">No games yet. Tap + to start one.</p>
      ) : (
        games.map((g) => {
          const count = g.players.length;
          return (
            <Link key={g.id} href={`/game/${g.id}`} className="card">
              <div>
                <div className="card-title">{g.stakes}</div>
                <div className="card-sub">
                  {shortDate(g.date)} · {count}{" "}
                  {count === 1 ? "player" : "players"}
                </div>
              </div>
              <Icon name="chevron-right" className="chevron" />
            </Link>
          );
        })
      )}
    </div>
  );
}
