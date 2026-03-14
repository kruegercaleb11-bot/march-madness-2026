"use client";

import { useState } from "react";
import type { SimResult } from "@/lib/types";
import { TEAMS, type TeamInput } from "@/lib/teams-data";

// ── Radar chart helpers ───────────────────────────────────────────────────────

const ALL_ADJ_O = TEAMS.map((t) => t.adjO);
const ALL_ADJ_D = TEAMS.map((t) => t.adjD);
const ALL_SOS   = TEAMS.map((t) => t.sos);
const MAX_ADJ_O = Math.max(...ALL_ADJ_O);
const MAX_ADJ_D = Math.max(...ALL_ADJ_D);
const MAX_SOS   = Math.max(...ALL_SOS);
const MIN_ADJ_EM = Math.min(...TEAMS.map((t) => t.adjEM));
const MAX_ADJ_EM = Math.max(...TEAMS.map((t) => t.adjEM));

function normalize(t: TeamInput) {
  return {
    offense:    (MAX_ADJ_O + 1 - t.adjO) / MAX_ADJ_O,              // lower rank = better
    defense:    (MAX_ADJ_D + 1 - t.adjD) / MAX_ADJ_D,
    efficiency: (t.adjEM - MIN_ADJ_EM) / (MAX_ADJ_EM - MIN_ADJ_EM),
    schedule:   (MAX_SOS + 1 - t.sos) / MAX_SOS,                    // lower sos rank = harder = better
    form:       t.trend === "up" ? 1 : t.trend === "down" ? 0.1 : 0.5,
  };
}

const AXES = [
  { label: "Offense",    angle: -90 },
  { label: "Defense",    angle: -18 },
  { label: "Efficiency", angle:  54 },
  { label: "Schedule",   angle: 126 },
  { label: "Form",       angle: 198 },
];

function radarPoints(scores: number[], cx = 90, cy = 90, r = 72): string {
  return AXES.map((ax, i) => {
    const rad = (ax.angle * Math.PI) / 180;
    const s = Math.max(0.05, scores[i]);
    return `${cx + r * s * Math.cos(rad)},${cy + r * s * Math.sin(rad)}`;
  }).join(" ");
}

function bgPoints(cx = 90, cy = 90, r = 72): string {
  return AXES.map((ax) => {
    const rad = (ax.angle * Math.PI) / 180;
    return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
  }).join(" ");
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function RadarChart({ teams }: { teams: TeamInput[] }) {
  const cx = 90, cy = 90, r = 72;
  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-xs mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <polygon key={frac} points={bgPoints(cx, cy, r * frac)}
          fill="none" stroke="#374151" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {AXES.map((ax) => {
        const rad = (ax.angle * Math.PI) / 180;
        return (
          <line key={ax.label}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
            stroke="#374151" strokeWidth="0.5"
          />
        );
      })}
      {/* Team polygons */}
      {teams.map((t, i) => {
        const scores = normalize(t);
        const vals = [scores.offense, scores.defense, scores.efficiency, scores.schedule, scores.form];
        return (
          <polygon key={t.name}
            points={radarPoints(vals, cx, cy, r)}
            fill={COLORS[i % COLORS.length] + "33"}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="1.5"
          />
        );
      })}
      {/* Axis labels */}
      {AXES.map((ax) => {
        const rad = (ax.angle * Math.PI) / 180;
        const lx = cx + (r + 14) * Math.cos(rad);
        const ly = cy + (r + 14) * Math.sin(rad);
        return (
          <text key={ax.label} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fill="#9ca3af"
          >{ax.label}</text>
        );
      })}
    </svg>
  );
}

// ── Stat comparison bar ────────────────────────────────────────────────────────

