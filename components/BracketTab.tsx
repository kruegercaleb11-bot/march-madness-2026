"use client";

import type { SimResult } from "@/lib/types";
import { TEAMS } from "@/lib/teams-data";
import { blendedWinProb } from "@/lib/simulate";

const getT = (name: string) => TEAMS.find((t) => t.name === name)!;

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchupProb(a: string, b: string): number {
  const tA = getT(a), tB = getT(b);
  if (!tA || !tB) return 0.5;
  return blendedWinProb(tA, tB);
}

function predictWinner(a: string, b: string): { winner: string; prob: number } {
  const p = matchupProb(a, b);
  return p >= 0.5 ? { winner: a, prob: p } : { winner: b, prob: 1 - p };
}

function isMagicCircle(name: string): boolean {
  const t = TEAMS.find((t) => t.name === name);
  return !!t && t.adjO <= 25 && t.adjD <= 40 && t.adjEM >= 25;
}

const SHORT: Record<string, string> = {
  "Michigan State":  "Mich St",
  "Iowa State":      "Iowa St",
  "Tennessee State": "TN St",
  "North Carolina":  "UNC",
  "Kennesaw State":  "Ken. St",
  "Wright State":    "Wright St",
  "South Florida":   "S. Fla",
  "Northern Iowa":   "N. Iowa",
  "Cal Baptist":     "Cal Bap",
  "Prairie View":    "Pr. View",
  "Texas A&M":       "TX A&M",
  "Texas Tech":      "TX Tech",
  "Saint Mary's":    "St. Mary's",
  "Santa Clara":     "Santa Cl.",
};
const abbr = (name: string) => SHORT[name] ?? name;

// ── Region matchup definitions (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15) ──

const EAST: [string, string][] = [
  ["Duke",          "Siena"],
  ["Ohio State",    "TCU"],
  ["St. John's",    "Northern Iowa"],
  ["Kansas",        "Cal Baptist"],
  ["Louisville",    "South Florida"],
  ["Michigan State","N. Dakota St"],
  ["UCLA",          "UCF"],
  ["UConn",         "Furman"],
];

const WEST: [string, string][] = [
  ["Arizona",       "LIU"],
  ["Villanova",     "Utah State"],
  ["Wisconsin",     "High Point"],
  ["Arkansas",      "Hawaii"],
  ["BYU",           "NC State"],
  ["Gonzaga",       "Kennesaw State"],
  ["Miami FL",      "Missouri"],
  ["Purdue",        "Queens"],
];

const MIDWEST: [string, string][] = [
  ["Michigan",      "UMBC"],
  ["Georgia",       "St. Louis"],
  ["Texas Tech",    "Akron"],
  ["Alabama",       "Hofstra"],
  ["Tennessee",     "SMU"],
  ["Virginia",      "Wright State"],
  ["Kentucky",      "Santa Clara"],
  ["Iowa State",    "Tennessee State"],
];

const SOUTH: [string, string][] = [
  ["Florida",       "Prairie View"],
  ["Clemson",       "Iowa"],
  ["Vanderbilt",    "McNeese"],
  ["Nebraska",      "Troy"],
  ["North Carolina","VCU"],
  ["Illinois",      "Penn"],
  ["Saint Mary's",  "Texas A&M"],
  ["Houston",       "Idaho"],
];

// ── Bracket computation ───────────────────────────────────────────────────────

function computeRegion(r1: [string, string][]) {
  const r1W = r1.map(([a, b]) => predictWinner(a, b).winner);
  const r2: [string, string][] = [
    [r1W[0], r1W[1]], [r1W[2], r1W[3]],
    [r1W[4], r1W[5]], [r1W[6], r1W[7]],
  ];
  const r2W = r2.map(([a, b]) => predictWinner(a, b).winner);
  const s16: [string, string][] = [[r2W[0], r2W[1]], [r2W[2], r2W[3]]];
  const s16W = s16.map(([a, b]) => predictWinner(a, b).winner);
  const e8: [string, string] = [s16W[0], s16W[1]];
  const champ = predictWinner(e8[0], e8[1]).winner;
  return { r1, r2, s16, e8, champ };
}

// ── TeamSlot ──────────────────────────────────────────────────────────────────

