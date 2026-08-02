"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/Icon";

const PRESETS = ["5c / 10c", "25c / 50c", "$1 / $2", "$2 / $5", "$5 / $10"];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewGameScreen() {
  const { addGame } = useStore();
  const router = useRouter();
  const [stakes, setStakes] = useState("$1 / $2");
  const [date, setDate] = useState(today());

  function create() {
    const label = stakes.trim();
    if (!label) return;
    const game = addGame(label, date || today());
    router.replace(`/game/${game.id}`);
  }

  return (
    <div className="screen">
      <div className="header">
        <button
          className="icon-btn sm"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <Icon name="arrow-left" />
        </button>
        <h1 style={{ fontSize: 22 }}>New game</h1>
      </div>

      <div className="field">
        <label htmlFor="stakes">Stakes</label>
        <input
          id="stakes"
          value={stakes}
          onChange={(e) => setStakes(e.target.value)}
          placeholder="$1 / $2"
        />
        <div className="stakes-presets">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className={`preset${p === stakes ? " active" : ""}`}
              onClick={() => setStakes(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="footer">
        <button className="btn-primary" onClick={create} disabled={!stakes.trim()}>
          Create game
        </button>
      </div>
    </div>
  );
}
