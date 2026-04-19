import { createClient } from "@supabase/supabase-js";
import { Prediction, Stats } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface PersistedState {
  predictions: Prediction[];
  stats: Stats;
}

export async function loadFromSupabase(): Promise<PersistedState | null> {
  try {
    const { data, error } = await supabase
      .from("norm_state")
      .select("predictions, stats")
      .eq("id", "default")
      .single();

    if (error) {
      console.log("Supabase load error:", error.message);
      return null;
    }

    if (!data || !Array.isArray(data.predictions) || !data.stats) {
      return null;
    }

    return {
      predictions: data.predictions as Prediction[],
      stats: data.stats as Stats,
    };
  } catch (err) {
    console.error("Failed to load from Supabase:", err);
    return null;
  }
}

export async function saveToSupabase(state: PersistedState): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("norm_state")
      .upsert({
        id: "default",
        predictions: state.predictions,
        stats: state.stats,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase save error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to save to Supabase:", err);
    return false;
  }
}