function TeamSlot({
  name, prob, isWinner, onSelect,
}: {
  name: string; prob: number; isWinner: boolean;
  onSelect?: (name: string) => void;
}) {
  const mc = isMagicCircle(name);
  return (
    <button
      onClick={() => onSelect?.(name)}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
        isWinner
          ? "bg-blue-900 border border-blue-700 text-white font-bold hover:bg-blue-800"
          : "bg-gray-900 border border-gray-800 text-gray-500 hover:bg-gray-800"
      }`}
    >
      <span className="truncate max-w-[78px]">{abbr(name)}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {mc && isWinner && <span className="text-emerald-400">✦</span>}
        <span className={isWinner ? "text-blue-300" : "text-gray-600"}>
          {(prob * 100).toFixed(0)}%
        </span>
      </div>
    </button>
  );
}

// ── Game ──────────────────────────────────────────────────────────────────────

function Game({ teamA, teamB, onSelect }: {
  teamA: string; teamB: string; onSelect?: (name: string) => void;
}) {
  const { winner, prob } = predictWinner(teamA, teamB);
  return (
    <div className="space-y-0.5">
      <TeamSlot name={teamA} prob={teamA === winner ? prob : 1 - prob} isWinner={teamA === winner} onSelect={onSelect} />
      <TeamSlot name={teamB} prob={teamB === winner ? prob : 1 - prob} isWinner={teamB === winner} onSelect={onSelect} />
    </div>
  );
}

// ── Round column ──────────────────────────────────────────────────────────────

function RoundColumn({ label, games, onSelect }: {
  label: string; games: [string, string][]; onSelect?: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-[130px]">
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-800">
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

// ── Regional champ slot ───────────────────────────────────────────────────────

function RegionalChamp({ label, name, onSelect }: {
  label: string; name: string; onSelect?: (name: string) => void;
}) {
  const mc = isMagicCircle(name);
  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-800 w-full">
        {label}
      </div>
      <button
        onClick={() => onSelect?.(name)}
        className="flex flex-col items-center gap-1 bg-gradient-to-b from-blue-950 to-blue-900 border-2 border-blue-600 rounded-xl px-2 py-3 w-full hover:border-blue-400 transition-colors"
      >
        <span className="text-lg">🏅</span>
        <span className="font-black text-blue-300 text-xs text-center leading-tight">{abbr(name)}</span>
        {mc && <span className="text-xs text-emerald-400">✦</span>}
      </button>
    </div>
  );
}

// ── Final Four / Champion slot ────────────────────────────────────────────────

function ChampionSlot({ name, onSelect }: { name: string; onSelect?: (name: string) => void }) {
  const mc = isMagicCircle(name);
  return (
    <div className="flex flex-col items-center gap-2 min-w-[110px]">
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-800 w-full">
        Champion
      </div>
      <button
        onClick={() => onSelect?.(name)}
        className="flex flex-col items-center gap-1.5 bg-gradient-to-b from-yellow-900 to-yellow-950 border-2 border-yellow-600 rounded-xl px-3 py-4 w-full hover:border-yellow-400 transition-colors"
      >
        <span className="text-2xl">🏆</span>
        <span className="font-black text-yellow-300 text-sm text-center leading-tight">{name}</span>
        {mc && <span className="text-xs text-emerald-400">✦ Magic Circle</span>}
      </button>
    </div>
  );
}

// ── Region bracket ────────────────────────────────────────────────────────────

function RegionBracket({ name, data, onSelect }: {
  name: string;
  data: ReturnType<typeof computeRegion>;
  onSelect?: (name: string) => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{name} Region</h2>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 items-start min-w-max">
          <RoundColumn label="First Round"  games={data.r1.slice(0, 4)}  onSelect={onSelect} />
          <RoundColumn label="Round of 32"  games={data.r2.slice(0, 2)}  onSelect={onSelect} />
          <RoundColumn label="Sweet 16"     games={[data.s16[0]]}        onSelect={onSelect} />
          <RegionalChamp label="Elite Eight" name={data.champ}           onSelect={onSelect} />
          <RoundColumn label="Sweet 16"     games={[data.s16[1]]}        onSelect={onSelect} />
          <RoundColumn label="Round of 32"  games={data.r2.slice(2, 4)}  onSelect={onSelect} />
          <RoundColumn label="First Round"  games={data.r1.slice(4, 8)}  onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BracketTab({ results, onSelectTeam }: {
  results: SimResult[];
  onSelectTeam: (name: string) => void;
}) {
  const east    = computeRegion(EAST);
  const west    = computeRegion(WEST);
  const midwest = computeRegion(MIDWEST);
  const south   = computeRegion(SOUTH);

  // Final Four: East vs Midwest, West vs South
  const ff1 = predictWinner(east.champ, midwest.champ);
  const ff2 = predictWinner(west.champ, south.champ);
  const championship = predictWinner(ff1.winner, ff2.winner);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-950 border border-blue-900 px-4 py-2.5 text-xs text-blue-300">
        Full 64-team predicted bracket — model's most likely outcome at each matchup. Tap any team to see their full profile.
      </div>

      <RegionBracket name="East"    data={east}    onSelect={onSelectTeam} />
      <RegionBracket name="West"    data={west}    onSelect={onSelectTeam} />
      <RegionBracket name="Midwest" data={midwest} onSelect={onSelectTeam} />
      <RegionBracket name="South"   data={south}   onSelect={onSelectTeam} />

      {/* Final Four */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Final Four · San Antonio</h2>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 items-start min-w-max">
            <RoundColumn
              label="Semifinal 1"
              games={[[east.champ, midwest.champ]]}
              onSelect={onSelectTeam}
            />
            <RoundColumn
              label="Semifinal 2"
              games={[[west.champ, south.champ]]}
              onSelect={onSelectTeam}
            />
            <RoundColumn
              label="Championship"
              games={[[ff1.winner, ff2.winner]]}
              onSelect={onSelectTeam}
            />
            <ChampionSlot name={championship.winner} onSelect={onSelectTeam} />
          </div>
        </div>
      </div>

      {/* Champion's path */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Model's Predicted Path — {championship.winner}
        </h2>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {(() => {
            const champ = championship.winner;
            const region = [east, west, midwest, south].find((r) => r.champ === champ)!;
            const regionName = east.champ === champ ? "East" : west.champ === champ ? "West" : midwest.champ === champ ? "Midwest" : "South";

            const steps: Array<{ round: string; opp: string; prob: number }> = [];

            // R1
            const r1game = region.r1.find(([a, b]) => a === champ || b === champ)!;
            const r1opp = r1game[0] === champ ? r1game[1] : r1game[0];
            steps.push({ round: "R64", opp: r1opp, prob: matchupProb(champ, r1opp) });

            // R32
            const r2game = region.r2.find(([a, b]) => a === champ || b === champ);
            if (r2game) {
              const opp = r2game[0] === champ ? r2game[1] : r2game[0];
              steps.push({ round: "R32", opp, prob: Math.max(matchupProb(champ, opp), 1 - matchupProb(champ, opp)) });
            }

            // S16
            const s16game = region.s16.find(([a, b]) => a === champ || b === champ);
            if (s16game) {
              const opp = s16game[0] === champ ? s16game[1] : s16game[0];
              steps.push({ round: "S16", opp, prob: Math.max(matchupProb(champ, opp), 1 - matchupProb(champ, opp)) });
            }

            // Elite 8
            const e8opp = region.e8[0] === champ ? region.e8[1] : region.e8[0];
            steps.push({ round: "E8", opp: e8opp, prob: Math.max(matchupProb(champ, e8opp), 1 - matchupProb(champ, e8opp)) });

            // FF
            const ff1opp = east.champ === champ ? midwest.champ : midwest.champ === champ ? east.champ : west.champ === champ ? south.champ : west.champ;
            steps.push({ round: "FF", opp: ff1opp, prob: Math.max(matchupProb(champ, ff1opp), 1 - matchupProb(champ, ff1opp)) });

            // Champ game
            const champOpp = ff1.winner === champ ? ff2.winner : ff1.winner;
            steps.push({ round: "Final", opp: champOpp, prob: Math.max(matchupProb(champ, champOpp), 1 - matchupProb(champ, champOpp)) });

            return steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-700">→</span>}
                <div className="bg-gray-800 rounded-lg px-3 py-2 text-center">
                  <div className="text-xs text-gray-500">{step.round}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[72px]">def. {abbr(step.opp)}</div>
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
