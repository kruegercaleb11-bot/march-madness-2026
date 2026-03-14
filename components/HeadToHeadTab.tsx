"use client";

import { useState, useCallback } from "react";
import type { SimResult } from "@/lib/types";
import { TEAMS } from "@/lib/teams-data";
import { blendedWinProb } from "@/lib/simulate";

const SIMS = 10_000;

// ── Inline mini-sim (just 2 teams, no tournament bracket) ─────────────────────

function runH2H(nameA: string, nameB: string): { winsA: number; winsB: number } {
  const tA = TEAMS.find((t) => t.name === nameA)!;
  const tB = TEAMS.find((t) => t.name === nameB)!;
  const pA = blendedWinProb(tA, tB);
  let winsA = 0;
  for (let i = 0; i < SIMS; i++) {
    if (Math.random() < pA) winsA++;
  }
  return { winsA, winsB: SIMS - winsA };
}

// ── Win probability gauge ─────────────────────────────────────────────────────

function Gauge({ probA, nameA, nameB }: { probA: number; nameA: string; nameB: string }) {
  const pctA = (probA * 100).toFixed(1);
  const pctB = ((1 - probA) * 100).toFixed(1);
  const aWins = probA >= 0.5;
  return (
    <div className="my-4">
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className={aWins ? "text-blue-400 text-base" : "text-gray-400"}>{nameA}</span>
        <span className={!aWins ? "text-emerald-400 text-base" : "text-gray-400"}>{nameB}</span>
      </div>
      <div className="flex h-8 rounded-xl overflow-hidden border border-gray-700">
        <div
          className={`flex items-center justify-center text-sm font-black transition-all duration-700 ${aWins ? "bg-blue-600" : "bg-blue-900"}`}
          style={{ width: `${probA * 100}%` }}
        >
          {probA > 0.15 && <span className="text-white">{pctA}%</span>}
        </div>
        <div
          className={`flex items-center justify-center text-sm font-black transition-all duration-700 ${!aWins ? "bg-emerald-600" : "bg-emerald-900"}`}
          style={{ width: `${(1 - probA) * 100}%` }}
        >
          {(1 - probA) > 0.15 && <span className="text-white">{pctB}%</span>}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{pctA}% win probability</span>
        <span>{pctB}% win probability</span>
      </div>
    </div>
  );
}

// ── Stat comparison row ───────────────────────────────────────────────────────

