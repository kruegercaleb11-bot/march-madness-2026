/**
 * March Madness 2026 — TypeScript Monte Carlo Engine
 * Direct port of simulate.py — same Champion Profile model, same math.
 */

import type { TeamInput } from "./teams-data";
import type { SimResult, SimulationOutput } from "./types";

const SIMULATIONS = 100_000;
const POOL_PRIZE  = 320;

// ── Historical seed win rates ──────────────────────────────────────────────────

const SEED_WIN_RATES: Record<string, number> = {
  "1-16": 0.9875,
  "2-15": 0.9313,
  "3-14": 0.8563,
  "4-13": 0.7938,
  "5-12": 0.6438,
  "6-11": 0.6125,
  "7-10": 0.6063,
  "8-9":  0.4875,
};

// ── Champion Profile ───────────────────────────────────────────────────────────

interface ProfileResult {
  magic_circle:     boolean;
  defense_fail:     boolean;
  repeat_tax:       boolean;
  big_ten_penalty:  boolean;
  injury_penalty:   boolean;
  sos_discount:     boolean;
  trend_mod:        number;
  multiplier:       number;
}

function applyChampionProfile(t: TeamInput): ProfileResult {
  let multiplier = 1.0;

  const magic_circle = t.adjO <= 25 && t.adjD <= 40 && t.adjEM >= 25.0;
  if (magic_circle) multiplier *= 1.15;

  const defense_fail = t.adjD > 40;
  if (defense_fail) multiplier *= 0.80;

  const repeat_tax = t.status === "Defending_Champ";
  if (repeat_tax) multiplier *= 0.85;

  const big_ten_penalty = t.name === "Michigan" || t.name === "Illinois";
  if (big_ten_penalty) multiplier *= 0.94;

  const injury_penalty = t.status === "INJURY_FLAG";
  if (injury_penalty) multiplier *= 0.78;

  let trend_mod = 0;
  if (t.trend === "up")   { multiplier *= 1.04; trend_mod = 0.04;  }
  if (t.trend === "down") { multiplier *= 0.96; trend_mod = -0.04; }

  const sos_discount = t.sos > 30;
  if (sos_discount) multiplier *= 0.94;

  return { magic_circle, defense_fail, repeat_tax, big_ten_penalty, injury_penalty, sos_discount, trend_mod, multiplier };
}

// ── Experience layer ──────────────────────────────────────────────────────────
//
// Research-backed adjustments layered on top of blendedWinProb.
// Applied per-matchup so the round-based decay can be simulated accurately:
//   Rounds 0–1 (R64, R32)  : full strength — young teams upset more here
//   Rounds 2–3 (S16, E8)   : 50%           — survivors are dangerous regardless
//   Rounds 4–5 (FF, Champ) : 10%           — talent & efficiency dominate late
//
// ⚙  ALL NUMERIC VALUES BELOW ARE TUNABLE — search "TUNE:" to locate them.

interface ExpScore {
  guard_adj:   number;  // guard experience component (win-prob pp, full strength)
  ret_min_adj: number;  // returning minutes component
  oad_adj:     number;  // one-and-done component
  total:       number;  // sum
}

