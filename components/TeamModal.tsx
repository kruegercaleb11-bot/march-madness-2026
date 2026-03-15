"use client";

import { useEffect } from "react";
import type { SimResult } from "@/lib/types";
import type { TeamInput } from "@/lib/teams-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ci95(pct: number, n = 100_000): string {
  const p = pct / 100;
  const margin = 1.96 * Math.sqrt((p * (1 - p)) / n) * 100;
  return margin < 0.1 ? "<0.1" : margin.toFixed(1);
}

function scoutingReport(r: SimResult, t: TeamInput | undefined): string {
  const lines: string[] = [];

  if (r.magic_circle)
    lines.push("Checks every Champion Profile box — top-25 offense, top-40 defense, high efficiency. Historically, this is exactly what champions look like.");
  else if (r.defense_fail)
    lines.push("Defense rank outside the top 40 is the single biggest historical disqualifier. No team with a worse defense has won in the modern era.");
  else
    lines.push("Misses the Magic Circle — strong team, but history says elite defenses are required to cut down the nets.");

  if (r.repeat_tax)
    lines.push("Defending champions face enormous target pressure. Teams that repeat are rare — only 2 in the past 40 years.");

  if (r.big_ten_penalty)
    lines.push("Big Ten teams have historically underperformed in Final Fours relative to their regular-season metrics.");

  if (r.injury_penalty)
    lines.push("Injury flag is a serious red flag. Unknown health status creates major downside risk that the model can't fully quantify.");

  if (r.trend_mod > 0)
    lines.push("Team is trending up going into the tournament — peaking at exactly the right time.");
  else if (r.trend_mod < 0)
    lines.push("Team appears to be cooling down. Late-season regression is a warning sign.");

  if (r.sos_discount)
    lines.push("Schedule has been soft. Win totals may be inflated by weaker competition — a question mark against tournament-hardened opponents.");

  if (r.value_ratio > 3)
    lines.push(`Public is massively underestimating this team (${r.espn_pct}% picking vs our ${r.final_sim_pct.toFixed(1)}% model). Exceptional pool value.`);
  else if (r.value_ratio < 0.5)
    lines.push(`Public is overrating this team relative to our model. Picking them costs you pool equity.`);

  return lines.join(" ");
}

// ── Stat row ──────────────────────────────────────────────────────────────────

