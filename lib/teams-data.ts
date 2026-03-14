// Static team data — edit these values to update the model
// Mirrors teams.csv; used by the TypeScript simulation engine

export interface TeamInput {
  name: string;
  kenpomRank: number;
  adjO: number;   // rank (lower = better)
  adjD: number;   // rank (lower = better)
  adjEM: number;  // efficiency margin
  net: number;
  sos: number;    // rank (higher = easier schedule)
  trend: "up" | "down" | "steady";
  status: string; // "Defending_Champ" | "INJURY_FLAG" | "Elite_Profile" | etc.
  espnPct: number; // public ESPN pick percentage
}

export const TEAMS: TeamInput[] = [
  { name: "Duke",          kenpomRank: 1,  adjO: 5,  adjD: 1,  adjEM: 39.35, net: 1,  sos: 2,  trend: "steady", status: "Elite_Profile",      espnPct: 25.0 },
  { name: "Michigan",      kenpomRank: 2,  adjO: 4,  adjD: 3,  adjEM: 37.12, net: 2,  sos: 1,  trend: "up",     status: "Elite_Profile",      espnPct: 16.8 },
  { name: "Arizona",       kenpomRank: 3,  adjO: 7,  adjD: 2,  adjEM: 36.45, net: 3,  sos: 4,  trend: "steady", status: "Elite_Profile",      espnPct: 11.2 },
  { name: "Florida",       kenpomRank: 4,  adjO: 8,  adjD: 5,  adjEM: 34.20, net: 4,  sos: 3,  trend: "up",     status: "Defending_Champ",    espnPct: 21.0 },
  { name: "Illinois",      kenpomRank: 5,  adjO: 1,  adjD: 27, adjEM: 33.10, net: 5,  sos: 6,  trend: "up",     status: "Offense_Heavy",      espnPct: 3.2  },
  { name: "Houston",       kenpomRank: 6,  adjO: 17, adjD: 6,  adjEM: 32.88, net: 7,  sos: 14, trend: "steady", status: "Defense_Heavy",      espnPct: 6.4  },
  { name: "Iowa State",    kenpomRank: 7,  adjO: 26, adjD: 7,  adjEM: 30.50, net: 8,  sos: 16, trend: "down",   status: "Borderline_Offense", espnPct: 2.1  },
  { name: "UConn",         kenpomRank: 10, adjO: 22, adjD: 13, adjEM: 28.90, net: 9,  sos: 20, trend: "steady", status: "Historical_Match",   espnPct: 4.8  },
  { name: "Michigan State",kenpomRank: 9,  adjO: 27, adjD: 8,  adjEM: 28.40, net: 12, sos: 12, trend: "up",     status: "Borderline_Offense", espnPct: 3.4  },
  { name: "Gonzaga",       kenpomRank: 11, adjO: 30, adjD: 9,  adjEM: 27.15, net: 6,  sos: 45, trend: "steady", status: "Shed_Defense",       espnPct: 1.4  },
  { name: "Louisville",    kenpomRank: 14, adjO: 14, adjD: 30, adjEM: 25.60, net: 14, sos: 17, trend: "down",   status: "INJURY_FLAG",        espnPct: 0.4  },
  { name: "Nebraska",      kenpomRank: 15, adjO: 54, adjD: 5,  adjEM: 24.30, net: 13, sos: 22, trend: "steady", status: "Upset_Risk",         espnPct: 1.8  },
  { name: "BYU",           kenpomRank: 19, adjO: 11, adjD: 19, adjEM: 23.10, net: 23, sos: 19, trend: "up",     status: "Darkhorse",          espnPct: 0.9  },
];
