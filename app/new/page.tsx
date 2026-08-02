"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { blindLabel } from "@/lib/format";
import { Icon } from "@/components/Icon";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewGameScreen() {
  const { addGame } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [smallBlind, setSmallBlind] = useState("1");
  const [bigBlind, setBigBlind] = useState("2");
  const [date, setDate] = useState(today());

  const sb = Number(smallBlind);
  const bb = Number(bigBlind);
  const blindsValid = sb > 0 && bb > 0;

  function create() {
    if (!blindsValid) return;
    const blinds = `${blindLabel(sb)} / ${blindLabel(bb)}`;
    const trimmed = name.trim();
    const label = trimmed ? `${trimmed} ${blinds}` : blinds;
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
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Frank's poker night"
        />
      </div>

      <div className="field">
        <label htmlFor="small-blind">Small blind</label>
        <input
          id="small-blind"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={smallBlind}
          onChange={(e) => setSmallBlind(e.target.value)}
          placeholder="1"
        />
      </div>

      <div className="field">
        <label htmlFor="big-blind">Big blind</label>
        <input
          id="big-blind"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={bigBlind}
          onChange={(e) => setBigBlind(e.target.value)}
          placeholder="2"
        />
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
        <button className="btn-primary" onClick={create} disabled={!blindsValid}>
          Create game
        </button>
      </div>
    </div>
  );
}
