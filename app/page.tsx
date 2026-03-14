"use client";

import { useEffect, useState } from "react";
import type { SimResult, SimulationOutput } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, dec = 1) {
  return n.toFixed(dec);
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MagicBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-900 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-700">
      ✦ Magic Circle
    </span>
  );
}

function FlagBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-mono ${color}`}>
      {label}
    </span>
  );
}

function WinBar({ pct, max, magic }: { pct: number; max: number; magic: boolean }) {
  const w = Math.min(100, (pct / max) * 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1">
      <div
        className={`h-2.5 rounded-full transition-all duration-700 ${magic ? "bg-emerald-500" : "bg-blue-500"}`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function TeamCard({ team, rank, isTop }: { team: SimResult; rank: number; isTop: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isTop
          ? "bg-gradient-to-br from-gray-900 to-gray-800 border-blue-700 shadow-lg shadow-blue-950"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Rank bubble */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-base ${
            rank === 1
              ? "bg-yellow-400 text-yellow-900"
              : rank <= 3
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {rank}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-white text-base leading-tight">{team.team}</span>
            {team.magic_circle && <MagicBadge />}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {team.repeat_tax      && <FlagBadge label="Defending Champ" color="bg-orange-950 text-orange-400 border border-orange-800" />}
            {team.big_ten_penalty && <FlagBadge label="Big Ten −6%" color="bg-blue-950 text-blue-400 border border-blue-800" />}
            {team.injury_penalty  && <FlagBadge label="Injury" color="bg-red-950 text-red-400 border border-red-800" />}
            {team.sos_discount    && <FlagBadge label="Weak SOS" color="bg-gray-800 text-gray-400 border border-gray-700" />}
          </div>
        </div>

        {/* Win % */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-2xl font-black tabular-nums ${isTop ? "text-white" : "text-gray-200"}`}>
            {fmt(team.final_sim_pct)}%
          </div>
          <div className="text-xs text-gray-500">win chance</div>
        </div>
      </div>

      <WinBar pct={team.final_sim_pct} max={18} magic={team.magic_circle} />

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs">Pool EV (6-person)</span>
            <div className="font-bold text-green-400">${fmt(team.pool_ev, 2)}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Value vs ESPN picks</span>
            <div className="font-bold text-yellow-400">{fmt(team.value_ratio, 2)}×</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Public picking</span>
            <div className="font-bold text-gray-300">{fmt(team.espn_pct)}%</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">AdjEM (efficiency)</span>
            <div className="font-bold text-gray-300">{fmt(team.adjEM, 2)}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">KenPom rank</span>
            <div className="font-bold text-gray-300">#{team.kenpom_rank}</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Trend</span>
            <div className="font-bold text-gray-300">
              {team.trend_mod > 0 ? "↑ Hot" : team.trend_mod < 0 ? "↓ Cooling" : "→ Steady"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ValueCallout({ team }: { team: SimResult }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-950 to-amber-950 border border-yellow-700 p-4 shadow-lg shadow-yellow-950">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">💰</div>
        <div className="flex-1">
          <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">
            Best Value Pick — 6-Person Pool
          </div>
          <div className="text-xl font-black text-yellow-300">{team.team}</div>
          <div className="text-sm text-yellow-500 mt-0.5">
            Only {fmt(team.espn_pct)}% of people are picking them — our model says {fmt(team.final_sim_pct)}% chance to win
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <div>
              <span className="text-gray-500 text-xs block">Value ratio</span>
              <span className="font-bold text-yellow-300">{fmt(team.value_ratio, 1)}×</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Pool EV</span>
              <span className="font-bold text-green-400">${fmt(team.pool_ev, 2)}</span>
            </div>
            {team.magic_circle && (
              <div className="flex items-end">
                <MagicBadge />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplainerCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
      <button
        className="w-full flex items-center justify-between text-sm text-gray-400 font-medium"
        onClick={() => setOpen((o) => !o)}
      >
        <span>How does this work?</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-3 text-sm text-gray-400 space-y-2">
          <p>We ran <strong className="text-white">100,000 simulated tournaments</strong> using KenPom efficiency stats and 40 years of historical data.</p>
          <p><strong className="text-emerald-400">✦ Magic Circle</strong> teams have a top-25 offense, top-40 defense, and high efficiency — historically these teams win at much higher rates.</p>
          <p><strong className="text-yellow-400">Value picks</strong> are teams our model thinks are underrated compared to how many people are picking them in public pools.</p>
          <p><strong className="text-white">Win chance</strong> is our adjusted probability — not ESPN's public pick % which can be biased by hype.</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type View = "picks" | "value" | "all";

export default function Home() {
  const [data, setData] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("picks");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load static pre-computed data on mount
  useEffect(() => {
    fetch("/data/championship_probabilities.json")
      .then((r) => r.json())
      .then((d: SimulationOutput & { generated_at?: string }) => {
        setData(d);
        if (d.generated_at) setLastUpdated(d.generated_at);
      })
      .catch(console.error);
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      const d = await res.json() as SimulationOutput & { generated_at?: string };
      setData(d);
      if (d.generated_at) setLastUpdated(d.generated_at);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const teams = data?.teams ?? [];
  const top5 = teams.slice(0, 5);
  const bestValue = teams.length
    ? [...teams].sort((a, b) => b.value_ratio - a.value_ratio)[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="font-black text-white text-lg leading-tight">March Madness 2026</h1>
            <p className="text-xs text-gray-500 leading-tight">
              {lastUpdated ? `Updated ${relativeTime(lastUpdated)}` : "Loading…"}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-bold transition-colors"
          >
            {loading ? "Running…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* View toggle */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex rounded-xl bg-gray-900 border border-gray-800 p-1 gap-1">
          {(["picks", "value", "all"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                view === v
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {v === "picks" ? "Our Picks" : v === "value" ? "Best Value" : "Full Rankings"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-12">
        {!data && !loading && (
          <div className="text-center text-gray-600 py-16 text-sm">Loading simulation data…</div>
        )}

        {loading && (
          <div className="rounded-2xl bg-blue-950 border border-blue-800 p-6 text-center">
            <div className="text-blue-300 font-bold mb-1">Running 100,000 simulations</div>
            <div className="text-blue-500 text-sm">This takes about 5 seconds…</div>
          </div>
        )}

        {data && view === "picks" && (
          <>
            <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
                Top Champion Picks — tap any team for details
              </div>
              <div className="space-y-3">
                {top5.map((t, i) => (
                  <TeamCard key={t.team} team={t} rank={i + 1} isTop={i === 0} />
                ))}
              </div>
            </div>
            <ExplainerCard />
          </>
        )}

        {data && view === "value" && bestValue && (
          <>
            <ValueCallout team={bestValue} />
            <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
                All Teams — sorted by value ratio
              </div>
              <div className="space-y-3">
                {[...teams]
                  .sort((a, b) => b.value_ratio - a.value_ratio)
                  .map((t, i) => (
                    <TeamCard key={t.team} team={t} rank={i + 1} isTop={i === 0} />
                  ))}
              </div>
            </div>
            <ExplainerCard />
          </>
        )}

        {data && view === "all" && (
          <>
            <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Full Rankings — {teams.length} teams · {(data.simulations ?? 100000).toLocaleString()} simulations
                </div>
              </div>

              {/* Compact table for desktop, cards on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-800">
                      <th className="text-left py-2 pr-2">#</th>
                      <th className="text-left py-2 pr-3">Team</th>
                      <th className="text-right py-2 pr-3">Win %</th>
                      <th className="text-right py-2 pr-3">ESPN %</th>
                      <th className="text-right py-2 pr-3">Pool EV</th>
                      <th className="text-right py-2 pr-3">Value</th>
                      <th className="text-right py-2">MC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t, i) => (
                      <tr key={t.team} className="border-b border-gray-900 hover:bg-gray-800/50">
                        <td className="py-2 pr-2 text-gray-600 text-sm">{i + 1}</td>
                        <td className="py-2 pr-3 font-bold text-white">{t.team}</td>
                        <td className="py-2 pr-3 text-right font-bold">{fmt(t.final_sim_pct)}%</td>
                        <td className="py-2 pr-3 text-right text-gray-400">{fmt(t.espn_pct)}%</td>
                        <td className="py-2 pr-3 text-right text-green-400">${fmt(t.pool_ev, 2)}</td>
                        <td className="py-2 pr-3 text-right text-yellow-400">{fmt(t.value_ratio, 2)}×</td>
                        <td className="py-2 text-right text-emerald-400">{t.magic_circle ? "✦" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-2">
                {teams.map((t, i) => (
                  <TeamCard key={t.team} team={t} rank={i + 1} isTop={false} />
                ))}
              </div>
            </div>
            <ExplainerCard />
          </>
        )}

        {/* Footer timestamp */}
        {lastUpdated && (
          <p className="text-center text-xs text-gray-700 pt-2">
            Data last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </main>
    </div>
  );
}
