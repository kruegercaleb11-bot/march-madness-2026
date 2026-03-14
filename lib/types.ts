// ── Core Team / Simulation Types ──────────────────────────────────────────────

export interface Team {
  name: string;
  kenpom_rank: number;
  adjEM: number;
  adjO_rank?: number;
  adjD_rank?: number;
  net?: number;
  sos?: number;
  trend?: "up" | "down" | "steady";
  status?: string;
  espn_pct: number;
  seed?: number;
}

export interface SimResult {
  team: string;
  kenpom_rank: number;
  adjEM: number;
  raw_sim_pct: number;
  adj_sim_pct: number;
  final_sim_pct: number;
  espn_pct: number;
  pool_ev: number;
  value_ratio: number;
  magic_circle: boolean;
  repeat_tax: boolean;
  big_ten_penalty: boolean;
  injury_penalty: boolean;
  sos_discount: boolean;
  defense_fail: boolean;
  trend_mod: number;
  multiplier: number;
}

export interface SimulationOutput {
  simulations: number;
  teams: SimResult[];
}

// ── Bracket Types ─────────────────────────────────────────────────────────────

export type Round =
  | "Round of 64"
  | "Round of 32"
  | "Sweet 16"
  | "Elite 8"
  | "Final Four"
  | "Championship";

export interface GameResult {
  id: string;
  round: Round;
  team1: string;
  team2: string;
  winner?: string;
  score1?: number;
  score2?: number;
}

export interface BracketData {
  teams: Team[];
  games: GameResult[];
  updatedAt: string;
}

// ── Pool Types ────────────────────────────────────────────────────────────────

export interface PoolPick {
  participantName: string;
  champion: string;
  finalFourPicks: string[];
  points: number;
}

export interface PoolState {
  picks: PoolPick[];
  size: number;
  prize: number;
}

// ── Live Data ─────────────────────────────────────────────────────────────────

export interface LiveDataTeam extends SimResult {
  espn_pct: number;
  vegas_implied?: number;
}

export interface DivergenceAlert {
  team: string;
  espn_pct: number;
  vegas_imp: number;
  diff: number;
}

export interface LiveData {
  timestamp: string;
  vegas_odds: Record<string, number>;
  espn_pcts: Record<string, number>;
  divergence_alerts: DivergenceAlert[];
  teams: LiveDataTeam[];
}

// ── App Context ───────────────────────────────────────────────────────────────

export type Tab = "overview" | "calibrator" | "simulator" | "pool";

export interface AppState {
  activeTab: Tab;
  bracket: BracketData | null;
  simulation: SimulationOutput | null;
  pool: PoolState;
  liveData: LiveData | null;
  isSimulating: boolean;
  isScraping: boolean;
  selectionSundayMode: boolean;
}
