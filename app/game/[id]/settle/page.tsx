"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { computeNets, computeTransactions, computeImbalance } from "@/lib/settlement";
import { Icon } from "@/components/Icon";

export default function SettlementScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getGame, ready } = useStore();
  const router = useRouter();
  const game = getGame(id);

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
      </div>
    );
  }

  const nets = computeNets(game.players);
  const transactions = computeTransactions(nets);
  const imbalance = computeImbalance(game.players);

  return (
    <div className="screen">
      <div className="header">
        <button
          className="icon-btn sm"
          aria-label="Back"
          onClick={() => router.push(`/game/${game.id}`)}
        >
          <Icon name="arrow-left" />
        </button>
        <h1 style={{ fontSize: 22 }}>Settlement</h1>
      </div>

      {Math.abs(imbalance) > 0.001 && (
        <p className="empty" style={{ color: "#b98" }}>
          Heads up: buy-ins and cash-outs are off by {money(Math.abs(imbalance))}.
          Double-check the totals.
        </p>
      )}

      <p className="section-label">Net results</p>
      <div style={{ marginBottom: 24 }}>
        {nets.map((n) => {
          const up = n.net >= 0;
          return (
            <div className="net-row" key={n.id}>
              <span>{n.name}</span>
              <span className={`net-amt ${up ? "up" : "down"}`}>
                {up ? "+" : "−"}
                {money(Math.abs(n.net))}
              </span>
            </div>
          );
        })}
      </div>

      <p className="section-label">Who pays who</p>
      {transactions.length === 0 ? (
        <p className="empty">Everyone&apos;s even.</p>
      ) : (
        transactions.map((t, i) => (
          <div className="txn" key={i}>
            <span className="txn-name">{t.from}</span>
            <Icon name="arrow-right" size={18} className="icon-arrow" />
            <span className="txn-name">{t.to}</span>
            <span className="txn-amt">{money(t.amount)}</span>
          </div>
        ))
      )}
    </div>
  );
}
