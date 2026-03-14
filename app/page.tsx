"use client";

import { useEffect, useState } from "react";
import type { SimResult, SimulationOutput } from "@/lib/types";
import { TEAMS } from "@/lib/teams-data";
import TeamModal from "@/components/TeamModal";
import AnalyticsTab from "@/components/AnalyticsTab";
import BracketTab from "@/components/BracketTab";
import UpsetAlertsTab from "@/components/UpsetAlertsTab";
import HeadToHeadTab from "@/components/HeadToHeadTab";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ci95(pct: number, n = 100_000): string {
  const p = pct / 100;
  const m = 1.96 * Math.sqrt((p * (1 - p)) / n) * 100;
  return m < 0.05 ? "<0.1" : m.toFixed(1);
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

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "picks",     label: "Our Picks"    },
  { id: "value",     label: "Best Value"   },
  { id: "analytics", label: "Analytics"   },
  { id: "bracket",   label: "Bracket"     },
  { id: "upsets",    label: "Upset Alerts" },
  { id: "h2h",       label: "Head to Head" },
  { id: "all",       label: "All Teams"   },
] as const;

type Tab = (typeof TABS)[number]["id"];

// ── Shared sub-components ─────────────────────────────────────────────────────

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

// ── TeamCard ──────────────────────────────────────────────────────────────────

