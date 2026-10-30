import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

function fail(error) {
  const wrapped = new Error(error?.message || "unknown_error");
  wrapped.code = error?.code;
  wrapped.name = error?.name || "SupabaseError";
  throw wrapped;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) fail(error);
  return data.session ?? null;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail(error);
  return data;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function sendResetEmail(email) {
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) fail(error);
}

export async function savePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) fail(error);
}

export async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("first_name,last_name,username,avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

/**
 * Lädt den eigenen Creator-Status (RPC) plus die eigene Zeile im Post-Pool-Ranking.
 */
export async function loadDashboard() {
  const [stateResult, boardResult] = await Promise.all([
    supabase.rpc("creator_my_state"),
    supabase.rpc("creator_leaderboard", { p_month: null }),
  ]);

  if (stateResult.error) fail(stateResult.error);
  if (boardResult.error) fail(boardResult.error);

  const rows = Array.isArray(boardResult.data) ? boardResult.data : [];
  return {
    data: stateResult.data,
    me: rows.find((row) => row.is_me) ?? null,
    participants: rows.filter((row) => Number(row.pool_score) > 0).length,
  };
}

export async function submitCreatorPost({ platform, url, contentKey, publishedAt }) {
  const args = {
    p_platform: platform,
    p_url: url,
    p_published_at: publishedAt || null,
  };
  if (contentKey) args.p_content_key = contentKey;

  const { data, error } = await supabase.rpc("creator_submit_post", args);
  if (error) fail(error);
  return data;
}
