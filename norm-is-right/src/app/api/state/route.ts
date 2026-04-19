import { NextResponse } from "next/server";
import { loadFromSupabase, saveToSupabase } from "@/lib/supabase";
import type { Prediction, Stats } from "@/types";

export const runtime = "nodejs";

type PersistedState = {
  predictions: Prediction[];
  stats: Stats;
};

function defaultStats(): Stats {
  return {
    totalPredictions: 0,
    normWins: 0,
    normLosses: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
  };
}

function defaultState(): PersistedState {
  return {
    predictions: [],
    stats: defaultStats(),
  };
}

export async function GET() {
  try {
    const state = await loadFromSupabase();
    
    if (!state) {
      return NextResponse.json(defaultState());
    }

    if (!Array.isArray(state?.predictions) || !state?.stats) {
      return NextResponse.json(defaultState());
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error("GET /api/state error:", error);
    return NextResponse.json(
      {
        error: "Failed to load state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PersistedState;
    
    if (!Array.isArray(body?.predictions) || !body?.stats) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const success = await saveToSupabase(body);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save state" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/state error:", error);
    return NextResponse.json(
      {
        error: "Failed to save state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}