function StatCompareRow({
  label, aVal, bVal, aRaw, bRaw, lowerIsBetter,
}: {
  label: string; aVal: string; bVal: string; aRaw: number; bRaw: number; lowerIsBetter?: boolean;
}) {
  const aWins = lowerIsBetter ? aRaw < bRaw : aRaw > bRaw;
  return (
    <div className="flex items-center text-xs py-2 border-b border-gray-800 last:border-0">
      <div className={`flex-1 text-right pr-2 font-bold ${aWins ? "text-white" : "text-gray-500"}`}>{aVal}</div>
      <div className="w-28 text-center text-gray-600 px-2">{label}</div>
      <div className={`flex-1 text-left pl-2 font-bold ${!aWins ? "text-white" : "text-gray-500"}`}>{bVal}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HeadToHeadTab({
  results,
  onSelectTeam,
}: {
  results: SimResult[];
  onSelectTeam: (name: string) => void;
}) {
  const names = TEAMS.map((t) => t.name);
  const [teamA, setTeamA] = useState(results[0]?.team ?? names[0]);
  const [teamB, setTeamB] = useState(results[2]?.team ?? names[2]);
  const [simResult, setSimResult] = useState<{ winsA: number; winsB: number } | null>(null);
  const [running, setRunning] = useState(false);

  const tA = TEAMS.find((t) => t.name === teamA)!;
  const tB = TEAMS.find((t) => t.name === teamB)!;
  const rA = results.find((r) => r.team === teamA);
  const rB = results.find((r) => r.team === teamB);

  // Live blended probability (instant, no simulation needed)
  const liveProb = tA && tB ? blendedWinProb(tA, tB) : 0.5;

  const simulate = useCallback(() => {
    if (teamA === teamB) return;
    setRunning(true);
    // Run async so UI can update
    setTimeout(() => {
      setSimResult(runH2H(teamA, teamB));
      setRunning(false);
    }, 10);
  }, [teamA, teamB]);

  const displayProb = simResult ? simResult.winsA / SIMS : liveProb;

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="flex gap-2 items-center">
        <select
          value={teamA}
          onChange={(e) => { setTeamA(e.target.value); setSimResult(null); }}
          className="flex-1 bg-blue-950 border border-blue-800 rounded-xl px-3 py-3 text-sm text-blue-300 font-bold focus:outline-none"
        >
          {names.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-gray-600 font-black text-lg">vs</span>
        <select
          value={teamB}
          onChange={(e) => { setTeamB(e.target.value); setSimResult(null); }}
          className="flex-1 bg-emerald-950 border border-emerald-800 rounded-xl px-3 py-3 text-sm text-emerald-300 font-bold focus:outline-none"
        >
          {names.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {teamA === teamB && (
        <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 text-center text-gray-500 text-sm">
          Select two different teams.
        </div>
      )}

      {teamA !== teamB && tA && tB && (
        <>
          {/* Win probability gauge */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              {simResult ? `${SIMS.toLocaleString()} Simulation Result` : "Live Model Probability"}
            </div>
            <Gauge probA={displayProb} nameA={teamA} nameB={teamB} />

            <button
              onClick={simulate}
              disabled={running}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold text-sm transition-colors mt-2"
            >
              {running ? `Running ${SIMS.toLocaleString()} simulations…` : `Run ${SIMS.toLocaleString()} Matchup Simulations`}
            </button>

            {simResult && (
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>{teamA}: {simResult.winsA.toLocaleString()} wins</span>
                <span>{teamB}: {simResult.winsB.toLocaleString()} wins</span>
              </div>
            )}
          </div>

          {/* Stats breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Head-to-Head Stats</div>
            <StatCompareRow label="KenPom Rank" aVal={`#${tA.kenpomRank}`} bVal={`#${tB.kenpomRank}`} aRaw={tA.kenpomRank} bRaw={tB.kenpomRank} lowerIsBetter />
            <StatCompareRow label="AdjEM" aVal={tA.adjEM.toFixed(2)} bVal={tB.adjEM.toFixed(2)} aRaw={tA.adjEM} bRaw={tB.adjEM} />
            <StatCompareRow label="Offense Rank" aVal={`#${tA.adjO}`} bVal={`#${tB.adjO}`} aRaw={tA.adjO} bRaw={tB.adjO} lowerIsBetter />
            <StatCompareRow label="Defense Rank" aVal={`#${tA.adjD}`} bVal={`#${tB.adjD}`} aRaw={tA.adjD} bRaw={tB.adjD} lowerIsBetter />
            <StatCompareRow label="SOS Rank" aVal={`#${tA.sos}`} bVal={`#${tB.sos}`} aRaw={tA.sos} bRaw={tB.sos} lowerIsBetter />
            {rA && rB && <>
              <StatCompareRow label="Champ Win %" aVal={`${rA.final_sim_pct.toFixed(1)}%`} bVal={`${rB.final_sim_pct.toFixed(1)}%`} aRaw={rA.final_sim_pct} bRaw={rB.final_sim_pct} />
              <StatCompareRow label="Pool EV" aVal={`$${rA.pool_ev.toFixed(2)}`} bVal={`$${rB.pool_ev.toFixed(2)}`} aRaw={rA.pool_ev} bRaw={rB.pool_ev} />
              <StatCompareRow label="Value Ratio" aVal={`${rA.value_ratio.toFixed(2)}×`} bVal={`${rB.value_ratio.toFixed(2)}×`} aRaw={rA.value_ratio} bRaw={rB.value_ratio} />
            </>}
          </div>

          {/* Champion Profile comparison */}
          <div className="grid grid-cols-2 gap-3">
            {([{ name: teamA, r: rA, color: "border-blue-800 bg-blue-950" }, { name: teamB, r: rB, color: "border-emerald-800 bg-emerald-950" }] as const).map(
              ({ name, r, color }) => r && (
                <button
                  key={name}
                  onClick={() => onSelectTeam(name)}
                  className={`text-left rounded-2xl border p-3 ${color} hover:opacity-80 transition-opacity`}
                >
                  <div className="font-bold text-white text-sm mb-2">{name}</div>
                  <div className="space-y-1">
                    <div className={`text-xs font-bold ${r.magic_circle ? "text-emerald-400" : "text-gray-600"}`}>
                      {r.magic_circle ? "✦ Magic Circle" : "✗ No Magic Circle"}
                    </div>
                    {r.repeat_tax      && <div className="text-xs text-orange-400">↩ Defending Champ</div>}
                    {r.big_ten_penalty && <div className="text-xs text-blue-400">🔵 Big Ten −6%</div>}
                    {r.injury_penalty  && <div className="text-xs text-red-400">🚑 Injury Flag</div>}
                    {r.sos_discount    && <div className="text-xs text-gray-500">📅 Weak SOS</div>}
                    {r.defense_fail    && <div className="text-xs text-red-400">🛡 Defense Fail</div>}
                    {r.trend_mod > 0   && <div className="text-xs text-green-400">↑ Trending Up</div>}
                    {r.trend_mod < 0   && <div className="text-xs text-orange-400">↓ Trending Down</div>}
                    <div className="text-xs text-gray-600 pt-1">Tap for full profile →</div>
                  </div>
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