/** Per-team experience score at full (R64) strength, vs a neutral opponent. */
function teamExpScore(t: TeamInput): ExpScore {
  // ── Guard experience ──────────────────────────────────────────────────────
  let guard_adj = 0;
  const exp = t.primary_guard_exp;
  if (exp) {
    // All-American flag overrides freshman/sophomore penalty:
    // elite underclassmen can run a team without the typical disadvantage.
    const isAAUnderclass =
      (t.is_guard_all_american ?? false) &&
      (exp === "freshman" || exp === "sophomore");

    if (!isAAUnderclass) {
      switch (exp) {
        case "senior":    guard_adj = +0.04; break; // TUNE: senior boost (+4 pp)
        case "junior":    guard_adj = +0.02; break; // TUNE: junior boost (+2 pp)
        case "sophomore": guard_adj = -0.04; break; // TUNE: soph penalty (-4 pp)
                                                     //   (no champion w/ soph PG, last 10 yrs)
        case "freshman":  guard_adj = -0.02; break; // TUNE: frosh penalty (-2 pp)
      }
    }
    // All-American underclassmen get 0 adjustment (penalty wiped, no extra boost)
  }

  // ── Returning minutes ─────────────────────────────────────────────────────
  let ret_min_adj = 0;
  if (t.returning_min_pct !== undefined) {
    const pct = t.returning_min_pct;
    if (pct < 0.30) {
      ret_min_adj = -0.04; // TUNE: sub-30% penalty (-4 pp)
                            // No team has ever earned a 1-seed & won title below this threshold
    } else if (pct >= 0.50) {
      ret_min_adj = +0.015; // TUNE: 50%+ bonus (+1.5 pp)
    }
    // 30–50%: neutral (0) — no adjustment
  }

  // ── One-and-done roster ───────────────────────────────────────────────────
  // Correlation between OAD count and tournament wins is weak (r≈0.21 for Duke,
  // r≈0.51 for Kentucky historically), so the per-player penalty is small.
  const oadCount = t.one_and_done_count ?? 0;
  const oad_adj = -Math.min(0.05, oadCount * 0.015);
  //               TUNE: floor -0.05 (cap), per-OAD penalty -0.015 (-1.5 pp each)

  const total = guard_adj + ret_min_adj + oad_adj;
  return { guard_adj, ret_min_adj, oad_adj, total };
}

/**
 * Round scale: how much experience modifiers matter at each tournament stage.
 * round 0=R64, 1=R32, 2=S16, 3=E8, 4=FF, 5=Championship
 */
function expRoundScale(round: number): number {
  if (round <= 1) return 1.0; // TUNE: R64/R32 — full weight
  if (round <= 3) return 0.5; // TUNE: S16/E8  — young survivors are dangerous
  return 0.1;                 // TUNE: FF/Champ — pure talent & efficiency
}

// ── Win probability ────────────────────────────────────────────────────────────

function seedHistoryRate(seedA: number, seedB: number): number {
  const lo = Math.min(seedA, seedB);
  const hi = Math.max(seedA, seedB);
  const base = SEED_WIN_RATES[`${lo}-${hi}`] ?? 0.5;
  return seedA < seedB ? base : 1 - base;
}

function efficiencyWinProb(adjEmA: number, adjEmB: number): number {
  return Math.max(0.03, Math.min(0.97, 0.5 + (adjEmA - adjEmB) * 0.015));
}

/**
 * Blended win probability for team A over team B.
 * `round` defaults to 0 (R64 / full experience strength) — callers without
 * round context (H2H tab, Bracket view) get the early-round experience effect.
 */
export function blendedWinProb(a: TeamInput, b: TeamInput, round = 0): number {
  const eff  = efficiencyWinProb(a.adjEM, b.adjEM);
  const hist = seedHistoryRate(a.kenpomRank, b.kenpomRank);
  const base = eff * 0.60 + hist * 0.40;

  // Experience adjustment: net difference between teams, scaled by round stage
  const scale  = expRoundScale(round);
  const expAdj = (teamExpScore(a).total - teamExpScore(b).total) * scale;

  return Math.max(0.03, Math.min(0.97, base + expAdj));
}

// ── Single tournament simulation ───────────────────────────────────────────────

function simulateTournament(teams: TeamInput[]): string {
  // Shuffle in place (Fisher-Yates)
  const field = [...teams];
  for (let i = field.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [field[i], field[j]] = [field[j], field[i]];
  }

  // Track round number for experience scaling.
  // Round 0 = first elimination round (R64 for 64-team field).
  const totalRounds = Math.round(Math.log2(field.length));
  let current = field;
  let roundNum = 0;

  while (current.length > 1) {
    const next: TeamInput[] = [];
    for (let i = 0; i < current.length - 1; i += 2) {
      // Pass round number so experience modifiers decay appropriately
      const pA = blendedWinProb(current[i], current[i + 1], roundNum);
      next.push(Math.random() < pA ? current[i] : current[i + 1]);
    }
    if (current.length % 2 === 1) next.push(current[current.length - 1]); // bye
    current = next;
    roundNum = Math.min(roundNum + 1, totalRounds - 1);
  }
  return current[0].name;
}

// ── MC blend ──────────────────────────────────────────────────────────────────

function applyMcBlend(rawProb: number, mc1: number, mc2: number): number {
  if (mc1 + mc2 === 0) return rawProb;
  return rawProb * 0.75 + (mc1 / (mc1 + mc2)) * 0.25;
}

