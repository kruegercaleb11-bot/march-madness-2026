// Static team data — edit these values to update the model
// ⚠️  SELECTION SUNDAY: update kenpomRank (= tournament SEED, 1–16) and
//     espnPct for all teams after bracket announcement, then redeploy.

export interface TeamInput {
  name: string;
  kenpomRank: number;   // ← Set to actual tournament SEED (1–16) after bracket drops
  adjO: number;         // KenPom offense rank (lower = better)
  adjD: number;         // KenPom defense rank (lower = better)
  adjEM: number;        // Adjusted efficiency margin
  net: number;          // NET rank
  sos: number;          // Strength of schedule rank (lower = tougher)
  trend: "up" | "down" | "steady";
  status: string;       // "Defending_Champ" | "INJURY_FLAG" | "Elite_Profile" | etc.
  espnPct: number;      // ← Update with real ESPN pick % after bracket drops

  // ── Experience layer (optional — omit for neutral / unknown) ──────────────
  // Update these after the bracket drops. Teams without these fields get 0 adj.
  primary_guard_exp?:   "freshman" | "sophomore" | "junior" | "senior";
  returning_min_pct?:   number;   // 0.0–1.0  (fraction of possession minutes returning)
  one_and_done_count?:  number;   // projected # of one-and-dones on roster
  is_guard_all_american?: boolean; // true = overrides freshman/soph penalty
}