function StatRow({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold ${good === true ? "text-green-400" : good === false ? "text-red-400" : "text-white"}`}>
          {value}
        </span>
        {sub && <div className="text-xs text-gray-600">{sub}</div>}
      </div>
    </div>
  );
}

// ── Multiplier breakdown ──────────────────────────────────────────────────────

function MultiplierRow({ label, mult, active }: { label: string; mult: string; active: boolean }) {
  if (!active) return null;
  const isBoost = parseFloat(mult) > 1;
  return (
    <div className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-lg mb-1 ${
      isBoost ? "bg-green-950 border border-green-900" : "bg-red-950 border border-red-900"
    }`}>
      <span className={isBoost ? "text-green-400" : "text-red-400"}>{label}</span>
      <span className={`font-mono font-bold ${isBoost ? "text-green-300" : "text-red-300"}`}>
        ×{mult}
      </span>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface TeamModalProps {
  result: SimResult;
  teamData: TeamInput | undefined;
  onClose: () => void;
}

export default function TeamModal({ result: r, teamData: t, onClose }: TeamModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const ciStr = ci95(r.final_sim_pct);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-gray-950 border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-5 pt-4 pb-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-black text-white">{r.team}</h2>
            <p className="text-xs text-gray-500">KenPom #{r.kenpom_rank} · AdjEM {r.adjEM}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-lg"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Win probability hero */}
          <div className={`rounded-2xl p-5 text-center ${r.magic_circle
            ? "bg-gradient-to-br from-emerald-950 to-emerald-900 border border-emerald-700"
            : "bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"}`}
          >
            <div className="text-5xl font-black text-white mb-1">
              {r.final_sim_pct.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mb-2">
              championship win probability <span className="text-gray-600">±{ciStr}%</span>
            </div>
            {r.magic_circle && (
              <span className="inline-flex items-center gap-1 bg-emerald-900 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600">
                ✦ Magic Circle — Elite Champion Profile
              </span>
            )}
          </div>

          {/* Key stats */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Stats</h3>
            <div className="bg-gray-900 rounded-xl px-4">
              <StatRow label="Final Sim %" value={`${r.final_sim_pct.toFixed(2)}%`} sub={`±${ciStr}% CI (100K sims)`} />
              <StatRow label="Raw Sim %" value={`${r.raw_sim_pct.toFixed(2)}%`} sub="before profile adjustments" />
              <StatRow label="ESPN Public %" value={`${r.espn_pct.toFixed(1)}%`} />
              <StatRow label="Value Ratio" value={`${r.value_ratio.toFixed(2)}×`} good={r.value_ratio >= 1} sub="sim% ÷ ESPN%" />
              <StatRow label="Pool EV (6-person)" value={`$${r.pool_ev.toFixed(2)}`} />
              {t && <>
                <StatRow label="AdjO Rank" value={`#${t.adjO}`} good={t.adjO <= 25} sub="offense efficiency" />
                <StatRow label="AdjD Rank" value={`#${t.adjD}`} good={t.adjD <= 40} sub="defense efficiency" />
                <StatRow label="SOS Rank" value={`#${t.sos}`} good={t.sos <= 30} sub="schedule strength" />
                <StatRow label="Trend" value={t.trend === "up" ? "↑ Hot" : t.trend === "down" ? "↓ Cooling" : "→ Steady"} good={t.trend === "up"} />
                <StatRow label="Status" value={t.status.replace(/_/g, " ")} />
              </>}
            </div>
          </section>

          {/* Champion Profile multiplier breakdown */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Champion Profile · {r.multiplier.toFixed(4)}× total modifier
            </h3>
            <div>
              <MultiplierRow label="✦ Magic Circle (+15%)" mult="1.15" active={r.magic_circle} />
              <MultiplierRow label="⚠ Defense Ceiling fail (−20%)" mult="0.80" active={r.defense_fail} />
              <MultiplierRow label="↩ Repeat Champion Tax (−15%)" mult="0.85" active={r.repeat_tax} />
              <MultiplierRow label="🔵 Big Ten Penalty (−6%)" mult="0.94" active={r.big_ten_penalty} />
              <MultiplierRow label="🚑 Injury Flag (−22%)" mult="0.78" active={r.injury_penalty} />
              <MultiplierRow label="↑ Trending Up (+4%)" mult="1.04" active={r.trend_mod > 0} />
              <MultiplierRow label="↓ Trending Down (−4%)" mult="0.96" active={r.trend_mod < 0} />
              <MultiplierRow label="📅 Weak SOS Discount (−6%)" mult="0.94" active={r.sos_discount} />
              {r.multiplier === 1.0 && !r.magic_circle && (
                <div className="text-xs text-gray-600 text-center py-2">No modifiers — raw simulation probability</div>
              )}
            </div>
          </section>

          {/* Experience layer — only shown when data is available */}
          {t?.primary_guard_exp && r.exp_total != null && (
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Experience Layer · {r.exp_total > 0 ? "+" : ""}{r.exp_total}pp early-round adj
              </h3>
              <div className="bg-gray-900 rounded-xl px-4 py-1">
                <StatRow
                  label="Guard Experience"
                  value={t.primary_guard_exp.charAt(0).toUpperCase() + t.primary_guard_exp.slice(1)
                    + (t.is_guard_all_american ? " (All-American)" : "")}
                  sub={r.exp_guard_adj !== 0 ? `${r.exp_guard_adj > 0 ? "+" : ""}${r.exp_guard_adj}pp adj` : "No adjustment (AA override)"}
                  good={r.exp_guard_adj >= 0}
                />
                {t.returning_min_pct !== undefined && (
                  <StatRow
                    label="Returning Minutes"
                    value={`${Math.round(t.returning_min_pct * 100)}%`}
                    sub={r.exp_ret_min_adj !== 0 ? `${r.exp_ret_min_adj > 0 ? "+" : ""}${r.exp_ret_min_adj}pp adj` : "Neutral (30–50% band)"}
                    good={r.exp_ret_min_adj >= 0}
                  />
                )}
                {t.one_and_done_count !== undefined && (
                  <StatRow
                    label="One-and-Done Count"
                    value={`${t.one_and_done_count} projected`}
                    sub={r.exp_oad_adj !== 0 ? `${r.exp_oad_adj}pp adj (weak r≈0.21–0.51)` : "No adjustment"}
                    good={r.exp_oad_adj >= 0}
                  />
                )}
              </div>
              <p className="text-xs text-gray-700 mt-1.5 px-1">
                Full strength in R64/R32 · 50% in S16/E8 · 10% in FF/Champ
              </p>
            </section>
          )}

          {/* Scouting report */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scouting Report</h3>
            <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
              {scoutingReport(r, t)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