function CompareBar({ label, a, b, aLabel, bLabel }: {
  label: string; a: number; b: number; aLabel: string; bLabel: string;
}) {
  const total = a + b || 1;
  const aPct = (a / total) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="text-blue-400 font-bold">{aLabel}</span>
        <span className="text-gray-400">{label}</span>
        <span className="text-emerald-400 font-bold">{bLabel}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
        <div className="bg-blue-500 transition-all duration-500" style={{ width: `${aPct}%` }} />
        <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${100 - aPct}%` }} />
      </div>
      <div className="flex justify-between text-xs mt-0.5">
        <span className="text-blue-400">{typeof a === "number" && a < 1 ? a.toFixed(2) : a}</span>
        <span className="text-emerald-400">{typeof b === "number" && b < 1 ? b.toFixed(2) : b}</span>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

interface AnalyticsTabProps {
  results: SimResult[];
  onSelectTeam: (name: string) => void;
}

export default function AnalyticsTab({ results, onSelectTeam }: AnalyticsTabProps) {
  const [compareA, setCompareA] = useState(results[0]?.team ?? "");
  const [compareB, setCompareB] = useState(results[2]?.team ?? "");

  const teamNames = results.map((r) => r.team);
  const getTeam = (name: string) => TEAMS.find((t) => t.name === name);
  const getResult = (name: string) => results.find((r) => r.team === name);

  const tA = getTeam(compareA);
  const tB = getTeam(compareB);
  const rA = getResult(compareA);
  const rB = getResult(compareB);

  // Radar for comparison (up to 4 teams)
  const topTeams = results.slice(0, 4).map((r) => getTeam(r.team)).filter(Boolean) as TeamInput[];

  return (
    <div className="space-y-6">
      {/* Top-4 radar */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Top 4 Teams — Profile Radar
        </h2>
        <RadarChart teams={topTeams} />
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {topTeams.map((t, i) => (
            <button
              key={t.name}
              onClick={() => onSelectTeam(t.name)}
              className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
            >
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i] }} />
              <span className="text-gray-300">{t.name}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-700 mt-2">Tap a name to view full details</p>
      </section>

      {/* Head-to-head comparison */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Team Comparison
        </h2>
        <div className="flex gap-2 mb-4">
          <select value={compareA} onChange={(e) => setCompareA(e.target.value)}
            className="flex-1 bg-blue-950 border border-blue-800 rounded-xl px-3 py-2 text-sm text-blue-300 font-bold focus:outline-none">
            {teamNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="flex items-center text-gray-600 font-bold text-sm px-1">vs</span>
          <select value={compareB} onChange={(e) => setCompareB(e.target.value)}
            className="flex-1 bg-emerald-950 border border-emerald-800 rounded-xl px-3 py-2 text-sm text-emerald-300 font-bold focus:outline-none">
            {teamNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {tA && tB && rA && rB && (
          <div className="space-y-1">
            <CompareBar label="Win Chance" a={rA.final_sim_pct} b={rB.final_sim_pct} aLabel={`${rA.final_sim_pct.toFixed(1)}%`} bLabel={`${rB.final_sim_pct.toFixed(1)}%`} />
            <CompareBar label="Pool EV" a={rA.pool_ev} b={rB.pool_ev} aLabel={`$${rA.pool_ev.toFixed(0)}`} bLabel={`$${rB.pool_ev.toFixed(0)}`} />
            <CompareBar label="AdjEM" a={tA.adjEM} b={tB.adjEM} aLabel={tA.adjEM.toFixed(1)} bLabel={tB.adjEM.toFixed(1)} />
            <CompareBar label="Offense Rank" a={MAX_ADJ_O - tA.adjO} b={MAX_ADJ_O - tB.adjO} aLabel={`#${tA.adjO}`} bLabel={`#${tB.adjO}`} />
            <CompareBar label="Defense Rank" a={MAX_ADJ_D - tA.adjD} b={MAX_ADJ_D - tB.adjD} aLabel={`#${tA.adjD}`} bLabel={`#${tB.adjD}`} />
            <CompareBar label="SOS (lower=tougher)" a={MAX_SOS - tA.sos} b={MAX_SOS - tB.sos} aLabel={`#${tA.sos}`} bLabel={`#${tB.sos}`} />
            <CompareBar label="Value Ratio" a={rA.value_ratio} b={rB.value_ratio} aLabel={`${rA.value_ratio.toFixed(2)}×`} bLabel={`${rB.value_ratio.toFixed(2)}×`} />
          </div>
        )}

        {tA && tB && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[{ r: rA, t: tA, color: "border-blue-800 bg-blue-950" }, { r: rB, t: tB, color: "border-emerald-800 bg-emerald-950" }].map(({ r, t, color }) => r && (
              <div key={t.name} className={`rounded-xl border ${color} p-3`}>
                <div className="font-bold text-white text-sm mb-1">{t.name}</div>
                {r.magic_circle && <div className="text-xs text-emerald-400 mb-1">✦ Magic Circle</div>}
                {r.repeat_tax && <div className="text-xs text-orange-400">↩ Repeat tax</div>}
                {r.big_ten_penalty && <div className="text-xs text-blue-400">🔵 Big Ten −6%</div>}
                {r.injury_penalty && <div className="text-xs text-red-400">🚑 Injury flag</div>}
                {r.sos_discount && <div className="text-xs text-gray-400">📅 Weak SOS</div>}
                {r.defense_fail && <div className="text-xs text-red-400">🛡 Defense fail</div>}
                {r.trend_mod > 0 && <div className="text-xs text-green-400">↑ Trending up</div>}
                {r.trend_mod < 0 && <div className="text-xs text-orange-400">↓ Trending down</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Individual radar + can/can't win for all teams */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          All Team Profiles — Tap for Deep Dive
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((r) => {
            const t = getTeam(r.team);
            if (!t) return null;
            const scores = normalize(t);
            const vals = [scores.offense, scores.defense, scores.efficiency, scores.schedule, scores.form];
            const isStrong = r.magic_circle;
            return (
              <button
                key={r.team}
                onClick={() => onSelectTeam(r.team)}
                className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{r.team}</span>
                  <span className={`text-xs font-bold ${isStrong ? "text-emerald-400" : "text-gray-500"}`}>
                    {isStrong ? "✦ MC" : `#${t.kenpomRank}`}
                  </span>
                </div>
                <svg viewBox="0 0 180 180" className="w-24 h-24">
                  {[0.5, 1].map((frac) => (
                    <polygon key={frac} points={bgPoints(90, 90, 72 * frac)}
                      fill="none" stroke="#374151" strokeWidth="0.5" />
                  ))}
                  {AXES.map((ax) => {
                    const rad = (ax.angle * Math.PI) / 180;
                    return <line key={ax.label} x1={90} y1={90}
                      x2={90 + 72 * Math.cos(rad)} y2={90 + 72 * Math.sin(rad)}
                      stroke="#374151" strokeWidth="0.5" />;
                  })}
                  <polygon
                    points={radarPoints(vals)}
                    fill={isStrong ? "#10b98133" : "#3b82f633"}
                    stroke={isStrong ? "#10b981" : "#3b82f6"}
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="text-xs text-gray-500 mt-1">{r.final_sim_pct.toFixed(1)}% win chance</div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
