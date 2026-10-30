/**
 * Zentrale Konfiguration des Creator Portals (statisches Hosting, kein Build-Schritt).
 * Der Key ist der öffentliche Publishable-Key – identisch zum App-Client, abgesichert über RLS.
 */
export const SUPABASE_URL = 'https://mkpuqzaxsvrkcudsbmke.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_F6Od2UGLHNcA_M5jtaMXrQ_-b24CmZZ';

/** Verdienst beginnt erst ab diesem Level (siehe public.creator_levels). */
export const PAYOUT_MIN_LEVEL = 10;

/** Mindestauszahlung in Cent (25,00 €). */
export const PAYOUT_MIN_CENTS = 2500;

/** Gepinnte supabase-js Version (kein Build, Import über esm.sh). */
export const SUPABASE_JS_VERSION = '2.45.4';
