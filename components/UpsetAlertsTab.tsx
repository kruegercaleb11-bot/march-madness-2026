"use client";

import type { SimResult } from "@/lib/types";

// Historical championship probability by seed (approximate, 40-year base)
const SEED_CHAMP_PCT: Record<number, number> = {
  1: 24.5, 2: 19.0, 3: 12.0, 4: 7.5, 5: 5.0,
  6: 4.0,  7: 3.0,  8: 2.0,  9: 1.5, 10: 1.5,
  11: 1.0, 12: 0.5, 13: 0.3, 14: 0.2, 15: 0.1, 16: 0.05,
};

interface AlertTeam {
  result: SimResult;
  seed: number;
  seedImplied: number;
  upsetScore: number;  // simPct / seedImplied — higher = more undervalued
  type: "overvalued" | "undervalued" | "fair";
}

export default function UpsetAlertsTab({
  results,
  onSelectTeam,
}: {
  results: SimResult[];
  onSelectTeam: (name: string) => void;
}) {
  // Build alert data using kenpom_rank as seed proxy
  const alertTeams: AlertTeam[] = results.map((r) => {
    const seed = Math.min(16, r.kenpom_rank);
    const seedImplied = SEED_CHAMP_PCT[seed] ?? 0.5;
    const upsetScore = r.final_sim_pct / seedImplied;
    const type =
      upsetScore > 1.4 ? "undervalued" :
      upsetScore < 0.6 ? "overvalued" :
      "fair";
    return { result: r, seed, seedImplied, upsetScore, type };
  });

  const undervalued = [...alertTeams]
    .filter((t) => t.type === "undervalued")
    .sort((a, b) => b.upsetScore - a.upsetScore);

  const overvalued = [...alertTeams]
    .filter((t) => t.type === "overvalued")
    .sort((a, b) => a.upsetScore - b.upsetScore);

  const fair = [...alertTeams]
    .filter((t) => t.type === "fair")
    .sort((a, b) => b.result.final_sim_pct - a.result.final_sim_pct);

  function AlertCard({ at, variant }: { at: AlertTeam; variant: "up" | "down" | "fair" }) {
    const colors = {
      up:   "bg-emerald-950 border-emerald-800",
      down: "bg-red-950 border-red-800",
      fair: "bg-gray-900 border-gray-800",
    };
    const labelColors = {
      up:   "text-emerald-400",
      down: "text-red-400",
      fair: "text-gray-400",
    };
    const label = {
      up:   "UNDERVALUED",
      down: "OVERVALUED",
      fair: "FAIRLY VALUED",
    };
    const r = at.result;
    return (
      <button
        onClick={() => onSelectTeam(r.team)}
        className={`w-full text-left rounded-2xl border p-4 ${colors[variant]} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-black text-white text-base">{r.team}</span>
              <span className={`text-xs font-bold ${labelColors[variant]} bg-black/30 px-1.5 py-0.5 rounded`}>
                {label[variant]}
              </span>
              {r.magic_circle && (
                <span className="text-xs text-emerald-400">✦ MC</span>
              )}
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>Seed ~#{at.seed} → historical baseline: <span className="text-white font-bold">{at.seedImplied.toFixed(1)}%</span></div>
              <div>Our model: <span className="text-white font-bold">{r.final_sim_pct.toFixed(2)}%</span></div>
              <div>Public picking: <span className="text-white font-bold">{r.espn_pct.toFixed(1)}%</span></div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl font-black tabular-nums ${labelColors[variant]}`}>
              {at.upsetScore.toFixed(2)}×
            </div>
            <div className="text-xs text-gray-600">model vs baseline</div>
            <div className="text-xs text-green-400 mt-1">${r.pool_ev.toFixed(2)} EV</div>
          </div>
        </div>

        {/* Divergence bars */}
        <div className="mt-3 space-y-1.5">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>Historical seed baseline</span>
              <span>{at.seedImplied.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full">
              <div className="h-1.5 bg-gray-600 rounded-full" style={{ width: `${Math.min(100, at.seedImplied * 4)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>Our model</span>
              <span>{r.final_sim_pct.toFixed(2)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full">
              <div
                className={`h-1.5 rounded-full ${variant === "up" ? "bg-emerald-500" : variant === "down" ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, r.final_sim_pct * 4)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>ESPN public</span>
              <span>{r.espn_pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full">
              <div className="h-1.5 bg-yellow-600 rounded-full" style={{ width: `${Math.min(100, r.espn_pct * 4)}%` }} />
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 text-xs text-gray-400">
        Compares our model's championship probability against what a team's <strong className="text-white">historical seed baseline</strong> would predict. High ratio = our model likes them more than their seed suggests. Low ratio = overhyped.
      </div>

      {undervalued.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="text-lg">↑</span> Undervalued — Our Model Outperforms Seed Expectation
          </h2>
          <div className="space-y-3">
            {undervalued.map((at) => (
              <AlertCard key={at.result.team} at={at} variant="up" />
            ))}
          </div>
        </section>
      )}

      {overvalued.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="text-lg">↓</span> Overvalued — Hype Exceeds Our Model
          </h2>
          <div className="space-y-3">
            {overvalued.map((at) => (
              <AlertCard key={at.result.team} at={at} variant="down" />
            ))}
          </div>
        </section>
      )}

      {fair.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Fairly Valued
          </h2>
          <div className="space-y-3">
            {fair.map((at) => (
              <AlertCard key={at.result.team} at={at} variant="fair" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