// ── Pool EV ───────────────────────────────────────────────────────────────────

function poolEv(pWin: number, espnPct: number): number {
  return (pWin * POOL_PRIZE) / (1 + 5 * (espnPct / 100));
}

// ── Main export ───────────────────────────────────────────────────────────────

export function runSimulation(teams: TeamInput[], n = SIMULATIONS): SimulationOutput {
  // Build champion profiles + experience scores
  const profiles  = new Map<string, ProfileResult>();
  const expScores = new Map<string, ExpScore>();
  for (const t of teams) {
    profiles.set(t.name, applyChampionProfile(t));
    expScores.set(t.name, teamExpScore(t));
  }

  // Monte Carlo
  const counts = new Map<string, number>(teams.map((t) => [t.name, 0]));
  for (let i = 0; i < n; i++) {
    const champ = simulateTournament(teams);
    counts.set(champ, (counts.get(champ) ?? 0) + 1);
  }

  // Raw probs
  const rawProbs = new Map<string, number>(
    teams.map((t) => [t.name, (counts.get(t.name) ?? 0) / n])
  );

  // Adjusted probs (× multiplier, normalised)
  const adjUnnorm = new Map<string, number>(
    teams.map((t) => [t.name, rawProbs.get(t.name)! * profiles.get(t.name)!.multiplier])
  );
  const totalAdj = [...adjUnnorm.values()].reduce((a, b) => a + b, 0);
  const adjProbs = new Map<string, number>(
    teams.map((t) => [t.name, adjUnnorm.get(t.name)! / totalAdj])
  );

  // MC-blend pass
  const mcShares = new Map<string, number>(
    teams.map((t) => [
      t.name,
      profiles.get(t.name)!.magic_circle
        ? adjProbs.get(t.name)!
        : adjProbs.get(t.name)! * 0.5,
    ])
  );
  const totalMc = [...mcShares.values()].reduce((a, b) => a + b, 0);

  const finalUnnorm = new Map<string, number>(
    teams.map((t) => {
      const mc1 = mcShares.get(t.name)!;
      const mc2 = totalMc - mc1;
      return [t.name, applyMcBlend(adjProbs.get(t.name)!, mc1, mc2)];
    })
  );
  const totalFinal = [...finalUnnorm.values()].reduce((a, b) => a + b, 0);
  const finalProbs = new Map<string, number>(
    teams.map((t) => [t.name, finalUnnorm.get(t.name)! / totalFinal])
  );

  // Build result records
  const results: SimResult[] = teams.map((t) => {
    const p   = profiles.get(t.name)!;
    const exp = expScores.get(t.name)!;
    const rawP  = rawProbs.get(t.name)!;
    const adjP  = adjProbs.get(t.name)!;
    const finP  = finalProbs.get(t.name)!;
    return {
      team:            t.name,
      kenpom_rank:     t.kenpomRank,
      adjEM:           t.adjEM,
      raw_sim_pct:     +( rawP * 100).toFixed(2),
      adj_sim_pct:     +( adjP * 100).toFixed(2),
      final_sim_pct:   +( finP * 100).toFixed(2),
      espn_pct:        t.espnPct,
      pool_ev:         +poolEv(finP, t.espnPct).toFixed(2),
      value_ratio:     t.espnPct > 0 ? +((finP / (t.espnPct / 100)).toFixed(3)) : 0,
      magic_circle:    p.magic_circle,
      repeat_tax:      p.repeat_tax,
      big_ten_penalty: p.big_ten_penalty,
      injury_penalty:  p.injury_penalty,
      sos_discount:    p.sos_discount,
      defense_fail:    p.defense_fail,
      trend_mod:       p.trend_mod,
      multiplier:      +p.multiplier.toFixed(4),
      // Experience layer — full-strength (R64) scores for UI display
      exp_guard_adj:   +( exp.guard_adj   * 100).toFixed(1),
      exp_ret_min_adj: +( exp.ret_min_adj * 100).toFixed(1),
      exp_oad_adj:     +( exp.oad_adj     * 100).toFixed(1),
      exp_total:       +( exp.total       * 100).toFixed(1),
    };
  });

  results.sort((a, b) => b.final_sim_pct - a.final_sim_pct);

  return { simulations: n, teams: results };
}
