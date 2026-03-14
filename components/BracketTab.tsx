"use client";

import type { SimResult } from "@/lib/types";
import { TEAMS } from "@/lib/teams-data";
import { blendedWinProb } from "@/lib/simulate";

// ── Bracket structure ─────────────────────────────────────────────────────────
// 16-team bracket using our 13 tracked teams + 3 TBD lower seeds

const TBD_14 = { name: "TBD (14)",  kenpomRank: 17, adjO: 40, adjD: 22, adjEM: 19.5, net: 20, sos: 25, trend: "steady" as const, status: "Unknown", espnPct: 0.1 };
const TBD_15 = { name: "TBD (15)",  kenpomRank: 18, adjO: 45, adjD: 25, adjEM: 18.0, net: 22, sos: 28, trend: "steady" as const, status: "Unknown", espnPct: 0.1 };
const TBD_16 = { name: "TBD (16)",  kenpomRank: 20, adjO: 50, adjD: 28, adjEM: 16.5, net: 25, sos: 30, trend: "steady" as const, status: "Unknown", espnPct: 0.0 };

const ALL_BRACKET_TEAMS = [...TEAMS, TBD_14, TBD_15, TBD_16];
const getT = (name: string) => ALL_BRACKET_TEAMS.find((t) => t.name === name)!;

// 8 first-round matchups in standard 1-16 bracket pairing
// Seeds based on KenPom rank order: 1=Duke, 2=Michigan, 3=Arizona, 4=Florida,
// 5=Illinois, 6=Houston, 7=Iowa State, 8=Michigan State, 9=Gonzaga,
// 10=UConn, 11=Louisville, 12=Nebraska, 13=BYU, 14=TBD-14, 15=TBD-15, 16=TBD-16

const ROUND1: [string, string][] = [
  ["Duke",          "TBD (16)"],     // 1 vs 16
  ["Michigan State","Gonzaga"],       // 8 vs 9
  ["Illinois",      "Nebraska"],      // 5 vs 12
  ["Florida",       "BYU"],           // 4 vs 13
  ["Houston",       "Louisville"],    // 6 vs 11
  ["Arizona",       "TBD (14)"],      // 3 vs 14
  ["Iowa State",    "UConn"],         // 7 vs 10
  ["Michigan",      "TBD (15)"],      // 2 vs 15
];

// Matchup pairs for QF/SF/F: indices into previous round's winners
const QF_PAIRS = [[0, 1], [2, 3], [4, 5], [6, 7]];  // R1 winners 0v1, 2v3, 4v5, 6v7
const SF_PAIRS = [[0, 1], [2, 3]];                   // QF winners 0v1, 2v3
const F_PAIRS  = [[0, 1]];                            // SF winners

function matchupProb(nameA: string, nameB: string): number {
  const tA = getT(nameA), tB = getT(nameB);
  if (!tA || !tB) return 0.5;
  return blendedWinProb(tA, tB);
}

function predictWinner(a: string, b: string): { winner: string; loser: string; prob: number } {
  const p = matchupProb(a, b);
  return p >= 0.5
    ? { winner: a, loser: b, prob: p }
    : { winner: b, loser: a, prob: 1 - p };
}

// ── TeamSlot ──────────────────────────────────────────────────────────────────

