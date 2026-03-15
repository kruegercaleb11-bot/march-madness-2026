// Static team data — edit these values to update the model
// ⚠️  Update espnPct values with real ESPN bracket challenge pick percentages.
// kenpomRank = actual tournament SEED (1–16) for historical win-rate lookups.

export interface TeamInput {
  name: string;
  kenpomRank: number;   // ← Actual tournament SEED (1–16)
  adjO: number;         // KenPom offense rank (lower = better)
  adjD: number;         // KenPom defense rank (lower = better)
  adjEM: number;        // Adjusted efficiency margin
  net: number;          // NET rank
  sos: number;          // Strength of schedule rank (lower = tougher)
  trend: "up" | "down" | "steady";
  status: string;       // "Defending_Champ" | "INJURY_FLAG" | "Elite_Profile" | etc.
  espnPct: number;      // ← Update with real ESPN pick % after bracket drops

  // ── Experience layer ───────────────────────────────────────────────────────
  primary_guard_exp?:   "freshman" | "sophomore" | "junior" | "senior";
  returning_min_pct?:   number;   // 0.0–1.0  (fraction of possession minutes returning)
  one_and_done_count?:  number;   // projected # of one-and-dones on roster
  is_guard_all_american?: boolean; // true = overrides freshman/soph penalty
}