function TeamCard({
  team, rank, isTop, onDetails,
}: {
  team: SimResult; rank: number; isTop: boolean; onDetails: (name: string) => void;
}) {
  const ciStr = ci95(team.final_sim_pct);
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isTop
          ? "bg-gradient-to-br from-gray-900 to-gray-800 border-blue-700 shadow-lg shadow-blue-950"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-base ${
            rank === 1 ? "bg-yellow-400 text-yellow-900"
            : rank <= 3 ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300"
          }`}
        >
          {rank}
        </div>

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

        <div className="flex-shrink-0 text-right">
          <div className={`text-2xl font-black tabular-nums ${isTop ? "text-white" : "text-gray-200"}`}>
            {team.final_sim_pct.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">±{ciStr}%</div>
        </div>
      </div>

      <WinBar pct={team.final_sim_pct} max={18} magic={team.magic_circle} />

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-3 text-xs text-gray-500">
          <span>ESPN {team.espn_pct}%</span>
          <span className="text-green-400">${team.pool_ev.toFixed(2)} EV</span>
          <span className="text-yellow-500">{team.value_ratio.toFixed(1)}× val</span>
        </div>
        <button
          onClick={() => onDetails(team.team)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-950"
        >
          Details →
        </button>
      </div>
    </div>
  );
}

// ── Picks Tab ─────────────────────────────────────────────────────────────────

function PicksTab({ teams, onDetails }: { teams: SimResult[]; onDetails: (n: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
          Top Champion Picks — tap Details for full breakdown
        </div>
        <div className="space-y-3">
          {teams.slice(0, 5).map((t, i) => (
            <TeamCard key={t.team} team={t} rank={i + 1} isTop={i === 0} onDetails={onDetails} />
          ))}
        </div>
      </div>
      <ExplainerCard />
    </div>
  );
}

// ── Value Tab ─────────────────────────────────────────────────────────────────

function ValueTab({ teams, onDetails }: { teams: SimResult[]; onDetails: (n: string) => void }) {
  const sorted = [...teams].sort((a, b) => b.value_ratio - a.value_ratio);
  const best = sorted[0];
  return (
    <div className="space-y-3">
      {best && (
        <div className="rounded-2xl bg-gradient-to-br from-yellow-950 to-amber-950 border border-yellow-700 p-4">
          <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1">Best Value for 6-Person Pool</div>
          <div className="text-xl font-black text-yellow-300">{best.team}</div>
          <div className="text-sm text-yellow-600 mt-0.5">
            Only {best.espn_pct.toFixed(1)}% picking them — model says {best.final_sim_pct.toFixed(1)}% ±{ci95(best.final_sim_pct)}%
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <div><div className="text-xs text-gray-500">Value Ratio</div><div className="font-bold text-yellow-300">{best.value_ratio.toFixed(2)}×</div></div>
            <div><div className="text-xs text-gray-500">Pool EV</div><div className="font-bold text-green-400">${best.pool_ev.toFixed(2)}</div></div>
            {best.magic_circle && <div className="flex items-end"><span className="text-xs text-emerald-400 font-bold">✦ Magic Circle</span></div>}
          </div>
          <button onClick={() => onDetails(best.team)} className="mt-3 text-xs text-yellow-400 hover:text-yellow-300">View full profile →</button>
        </div>
      )}
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">All Teams by Value Ratio</div>
        <div className="space-y-3">
          {sorted.map((t, i) => (
            <TeamCard key={t.team} team={t} rank={i + 1} isTop={i === 0} onDetails={onDetails} />
          ))}
        </div>
      </div>
      <ExplainerCard />
    </div>
  );
}

// ── All Teams Tab ─────────────────────────────────────────────────────────────

function AllTeamsTab({ teams, onDetails }: { teams: SimResult[]; onDetails: (n: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
          {teams.length} teams · 100K simulations · click any row for details
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-2">#</th>
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-right py-2 pr-3">Win % <span className="text-gray-700 font-normal">±CI</span></th>
                <th className="text-right py-2 pr-3">ESPN %</th>
                <th className="text-right py-2 pr-3">Pool EV</th>
                <th className="text-right py-2 pr-3">Value</th>
                <th className="text-right py-2">MC</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.team} className="border-b border-gray-900 hover:bg-gray-800/50 cursor-pointer" onClick={() => onDetails(t.team)}>
                  <td className="py-2 pr-2 text-gray-600">{i + 1}</td>
                  <td className="py-2 pr-3 font-bold text-white">{t.team}</td>
                  <td className="py-2 pr-3 text-right">
                    <span className="font-bold">{t.final_sim_pct.toFixed(1)}%</span>
                    <span className="text-gray-700 text-xs ml-1">±{ci95(t.final_sim_pct)}%</span>
                  </td>
                  <td className="py-2 pr-3 text-right text-gray-400">{t.espn_pct.toFixed(1)}%</td>
                  <td className="py-2 pr-3 text-right text-green-400">${t.pool_ev.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-right text-yellow-400">{t.value_ratio.toFixed(2)}×</td>
                  <td className="py-2 text-right text-emerald-400">{t.magic_circle ? "✦" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-3">
          {teams.map((t, i) => (
            <TeamCard key={t.team} team={t} rank={i + 1} isTop={false} onDetails={onDetails} />
          ))}
        </div>
      </div>
      <ExplainerCard />
    </div>
  );
}

// ── Explainer card ────────────────────────────────────────────────────────────

function ExplainerCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
      <button className="w-full flex items-center justify-between text-sm text-gray-400 font-medium"
        onClick={() => setOpen((o) => !o)}>
        <span>How does this work?</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-3 text-sm text-gray-400 space-y-2">
          <p>We ran <strong className="text-white">100,000 simulated tournaments</strong> using KenPom efficiency stats and 40 years of historical data.</p>
          <p><strong className="text-emerald-400">✦ Magic Circle</strong> — top-25 offense, top-40 defense, high efficiency. Historical champions almost always check all three boxes.</p>
          <p><strong className="text-yellow-400">Value picks</strong> — teams our model thinks are underrated vs. how many people are picking them in public pools.</p>
          <p><strong className="text-gray-300">±CI</strong> — 95% confidence interval on win probability from 100K simulations.</p>
          <p><strong className="text-green-400">Pool EV</strong> — expected value in a 6-person $320 pool, adjusted for how many other people are picking the same team.</p>
        </div>
      )}
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<SimulationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("picks");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [modalTeam, setModalTeam] = useState<string | null>(null);

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
  const modalResult = teams.find((t) => t.team === modalTeam) ?? null;
  const modalTeamData = TEAMS.find((t) => t.name === modalTeam);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {modalResult && (
        <TeamModal result={modalResult} teamData={modalTeamData} onClose={() => setModalTeam(null)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="font-black text-white text-lg leading-tight">March Madness 2026</h1>
            <p className="text-xs text-gray-500">{lastUpdated ? `Updated ${relativeTime(lastUpdated)}` : "Loading…"}</p>
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-bold transition-colors">
            {loading ? "Running…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-gray-800 bg-gray-950 sticky top-[60px] z-10">
        <div className="max-w-3xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-2xl bg-blue-950 border border-blue-800 p-6 text-center animate-pulse">
            <div className="text-blue-300 font-bold">Running 100,000 simulations…</div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="max-w-3xl mx-auto px-4 pt-16 text-center text-gray-600 text-sm">Loading…</div>
      )}

      {data && !loading && (
        <main className="max-w-3xl mx-auto px-4 py-4 pb-16">
          {tab === "picks"     && <PicksTab teams={teams} onDetails={setModalTeam} />}
          {tab === "value"     && <ValueTab teams={teams} onDetails={setModalTeam} />}
          {tab === "analytics" && <AnalyticsTab results={teams} onSelectTeam={setModalTeam} />}
          {tab === "bracket"   && <BracketTab results={teams} onSelectTeam={setModalTeam} />}
          {tab === "upsets"    && <UpsetAlertsTab results={teams} onSelectTeam={setModalTeam} />}
          {tab === "h2h"       && <HeadToHeadTab results={teams} onSelectTeam={setModalTeam} />}
          {tab === "all"       && <AllTeamsTab teams={teams} onDetails={setModalTeam} />}
          {lastUpdated && (
            <p className="text-center text-xs text-gray-700 pt-4">
              Data last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </main>
      )}
    </div>
  );
}