export const TEAMS: TeamInput[] = [

  // ── PRE-SCOUTED CONTENDERS (update seeds + ESPN pcts tonight) ────────────────
  // Experience fields are estimates — verify and update after bracket drops.
  // primary_guard_exp: "freshman"|"sophomore"|"junior"|"senior"
  // returning_min_pct: fraction of last year's possession minutes returning (0–1)
  // one_and_done_count: projected # of players leaving after one year
  // is_guard_all_american: true overrides freshman/sophomore penalty

  { name: "Duke",           kenpomRank: 1,  adjO: 5,   adjD: 1,   adjEM: 39.35, net: 1,   sos: 2,   trend: "steady", status: "Elite_Profile",      espnPct: 25.0, primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 2, is_guard_all_american: false },
  { name: "Michigan",       kenpomRank: 2,  adjO: 4,   adjD: 3,   adjEM: 37.12, net: 2,   sos: 1,   trend: "up",     status: "Elite_Profile",      espnPct: 16.8, primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Arizona",        kenpomRank: 3,  adjO: 7,   adjD: 2,   adjEM: 36.45, net: 3,   sos: 4,   trend: "steady", status: "Elite_Profile",      espnPct: 11.2, primary_guard_exp: "junior",    returning_min_pct: 0.50, one_and_done_count: 2, is_guard_all_american: true  },
  { name: "Florida",        kenpomRank: 4,  adjO: 8,   adjD: 5,   adjEM: 34.20, net: 4,   sos: 3,   trend: "up",     status: "Defending_Champ",    espnPct: 21.0, primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Illinois",       kenpomRank: 5,  adjO: 1,   adjD: 27,  adjEM: 33.10, net: 5,   sos: 6,   trend: "up",     status: "Offense_Heavy",      espnPct: 3.2,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Houston",        kenpomRank: 6,  adjO: 17,  adjD: 6,   adjEM: 32.88, net: 7,   sos: 14,  trend: "steady", status: "Defense_Heavy",      espnPct: 6.4,  primary_guard_exp: "senior",    returning_min_pct: 0.70, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Iowa State",     kenpomRank: 7,  adjO: 26,  adjD: 7,   adjEM: 30.50, net: 8,   sos: 16,  trend: "down",   status: "Borderline_Offense", espnPct: 2.1,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },
  { name: "UConn",          kenpomRank: 10, adjO: 22,  adjD: 13,  adjEM: 28.90, net: 9,   sos: 20,  trend: "steady", status: "Historical_Match",   espnPct: 4.8,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Michigan State", kenpomRank: 9,  adjO: 27,  adjD: 8,   adjEM: 28.40, net: 12,  sos: 12,  trend: "up",     status: "Borderline_Offense", espnPct: 3.4,  primary_guard_exp: "senior",    returning_min_pct: 0.65, one_and_done_count: 0, is_guard_all_american: false },
  { name: "Gonzaga",        kenpomRank: 11, adjO: 30,  adjD: 9,   adjEM: 27.15, net: 6,   sos: 45,  trend: "steady", status: "Shed_Defense",       espnPct: 1.4,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Louisville",     kenpomRank: 11, adjO: 14,  adjD: 30,  adjEM: 25.60, net: 14,  sos: 17,  trend: "down",   status: "INJURY_FLAG",        espnPct: 0.4,  primary_guard_exp: "sophomore", returning_min_pct: 0.35, one_and_done_count: 1, is_guard_all_american: false },
  { name: "Nebraska",       kenpomRank: 12, adjO: 54,  adjD: 5,   adjEM: 24.30, net: 13,  sos: 22,  trend: "steady", status: "Upset_Risk",         espnPct: 1.8,  primary_guard_exp: "senior",    returning_min_pct: 0.60, one_and_done_count: 0, is_guard_all_american: false },
  { name: "BYU",            kenpomRank: 13, adjO: 11,  adjD: 19,  adjEM: 23.10, net: 23,  sos: 19,  trend: "up",     status: "Darkhorse",          espnPct: 0.9,  primary_guard_exp: "junior",    returning_min_pct: 0.55, one_and_done_count: 0, is_guard_all_american: false },

  // ── FULL 64-TEAM FIELD (placeholder stats — verify after Selection Sunday) ───

  // ── SEED 1 ───────────────────────────────────────────────────────────────────
  { name: "Auburn",         kenpomRank: 1,  adjO: 3,   adjD: 4,   adjEM: 38.20, net: 3,   sos: 3,   trend: "up",     status: "Elite_Profile",      espnPct: 6.2  },
  { name: "Alabama",        kenpomRank: 1,  adjO: 6,   adjD: 6,   adjEM: 36.90, net: 4,   sos: 5,   trend: "steady", status: "Elite_Profile",      espnPct: 5.8  },
  { name: "Kansas",         kenpomRank: 1,  adjO: 9,   adjD: 7,   adjEM: 35.60, net: 5,   sos: 7,   trend: "steady", status: "Elite_Profile",      espnPct: 4.2  },

  // ── SEED 2 ───────────────────────────────────────────────────────────────────
  { name: "Tennessee",      kenpomRank: 2,  adjO: 12,  adjD: 8,   adjEM: 34.10, net: 6,   sos: 8,   trend: "up",     status: "Elite_Profile",      espnPct: 3.8  },
  { name: "Purdue",         kenpomRank: 2,  adjO: 10,  adjD: 11,  adjEM: 33.40, net: 7,   sos: 9,   trend: "steady", status: "Offense_Heavy",      espnPct: 3.1  },
  { name: "St. John's",     kenpomRank: 2,  adjO: 13,  adjD: 10,  adjEM: 32.80, net: 8,   sos: 11,  trend: "up",     status: "Elite_Profile",      espnPct: 2.4  },

  // ── SEED 3 ───────────────────────────────────────────────────────────────────
  { name: "Marquette",      kenpomRank: 3,  adjO: 15,  adjD: 12,  adjEM: 31.50, net: 9,   sos: 10,  trend: "steady", status: "Balanced_Profile",   espnPct: 1.9  },
  { name: "Baylor",         kenpomRank: 3,  adjO: 18,  adjD: 14,  adjEM: 30.20, net: 10,  sos: 13,  trend: "down",   status: "Balanced_Profile",   espnPct: 1.4  },
  { name: "Creighton",      kenpomRank: 3,  adjO: 16,  adjD: 16,  adjEM: 29.80, net: 11,  sos: 15,  trend: "up",     status: "Offense_Heavy",      espnPct: 1.2  },

  // ── SEED 4 ───────────────────────────────────────────────────────────────────
  { name: "Texas A&M",      kenpomRank: 4,  adjO: 21,  adjD: 15,  adjEM: 28.40, net: 13,  sos: 16,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.8  },
  { name: "Oregon",         kenpomRank: 4,  adjO: 20,  adjD: 18,  adjEM: 27.90, net: 15,  sos: 20,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.6  },
  { name: "Iowa",           kenpomRank: 4,  adjO: 2,   adjD: 36,  adjEM: 27.50, net: 14,  sos: 18,  trend: "steady", status: "Offense_Heavy",      espnPct: 0.5  },

  // ── SEED 5 ───────────────────────────────────────────────────────────────────
  { name: "Saint Mary's",   kenpomRank: 5,  adjO: 23,  adjD: 20,  adjEM: 26.20, net: 16,  sos: 55,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.4  },
  { name: "Wisconsin",      kenpomRank: 5,  adjO: 28,  adjD: 17,  adjEM: 25.80, net: 17,  sos: 21,  trend: "steady", status: "Defense_Heavy",      espnPct: 0.3  },
  { name: "Clemson",        kenpomRank: 5,  adjO: 25,  adjD: 22,  adjEM: 25.10, net: 18,  sos: 23,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.3  },

  // ── SEED 6 ───────────────────────────────────────────────────────────────────
  { name: "Ohio State",     kenpomRank: 6,  adjO: 29,  adjD: 24,  adjEM: 24.30, net: 20,  sos: 24,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.2  },
  { name: "Mississippi St", kenpomRank: 6,  adjO: 32,  adjD: 21,  adjEM: 23.80, net: 19,  sos: 26,  trend: "steady", status: "Defense_Heavy",      espnPct: 0.2  },
  { name: "TCU",            kenpomRank: 6,  adjO: 31,  adjD: 23,  adjEM: 23.40, net: 21,  sos: 27,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },

  // ── SEED 7 ───────────────────────────────────────────────────────────────────
  { name: "UCLA",           kenpomRank: 7,  adjO: 34,  adjD: 26,  adjEM: 22.60, net: 22,  sos: 29,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.2  },
  { name: "Kansas State",   kenpomRank: 7,  adjO: 36,  adjD: 25,  adjEM: 22.10, net: 24,  sos: 30,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Utah State",     kenpomRank: 7,  adjO: 35,  adjD: 28,  adjEM: 21.50, net: 26,  sos: 60,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },

  // ── SEED 8 ───────────────────────────────────────────────────────────────────
  { name: "Dayton",         kenpomRank: 8,  adjO: 38,  adjD: 29,  adjEM: 20.80, net: 27,  sos: 42,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Georgetown",     kenpomRank: 8,  adjO: 40,  adjD: 31,  adjEM: 20.10, net: 28,  sos: 38,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Indiana",        kenpomRank: 8,  adjO: 39,  adjD: 33,  adjEM: 19.60, net: 29,  sos: 32,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },

  // ── SEED 9 ───────────────────────────────────────────────────────────────────
  { name: "Arkansas",       kenpomRank: 9,  adjO: 42,  adjD: 32,  adjEM: 19.20, net: 30,  sos: 33,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Xavier",         kenpomRank: 9,  adjO: 44,  adjD: 34,  adjEM: 18.70, net: 31,  sos: 39,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Seton Hall",     kenpomRank: 9,  adjO: 45,  adjD: 36,  adjEM: 18.20, net: 32,  sos: 37,  trend: "down",   status: "Balanced_Profile",   espnPct: 0.1  },

  // ── SEED 10 ──────────────────────────────────────────────────────────────────
  { name: "Stanford",       kenpomRank: 10, adjO: 47,  adjD: 35,  adjEM: 17.80, net: 33,  sos: 35,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Ole Miss",       kenpomRank: 10, adjO: 49,  adjD: 37,  adjEM: 17.30, net: 34,  sos: 36,  trend: "steady", status: "Balanced_Profile",   espnPct: 0.1  },
  { name: "Colorado",       kenpomRank: 10, adjO: 50,  adjD: 38,  adjEM: 16.90, net: 35,  sos: 40,  trend: "up",     status: "Balanced_Profile",   espnPct: 0.1  },

  // ── SEED 11 ──────────────────────────────────────────────────────────────────
  { name: "NC State",       kenpomRank: 11, adjO: 52,  adjD: 40,  adjEM: 16.20, net: 37,  sos: 41,  trend: "up",     status: "Upset_Risk",         espnPct: 0.1  },
  { name: "New Mexico",     kenpomRank: 11, adjO: 55,  adjD: 42,  adjEM: 15.80, net: 38,  sos: 72,  trend: "steady", status: "Upset_Risk",         espnPct: 0.1  },
  { name: "Liberty",        kenpomRank: 11, adjO: 57,  adjD: 44,  adjEM: 15.30, net: 40,  sos: 85,  trend: "up",     status: "Upset_Risk",         espnPct: 0.0  },

  // ── SEED 12 ──────────────────────────────────────────────────────────────────
  { name: "Grand Canyon",   kenpomRank: 12, adjO: 60,  adjD: 46,  adjEM: 14.50, net: 42,  sos: 90,  trend: "steady", status: "Upset_Risk",         espnPct: 0.0  },
  { name: "Drake",          kenpomRank: 12, adjO: 62,  adjD: 48,  adjEM: 14.10, net: 44,  sos: 95,  trend: "steady", status: "Upset_Risk",         espnPct: 0.0  },
  { name: "Oral Roberts",   kenpomRank: 12, adjO: 58,  adjD: 50,  adjEM: 13.70, net: 46,  sos: 102, trend: "up",     status: "Upset_Risk",         espnPct: 0.0  },

  // ── SEED 13 ──────────────────────────────────────────────────────────────────
  { name: "Colgate",        kenpomRank: 13, adjO: 68,  adjD: 52,  adjEM: 12.80, net: 52,  sos: 150, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "Bryant",         kenpomRank: 13, adjO: 72,  adjD: 54,  adjEM: 12.20, net: 55,  sos: 165, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },
  { name: "UNCW",           kenpomRank: 13, adjO: 70,  adjD: 56,  adjEM: 11.80, net: 58,  sos: 172, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },

  // ── SEED 14 ──────────────────────────────────────────────────────────────────
  { name: "Morehead State", kenpomRank: 14, adjO: 80,  adjD: 58,  adjEM: 10.50, net: 65,  sos: 185, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "N. Kentucky",    kenpomRank: 14, adjO: 84,  adjD: 62,  adjEM: 9.80,  net: 70,  sos: 192, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },
  { name: "Montana State",  kenpomRank: 14, adjO: 87,  adjD: 64,  adjEM: 9.30,  net: 74,  sos: 198, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "S. Dakota St",   kenpomRank: 14, adjO: 85,  adjD: 61,  adjEM: 9.60,  net: 72,  sos: 195, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },

  // ── SEED 15 ──────────────────────────────────────────────────────────────────
  { name: "NJIT",           kenpomRank: 15, adjO: 95,  adjD: 70,  adjEM: 7.80,  net: 85,  sos: 220, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "E. Kentucky",    kenpomRank: 15, adjO: 98,  adjD: 74,  adjEM: 7.20,  net: 90,  sos: 228, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },
  { name: "Lipscomb",       kenpomRank: 15, adjO: 100, adjD: 76,  adjEM: 6.90,  net: 92,  sos: 235, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "Longwood",       kenpomRank: 15, adjO: 96,  adjD: 72,  adjEM: 7.50,  net: 88,  sos: 225, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },

  // ── SEED 16 ──────────────────────────────────────────────────────────────────
  { name: "Texas Southern", kenpomRank: 16, adjO: 120, adjD: 90,  adjEM: 4.20,  net: 120, sos: 280, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "Coppin State",   kenpomRank: 16, adjO: 125, adjD: 95,  adjEM: 3.80,  net: 125, sos: 290, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
  { name: "Holy Cross",     kenpomRank: 16, adjO: 118, adjD: 92,  adjEM: 4.50,  net: 118, sos: 285, trend: "up",     status: "Low_Seed",           espnPct: 0.0  },
  { name: "Howard",         kenpomRank: 16, adjO: 122, adjD: 96,  adjEM: 3.60,  net: 128, sos: 295, trend: "steady", status: "Low_Seed",           espnPct: 0.0  },
];