export const TEAMS: TeamInput[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // EAST REGION
  // ══════════════════════════════════════════════════════════════════════════

  { name: "Duke",           kenpomRank: 1,  adjO: 5,   adjD: 1,   adjEM: 39.35, net: 1,   sos: 2,   trend: "steady", status: "Elite_Profile",      espnPct: 25.0, primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 2, is_guard_all_american: false },
  { name: "UConn",          kenpomRank: 2,  adjO: 22,  adjD: 13,  adjEM: 28.90, net: 9,   sos: 20,  trend: "steady", status: "Historical_Match",   espnPct: 4.8,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Michigan State", kenpomRank: 3,  adjO: 27,  adjD: 8,   adjEM: 28.40, net: 12,  sos: 12,  trend: "up",     status: "Borderline_Offense", espnPct: 3.4,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Kansas",         kenpomRank: 4,  adjO: 20,  adjD: 20,  adjEM: 26.5,  net: 15,  sos: 10,  trend: "steady", status: "Balanced_Profile",   espnPct: 1.5,  primary_guard_exp: "senior",    returning_min_pct: 0.50, one_and_done_count: 0, is_guard_all_american: false },
  { name: "St. John's",     kenpomRank: 5,  adjO: 13,  adjD: 16,  adjEM: 25.8,  net: 11,  sos: 14,  trend: "up",     status: "Balanced_Profile",   espnPct: 2.2,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Louisville",     kenpomRank: 6,  adjO: 14,  adjD: 30,  adjEM: 25.60, net: 14,  sos: 17,  trend: "down",   status: "INJURY_FLAG",        espnPct: 0.4,  primary_guard_exp: "sophomore", returning_min_pct: 0.35, one_and_done_count: 1, is_guard_all_american: false },
  { name: "UCLA",           kenpomRank: 7,  adjO: 34,  adjD: 26,  adjEM: 21.2,  net: 22,  sos: 22,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.3,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Ohio State",     kenpomRank: 8,  adjO: 32,  adjD: 32,  adjEM: 19.5,  net: 28,  sos: 24,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.2,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "TCU",            kenpomRank: 9,  adjO: 38,  adjD: 36,  adjEM: 17.8,  net: 34,  sos: 32,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.40, one_and_done_count: 0, is_guard_all_american: false },
  { name: "UCF",            kenpomRank: 10, adjO: 43,  adjD: 41,  adjEM: 16.2,  net: 40,  sos: 38,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.40, one_and_done_count: 0, is_guard_all_american: false },
  { name: "South Florida",  kenpomRank: 11, adjO: 50,  adjD: 44,  adjEM: 14.8,  net: 48,  sos: 65,  trend: "up",     status: "Upset_Risk",         espnPct: 0.1,  primary_guard_exp: "sophomore", returning_min_pct: 0.35, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Northern Iowa",  kenpomRank: 12, adjO: 58,  adjD: 48,  adjEM: 13.2,  net: 56,  sos: 85,  trend: "steady", status: "Upset_Risk",         espnPct: 0.1,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Cal Baptist",    kenpomRank: 13, adjO: 68,  adjD: 55,  adjEM: 10.5,  net: 70,  sos: 175, trend: "up",     status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "N. Dakota St",   kenpomRank: 14, adjO: 78,  adjD: 62,  adjEM: 8.8,   net: 82,  sos: 215, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Furman",         kenpomRank: 15, adjO: 92,  adjD: 72,  adjEM: 6.5,   net: 100, sos: 245, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Siena",          kenpomRank: 16, adjO: 112, adjD: 88,  adjEM: 3.5,   net: 130, sos: 300, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },

  // ══════════════════════════════════════════════════════════════════════════
  // WEST REGION
  // ══════════════════════════════════════════════════════════════════════════

  { name: "Arizona",        kenpomRank: 1,  adjO: 7,   adjD: 2,   adjEM: 36.45, net: 3,   sos: 4,   trend: "steady", status: "Elite_Profile",      espnPct: 11.2, primary_guard_exp: "junior",    returning_min_pct: 0.50, one_and_done_count: 2, is_guard_all_american: true  },
  { name: "Purdue",         kenpomRank: 2,  adjO: 10,  adjD: 12,  adjEM: 30.5,  net: 8,   sos: 9,   trend: "steady", status: "Balanced_Profile",   espnPct: 0.4,  primary_guard_exp: "senior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Gonzaga",        kenpomRank: 3,  adjO: 30,  adjD: 9,   adjEM: 27.15, net: 6,   sos: 45,  trend: "steady", status: "Shed_Defense",       espnPct: 1.4,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Arkansas",       kenpomRank: 4,  adjO: 22,  adjD: 22,  adjEM: 25.8,  net: 18,  sos: 16,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.8,  primary_guard_exp: "freshman",  returning_min_pct: 0.20, one_and_done_count: 2, is_guard_all_american: true  },
  { name: "Wisconsin",      kenpomRank: 5,  adjO: 30,  adjD: 18,  adjEM: 23.2,  net: 20,  sos: 20,  trend: "steady", status: "Defense_Heavy",      espnPct: 0.3,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "BYU",            kenpomRank: 6,  adjO: 11,  adjD: 19,  adjEM: 23.10, net: 23,  sos: 19,  trend: "up",     status: "Darkhorse",          espnPct: 0.9,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Miami FL",       kenpomRank: 7,  adjO: 35,  adjD: 30,  adjEM: 20.8,  net: 30,  sos: 28,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.2,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Villanova",      kenpomRank: 8,  adjO: 40,  adjD: 34,  adjEM: 18.5,  net: 36,  sos: 30,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.2,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Utah State",     kenpomRank: 9,  adjO: 45,  adjD: 38,  adjEM: 16.8,  net: 42,  sos: 58,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Missouri",       kenpomRank: 10, adjO: 48,  adjD: 42,  adjEM: 15.2,  net: 50,  sos: 42,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.40, one_and_done_count: 0, is_guard_all_american: false },
  { name: "NC State",       kenpomRank: 11, adjO: 54,  adjD: 46,  adjEM: 13.8,  net: 58,  sos: 48,  trend: "up",     status: "Upset_Risk",         espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.40, one_and_done_count: 0, is_guard_all_american: false },
  { name: "High Point",     kenpomRank: 12, adjO: 62,  adjD: 52,  adjEM: 12.0,  net: 65,  sos: 130, trend: "steady", status: "Upset_Risk",         espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Hawaii",         kenpomRank: 13, adjO: 72,  adjD: 58,  adjEM: 9.8,   net: 80,  sos: 200, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Kennesaw State", kenpomRank: 14, adjO: 82,  adjD: 65,  adjEM: 8.2,   net: 90,  sos: 220, trend: "up",     status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Queens",         kenpomRank: 15, adjO: 95,  adjD: 75,  adjEM: 6.0,   net: 110, sos: 255, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "LIU",            kenpomRank: 16, adjO: 118, adjD: 92,  adjEM: 3.2,   net: 135, sos: 305, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },

  // ══════════════════════════════════════════════════════════════════════════
  // MIDWEST REGION
  // ══════════════════════════════════════════════════════════════════════════

  { name: "Michigan",       kenpomRank: 1,  adjO: 4,   adjD: 3,   adjEM: 37.12, net: 2,   sos: 1,   trend: "up",     status: "Elite_Profile",      espnPct: 16.8, primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Iowa State",     kenpomRank: 2,  adjO: 26,  adjD: 7,   adjEM: 30.50, net: 8,   sos: 16,  trend: "down",   status: "Borderline_Offense", espnPct: 2.1,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Virginia",       kenpomRank: 3,  adjO: 18,  adjD: 10,  adjEM: 27.2,  net: 14,  sos: 15,  trend: "steady", status: "Defense_Heavy",      espnPct: 0.8,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Alabama",        kenpomRank: 4,  adjO: 8,   adjD: 45,  adjEM: 26.0,  net: 16,  sos: 12,  trend: "up",     status: "Offense_Heavy",      espnPct: 1.0,  primary_guard_exp: "sophomore", returning_min_pct: 0.30, one_and_done_count: 2, is_guard_all_american: false },
  { name: "Texas Tech",     kenpomRank: 5,  adjO: 26,  adjD: 16,  adjEM: 23.8,  net: 19,  sos: 17,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.5,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Tennessee",      kenpomRank: 6,  adjO: 15,  adjD: 14,  adjEM: 29.5,  net: 10,  sos: 11,  trend: "steady", status: "Elite_Profile",      espnPct: 1.8,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Kentucky",       kenpomRank: 7,  adjO: 33,  adjD: 26,  adjEM: 21.0,  net: 26,  sos: 26,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.5,  primary_guard_exp: "sophomore", returning_min_pct: 0.40, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Georgia",        kenpomRank: 8,  adjO: 36,  adjD: 33,  adjEM: 18.8,  net: 32,  sos: 28,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.2,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "St. Louis",      kenpomRank: 9,  adjO: 42,  adjD: 38,  adjEM: 17.2,  net: 38,  sos: 50,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "senior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Santa Clara",    kenpomRank: 10, adjO: 46,  adjD: 43,  adjEM: 15.5,  net: 52,  sos: 80,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "SMU",            kenpomRank: 11, adjO: 52,  adjD: 47,  adjEM: 14.0,  net: 60,  sos: 55,  trend: "up",     status: "Upset_Risk",         espnPct: 0.1,  primary_guard_exp: "junior",    returning_min_pct: 0.45, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Akron",          kenpomRank: 12, adjO: 60,  adjD: 53,  adjEM: 12.5,  net: 68,  sos: 115, trend: "steady", status: "Upset_Risk",         espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Hofstra",        kenpomRank: 13, adjO: 70,  adjD: 60,  adjEM: 10.0,  net: 78,  sos: 190, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Wright State",   kenpomRank: 14, adjO: 80,  adjD: 66,  adjEM: 8.5,   net: 88,  sos: 225, trend: "up",     status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Tennessee State",kenpomRank: 15, adjO: 94,  adjD: 76,  adjEM: 6.2,   net: 105, sos: 250, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "UMBC",           kenpomRank: 16, adjO: 116, adjD: 90,  adjEM: 3.8,   net: 128, sos: 295, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },

  // ══════════════════════════════════════════════════════════════════════════
  // SOUTH REGION
  // ══════════════════════════════════════════════════════════════════════════

  { name: "Florida",        kenpomRank: 1,  adjO: 8,   adjD: 5,   adjEM: 34.20, net: 4,   sos: 3,   trend: "up",     status: "Defending_Champ",    espnPct: 21.0, primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Houston",        kenpomRank: 2,  adjO: 17,  adjD: 6,   adjEM: 32.88, net: 7,   sos: 14,  trend: "steady", status: "Defense_Heavy",      espnPct: 6.4,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Illinois",       kenpomRank: 3,  adjO: 1,   adjD: 27,  adjEM: 33.10, net: 5,   sos: 6,   trend: "up",     status: "Offense_Heavy",      espnPct: 3.2,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Nebraska",       kenpomRank: 4,  adjO: 54,  adjD: 5,   adjEM: 24.30, net: 13,  sos: 22,  trend: "steady", status: "Upset_Risk",         espnPct: 1.8,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Vanderbilt",     kenpomRank: 5,  adjO: 24,  adjD: 24,  adjEM: 22.8,  net: 21,  sos: 18,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.5,  primary_guard_exp: "junior",    returning_min_pct: 0.40, one_and_done_count: 0, is_guard_all_american: false },
  { name: "North Carolina", kenpomRank: 6,  adjO: 12,  adjD: 42,  adjEM: 22.0,  net: 24,  sos: 20,  trend: "steady", status: "Offense_Heavy",      espnPct: 0.6,  primary_guard_exp: "junior",    returning_min_pct: 0.50, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Saint Mary's",   kenpomRank: 7,  adjO: 37,  adjD: 29,  adjEM: 20.2,  net: 32,  sos: 70,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.3,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Clemson",        kenpomRank: 8,  adjO: 41,  adjD: 35,  adjEM: 18.2,  net: 38,  sos: 30,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.2,  primary_guard_exp: "senior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Iowa",           kenpomRank: 9,  adjO: 3,   adjD: 48,  adjEM: 19.5,  net: 35,  sos: 22,  trend: "steady", status: "Offense_Heavy",      espnPct: 0.2,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Texas A&M",      kenpomRank: 10, adjO: 44,  adjD: 44,  adjEM: 15.8,  net: 48,  sos: 34,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1,  primary_guard_exp: "senior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "VCU",            kenpomRank: 11, adjO: 55,  adjD: 46,  adjEM: 14.5,  net: 62,  sos: 62,  trend: "up",     status: "Upset_Risk",         espnPct: 0.1,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "McNeese",        kenpomRank: 12, adjO: 62,  adjD: 54,  adjEM: 12.2,  net: 70,  sos: 145, trend: "steady", status: "Upset_Risk",         espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Troy",           kenpomRank: 13, adjO: 72,  adjD: 61,  adjEM: 9.5,   net: 82,  sos: 195, trend: "up",     status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Penn",           kenpomRank: 14, adjO: 82,  adjD: 67,  adjEM: 8.0,   net: 92,  sos: 235, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.75, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Idaho",          kenpomRank: 15, adjO: 96,  adjD: 77,  adjEM: 5.8,   net: 112, sos: 260, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Prairie View",   kenpomRank: 16, adjO: 120, adjD: 93,  adjEM: 3.0,   net: 138, sos: 310, trend: "steady", status: "Low_Seed",           espnPct: 0.0,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
];
