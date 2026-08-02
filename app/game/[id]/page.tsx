"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { shortDate, parseSmallBlind } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { Stepper } from "@/components/Stepper";

export default function GameDetailScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getGame, ready, addPlayer, updatePlayer, removePlayer, deleteGame } =
    useStore();
  const router = useRouter();
  const game = getGame(id);
  const smallBlind = game ? parseSmallBlind(game.stakes) : 5;
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    deleteGame(id);
    router.push("/");
  }

  if (!ready) {
    return (
      <div className="screen">
        <p className="center-note">Loading…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="screen">
        <div className="header">
          <button
            className="icon-btn sm"
            aria-label="Back"
            onClick={() => router.push("/")}
          >
            <Icon name="arrow-left" />
          </button>
          <h1 style={{ fontSize: 22 }}>Not found</h1>
        </div>
        <p className="center-note">This game no longer exists.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="header">
        <button
          className="icon-btn sm"
          aria-label="Back"
          onClick={() => router.push("/")}
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px" }}>
            {game.stakes}
          </div>
          <div className="header-sub">{shortDate(game.date)}</div>
        </div>
        <button
          className="icon-btn sm header-spacer"
          aria-label="Delete game"
          onClick={() => setConfirmDelete((v) => !v)}
        >
          <Icon name="trash" size={18} />
        </button>
      </div>

      {confirmDelete && (
        <div className="delete-confirm">
          <span>Delete this game? This can&apos;t be undone.</span>
          <div className="delete-confirm-actions">
            <button
              className="delete-confirm-cancel"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button className="delete-confirm-go" onClick={handleDelete}>
              Delete game
            </button>
          </div>
        </div>
      )}

      {game.players.map((p) => (
        <div className="player" key={p.id}>
          <div className="player-top">
            <input
              className="player-name"
              value={p.name}
              aria-label="Player name"
              onChange={(e) =>
                updatePlayer(game.id, p.id, { name: e.target.value })
              }
            />
            <button
              className="player-remove"
              aria-label={`Remove ${p.name}`}
              onClick={() => removePlayer(game.id, p.id)}
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
          <div className="steppers">
            <Stepper
              label="Buy-in"
              value={p.buyin}
              onChange={(v) => updatePlayer(game.id, p.id, { buyin: v })}
            />
            <Stepper
              label="Cash out"
              value={p.cashout}
              step={smallBlind}
              onChange={(v) => updatePlayer(game.id, p.id, { cashout: v })}
            />
          </div>
        </div>
      ))}

      <button className="add-dashed" onClick={() => addPlayer(game.id)}>
        <Icon name="plus" size={16} />
        Add player
      </button>

      <div className="footer">
        <Link
          href={`/game/${game.id}/settle`}
          className="btn-primary"
          style={{
            display: "block",
            textAlign: "center",
            pointerEvents: game.players.length ? "auto" : "none",
            opacity: game.players.length ? 1 : 0.4,
          }}
        >
          Calculate settlement
        </Link>
      </div>
    </div>
  );
}