function TeamSlot({
  name, prob, isWinner, isTbd, onSelect,
}: {
  name: string; prob?: number; isWinner: boolean; isTbd: boolean;
  onSelect?: (name: string) => void;
}) {
  const isMC = TEAMS.find((t) => t.name === name)?.adjO !== undefined &&
    TEAMS.find((t) => t.name === name)!.adjO <= 25 &&
    TEAMS.find((t) => t.name === name)!.adjD <= 40;

  return (
    <button
      disabled={isTbd || !onSelect}
      onClick={() => onSelect && !isTbd && onSelect(name)}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
        isTbd
          ? "text-gray-700 bg-gray-900 cursor-default"
          : isWinner
          ? "bg-blue-900 border border-blue-700 text-white font-bold hover:bg-blue-800"
          : "bg-gray-900 border border-gray-800 text-gray-500 hover:bg-gray-800"
      }`}
    >
      <span className="truncate max-w-[80px]">{name.replace("Iowa State", "Iowa St").replace("Michigan State", "Mich St").replace("Michigan", "Mich").replace("Nebraska", "Neb")}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isMC && isWinner && <span className="text-emerald-400 text-xs">✦</span>}
        {prob !== undefined && !isTbd && (
          <span className={isWinner ? "text-blue-300" : "text-gray-600"}>
            {(prob * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </button>
  );
}

// ── Game ──────────────────────────────────────────────────────────────────────

function Game({ teamA, teamB, onSelect }: { teamA: string; teamB: string; onSelect?: (name: string) => void }) {
  const { winner, loser, prob } = predictWinner(teamA, teamB);
  const tbd = teamA.startsWith("TBD") || teamB.startsWith("TBD");
  return (
    <div className="space-y-0.5">
      <TeamSlot name={teamA} prob={teamA === winner ? prob : 1 - prob} isWinner={teamA === winner} isTbd={teamA.startsWith("TBD")} onSelect={onSelect} />
      <TeamSlot name={teamB} prob={teamB === winner ? prob : 1 - prob} isWinner={teamB === winner} isTbd={teamB.startsWith("TBD")} onSelect={onSelect} />
      {tbd && <div className="text-center text-xs text-gray-700 py-0.5">Seed TBD — Selection Sunday</div>}
    </div>
  );
}

// ── Round column ──────────────────────────────────────────────────────────────

function RoundColumn({ label, games, onSelect }: {
  label: string;
  games: [string, string][];
  onSelect?: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[130px]">
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 pb-1 border-b border-gray-800">
        {label}
      </div>
      <div className="flex flex-col justify-around flex-1 gap-3">
        {games.map(([a, b], i) => (
          <Game key={i} teamA={a} teamB={b} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ── Champion callout ──────────────────────────────────────────────────────────

function ChampionSlot({ name, onSelect }: { name: string; onSelect?: (name: string) => void }) {
  const isMC = TEAMS.find((t) => t.name === name)?.adjO !== undefined &&
    TEAMS.find((t) => t.name === name)!.adjO <= 25 &&
    TEAMS.find((t) => t.name === name)!.adjD <= 40;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[110px]">
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-800 w-full text-center">
        Champion
      </div>
      <button
        onClick={() => onSelect && onSelect(name)}
        className="flex flex-col items-center gap-1.5 bg-gradient-to-b from-yellow-900 to-yellow-950 border-2 border-yellow-600 rounded-xl px-3 py-4 w-full hover:border-yellow-400 transition-colors"
      >
        <span className="text-2xl">🏆</span>
        <span className="font-black text-yellow-300 text-sm text-center leading-tight">{name}</span>
        {isMC && <span className="text-xs text-emerald-400">✦ Magic Circle</span>}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BracketTab({ results, onSelectTeam }: {
  results: SimResult[];
  onSelectTeam: (name: string) => void;
}) {
  // Round 1 → compute winners
  const r1Winners = ROUND1.map(([a, b]) => predictWinner(a, b).winner);
  // QF
  const qfGames: [string, string][] = QF_PAIRS.map(([i, j]) => [r1Winners[i], r1Winners[j]]);
  const qfWinners = qfGames.map(([a, b]) => predictWinner(a, b).winner);
  // SF
  const sfGames: [string, string][] = SF_PAIRS.map(([i, j]) => [qfWinners[i], qfWinners[j]]);
  const sfWinners = sfGames.map(([a, b]) => predictWinner(a, b).winner);
  // Final
  const finalGame: [string, string] = [sfWinners[0], sfWinners[1]];
  const champion = predictWinner(...finalGame).winner;

  return (
    <div className="space-y-4">
      {/* Note */}
      <div className="rounded-xl bg-blue-950 border border-blue-900 px-4 py-2.5 text-xs text-blue-300">
        Predicted bracket based on our Monte Carlo model. TBD seeds fill in after Selection Sunday (March 15). Tap any team to see their full profile.
      </div>

      {/* Bracket — horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 items-start min-w-max px-1 py-2">
          <RoundColumn label="Round of 16" games={ROUND1.slice(0, 4)} onSelect={onSelectTeam} />
          <RoundColumn label="Quarterfinals" games={qfGames.slice(0, 2)} onSelect={onSelectTeam} />
          <RoundColumn label="Final Four" games={[sfGames[0]]} onSelect={onSelectTeam} />
          <ChampionSlot name={champion} onSelect={onSelectTeam} />
          <RoundColumn label="Final Four" games={[sfGames[1]]} onSelect={onSelectTeam} />
          <RoundColumn label="Quarterfinals" games={qfGames.slice(2, 4)} onSelect={onSelectTeam} />
          <RoundColumn label="Round of 16" games={ROUND1.slice(4, 8)} onSelect={onSelectTeam} />
        </div>
      </div>

      {/* Predicted path to the title */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Model's Predicted Path — {champion}
        </h2>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {(() => {
            // Trace champion's path back through rounds
            const path: Array<{ round: string; opp: string; prob: number }> = [];

            // R1
            const r1Idx = r1Winners.indexOf(champion);
            if (r1Idx >= 0) {
              const [a, b] = ROUND1[r1Idx];
              const opp = a === champion ? b : a;
              path.push({ round: "R16", opp, prob: matchupProb(champion, opp) });
            }

            // QF
            const qfIdx = qfWinners.indexOf(champion);
            if (qfIdx >= 0) {
              const [a, b] = qfGames[qfIdx];
              const opp = a === champion ? b : a;
              path.push({ round: "QF", opp, prob: Math.max(matchupProb(champion, opp), 1 - matchupProb(champion, opp)) });
            }

            // SF
            const sfIdx = sfWinners.indexOf(champion);
            if (sfIdx >= 0) {
              const [a, b] = sfGames[sfIdx];
              const opp = a === champion ? b : a;
              path.push({ round: "Final 4", opp, prob: Math.max(matchupProb(champion, opp), 1 - matchupProb(champion, opp)) });
            }

            // Final
            const [fa, fb] = finalGame;
            const finalOpp = fa === champion ? fb : fa;
            path.push({ round: "Final", opp: finalOpp, prob: Math.max(matchupProb(champion, finalOpp), 1 - matchupProb(champion, finalOpp)) });

            return path.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-700">→</span>}
                <div className="bg-gray-800 rounded-lg px-3 py-2 text-center">
                  <div className="text-xs text-gray-500">{step.round}</div>
                  <div className="text-xs text-gray-400">def. {step.opp.replace("TBD (14)", "TBD").replace("TBD (15)", "TBD").replace("TBD (16)", "TBD")}</div>
                  <div className="font-bold text-blue-400">{(step.prob * 100).toFixed(0)}%</div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
