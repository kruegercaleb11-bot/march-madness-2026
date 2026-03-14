"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import type {
  AppState,
  Tab,
  BracketData,
  SimulationOutput,
  PoolState,
  LiveData,
} from "./types";

// ── Initial State ─────────────────────────────────────────────────────────────

const initialPool: PoolState = { picks: [], size: 6, prize: 320 };

const initialState: AppState = {
  activeTab: "overview",
  bracket: null,
  simulation: null,
  pool: initialPool,
  liveData: null,
  isSimulating: false,
  isScraping: false,
  selectionSundayMode: false,
};

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_TAB"; tab: Tab }
  | { type: "SET_BRACKET"; data: BracketData }
  | { type: "SET_SIMULATION"; data: SimulationOutput }
  | { type: "SET_POOL"; data: PoolState }
  | { type: "SET_LIVE_DATA"; data: LiveData }
  | { type: "SET_SIMULATING"; value: boolean }
  | { type: "SET_SCRAPING"; value: boolean }
  | { type: "SET_SELECTION_SUNDAY"; value: boolean }
  | { type: "HYDRATE"; state: Partial<AppState> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "SET_BRACKET":
      return { ...state, bracket: action.data };
    case "SET_SIMULATION":
      return { ...state, simulation: action.data };
    case "SET_POOL":
      return { ...state, pool: action.data };
    case "SET_LIVE_DATA":
      return { ...state, liveData: action.data };
    case "SET_SIMULATING":
      return { ...state, isSimulating: action.value };
    case "SET_SCRAPING":
      return { ...state, isScraping: action.value };
    case "SET_SELECTION_SUNDAY":
      return { ...state, selectionSundayMode: action.value };
    case "HYDRATE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  runSimulation: () => Promise<void>;
  runScraper: () => Promise<void>;
}

const AppContext = createContext<ContextValue | null>(null);

const STORAGE_KEY = "mm2026_state";
const PERSIST_KEYS: (keyof AppState)[] = ["bracket", "simulation", "pool", "liveData"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppState>;
        dispatch({ type: "HYDRATE", state: saved });
      }
    } catch {}

    // Check if it's after 6pm CT on Selection Sunday (March 15 2026)
    const now = new Date();
    const selSunday = new Date("2026-03-15T18:00:00-06:00");
    const selEnd    = new Date("2026-03-16T23:59:59-06:00");
    if (now >= selSunday && now <= selEnd) {
      dispatch({ type: "SET_SELECTION_SUNDAY", value: true });
    }
  }, []);

  // Persist selected keys to localStorage
  useEffect(() => {
    try {
      const toSave = Object.fromEntries(
        PERSIST_KEYS.map((k) => [k, state[k]])
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [state.bracket, state.simulation, state.pool, state.liveData]);

  async function runSimulation() {
    dispatch({ type: "SET_SIMULATING", value: true });
    try {
      const res = await fetch("/api/simulate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SimulationOutput = await res.json();
      dispatch({ type: "SET_SIMULATION", data });
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      dispatch({ type: "SET_SIMULATING", value: false });
    }
  }

  async function runScraper() {
    dispatch({ type: "SET_SCRAPING", value: true });
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveData = await res.json();
      dispatch({ type: "SET_LIVE_DATA", data });
    } catch (err) {
      console.error("Scraper failed:", err);
    } finally {
      dispatch({ type: "SET_SCRAPING", value: false });
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch, runSimulation, runScraper }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
