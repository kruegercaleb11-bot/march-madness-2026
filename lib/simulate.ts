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

export function blendedWinProb(a: TeamInput, b: TeamInput): number {
  const eff  = efficiencyWinProb(a.adjEM, b.adjEM);
  const hist = seedHistoryRate(a.kenpomRank, b.kenpomRank);
  return eff * 0.60 + hist * 0.40;
}

// ── Single tournament simulation ───────────────────────────────────────────────

function simulateTournament(teams: TeamInput[]): string {
  // Shuffle in place (Fisher-Yates)
  const field = [...teams];
  for (let i = field.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [field[i], field[j]] = [field[j], field[i]];
  }

  let current = field;
  while (current.length > 1) {
    const next: TeamInput[] = [];
    for (let i = 0; i < current.length - 1; i += 2) {
      const pA = blendedWinProb(current[i], current[i + 1]);
      next.push(Math.random() < pA ? current[i] : current[i + 1]);
    }
    if (current.length % 2 === 1) next.push(current[current.length - 1]); // bye
    current = next;
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
  // Build profiles
  const profiles = new Map<string, ProfileResult>();
  for (const t of teams) profiles.set(t.name, applyChampionProfile(t));

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
    const p = profiles.get(t.name)!;
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
    };
  });

  results.sort((a, b) => b.final_sim_pct - a.final_sim_pct);

  return { simulations: n, teams: results };
}
