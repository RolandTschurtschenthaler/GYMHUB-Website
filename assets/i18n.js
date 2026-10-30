/**
 * Minimal-i18n des Creator Portals (de/en) – bewusst ohne Build-Schritt.
 */

const DICT = {
  de: {
    brand_sub: "CREATOR PORTAL",
    boot: "Lade Creator Portal…",
    loading: "Lade Daten…",

    login_title: "Creator Portal",
    login_subtitle: "Melde dich mit deinem GymHub-Konto an.",
    email: "E-MAIL",
    password: "PASSWORT",
    sign_in: "ANMELDEN",
    signing_in: "WIRD ANGEMELDET…",
    forgot: "Passwort vergessen?",
    back_to_login: "Zurück zur Anmeldung",
    login_hint_1: "Neu hier? Reiche unten deinen ersten Post ein – das legt dein Creator-Profil automatisch an.",
    login_hint_2: "Du bist schon Creator in der GymHub App? Melde dich mit denselben Zugangsdaten an.",

    forgot_title: "Passwort zurücksetzen",
    forgot_subtitle: "Wir senden dir einen Link an deine E-Mail-Adresse.",
    send_link: "LINK SENDEN",
    sending: "WIRD GESENDET…",
    forgot_sent: "Link verschickt – prüfe dein Postfach.",

    recovery_title: "Neues Passwort setzen",
    recovery_subtitle: "Wähle ein neues Passwort für dein Konto.",
    new_password: "NEUES PASSWORT",
    repeat_password: "PASSWORT BESTÄTIGEN",
    save_password: "PASSWORT SPEICHERN",
    password_saved: "Passwort gespeichert. Du bist angemeldet.",
    password_mismatch: "Die Passwörter stimmen nicht überein.",
    password_too_short: "Das Passwort braucht mindestens 8 Zeichen.",

    invalid_credentials: "E-Mail oder Passwort ist falsch.",
    email_invalid: "Bitte gib eine gültige E-Mail-Adresse an.",
    email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.",
    rate_limited: "Zu viele Versuche. Bitte kurz warten.",
    generic_error: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    network_error: "Verbindung fehlgeschlagen. Prüfe dein Netzwerk.",
    not_authenticated: "Sitzung abgelaufen. Bitte neu anmelden.",

    signed_in_as: "ANGEMELDET ALS",
    sign_out: "ABMELDEN",
    hello: "Hallo, {{name}}",
    refresh: "AKTUALISIEREN",

    level_card_title: "CREATOR LEVEL",
    xp_progress: "{{current}} / {{next}} XP",
    xp_next: "Noch {{xp}} XP bis Level {{level}}",
    xp_max: "Max-Level erreicht",
    reach_rank: "REACH-RANG",
    cpm: "DEIN CPM",
    cpm_unit: "€ / 1.000 Views",
    streak: "WOCHEN-STREAK",
    streak_weeks: "{{count}} Wochen",
    followers: "FOLLOWER",

    month_views: "VIEWS (MONAT)",
    payout: "VORSCHAU",
    payout_note: "Abrechnung monatlich · Auszahlung ab {{min}}",
    payout_ready: "Mindestauszahlung erreicht ({{min}})",
    payout_below_min: "Noch {{amount}} bis zur Mindestauszahlung",
    payout_locked: "Verdienst startet mit Level {{level}}.",
    payout_locked_progress: "Noch {{xp}} XP bis Level {{level}}",

    pool_title: "POST-POOL {{month}}",
    pool_subtitle: "Deine besten 6 Posts nach 30-Tage-Views",
    pool_rank: "PLATZ",
    pool_score: "SCORE",
    pool_no_rank: "Noch kein Score",
    pool_participants: "{{count}} Creator mit Score",
    pool_rules: "Pro Post zählen nur die Views der ersten 30 Tage – ein Inhalt zählt einmal.",
    pool_rules_2: "Die Platzierung wird nach Monatsende abgerechnet.",

    intro_eyebrow: "NOCH KEIN CREATOR-PROFIL",
    intro_title: "WERDE GYMHUB CREATOR",
    intro_subtitle: "Poste deine Trainings-Videos, sammle XP und steig mit Level 10 in die Verdienst-Stufe ein.",
    intro_bullet_1: "Level 2: Creator-Badge in deinem Profil",
    intro_bullet_2: "Level 5: 1 Jahr Pro Pass gratis",
    intro_bullet_3: "Level 10: Verdienst-Start – 1,00 € pro 1.000 verifizierte Views",

    posts_title: "DEINE POSTS",
    submit_title: "POST EINREICHEN",
    send_post: "POST EINREICHEN",
    sending_post: "WIRD GESENDET…",
    posts_empty: "Noch kein Post eingereicht.",
    platform: "PLATTFORM",
    url: "LINK ZUM POST",
    date: "VERÖFFENTLICHT AM",
    content_key: "CONTENT-ID (OPTIONAL)",
    content_key_hint: "Verhindert doppelte Einreichungen desselben Videos.",
    submit_hint: "Ein Inhalt = ein Post. Cross-Posting zählt einmal.",
    submit_success: "Post eingereicht – wird jetzt geprüft.",
    duplicate: "Dieser Post wurde bereits eingereicht.",
    invalid_url: "Bitte einen gültigen Link angeben (https://…).",
    invalid_date: "Das Datum darf nicht in der Zukunft liegen.",
    invalid_platform: "Bitte eine Plattform wählen.",

    table_platform: "PLATTFORM",
    table_date: "DATUM",
    table_views: "VIEWS",
    table_status: "STATUS",
    table_action: "LINK",
    open: "ÖFFNEN",
    status_pending: "IN PRÜFUNG",
    status_approved: "FREIGEGEBEN",
    status_rejected: "ABGELEHNT",
    xp_pending: "+200 XP nach Freigabe",

    xp_title: "XP-VERLAUF",
    xp_empty: "Noch keine XP gesammelt.",
    unlocks_title: "FREISCHALTUNGEN",
    unlocks_reached: "Erreicht",
    unlocks_until: "Ab Level {{level}}",
    unlock_badge: "Creator-Badge im Profil",
    unlock_pro: "1 Jahr Pro Pass gratis",
    unlock_payout: "Verdienst-Start (1,00 € / 1.000 Views)",
    unlock_cpm: "+{{value}} € CPM-Bonus",
    unlock_revenue: "25 % Revenue-Share",

    kind_post_approved: "Post freigegeben",
    kind_pool_global_win: "Post-Pool gewonnen",
    kind_pool_class_win: "Gewichtsklasse gewonnen",
    kind_pool_top10: "Top 10 im Post-Pool",
    kind_streak_week: "Wochen-Streak",
    kind_other: "XP-Gutschrift",

    reach_bronze: "BRONZE",
    reach_silver: "SILBER",
    reach_gold: "GOLD",
    reach_platinum: "PLATIN",
    reach_icon: "ICON",

    platform_tiktok: "TikTok",
    platform_instagram: "Instagram",
    platform_youtube: "YouTube",
    platform_other: "Andere",

    load_error: "Deine Creator-Daten konnten nicht geladen werden.",
    retry: "ERNEUT VERSUCHEN",
    footer: "GYMHUB CREATOR PROGRAMM · VERDIENST AB LEVEL 10 · 1,00 € PRO 1.000 VERIFIZIERTE VIEWS",
  },

  en: {
    brand_sub: "CREATOR PORTAL",
    boot: "Loading Creator Portal…",
    loading: "Loading data…",

    login_title: "Creator Portal",
    login_subtitle: "Sign in with your GymHub account.",
    email: "EMAIL",
    password: "PASSWORD",
    sign_in: "SIGN IN",
    signing_in: "SIGNING IN…",
    forgot: "Forgot password?",
    back_to_login: "Back to sign in",
    login_hint_1: "New here? Submit your first post below – that creates your creator profile automatically.",
    login_hint_2: "Already a creator in the GymHub app? Sign in with the same credentials.",

    forgot_title: "Reset password",
    forgot_subtitle: "We will send a reset link to your email address.",
    send_link: "SEND LINK",
    sending: "SENDING…",
    forgot_sent: "Link sent – check your inbox.",

    recovery_title: "Set a new password",
    recovery_subtitle: "Choose a new password for your account.",
    new_password: "NEW PASSWORD",
    repeat_password: "CONFIRM PASSWORD",
    save_password: "SAVE PASSWORD",
    password_saved: "Password saved. You are signed in.",
    password_mismatch: "The passwords do not match.",
    password_too_short: "The password needs at least 8 characters.",

    invalid_credentials: "Email or password is incorrect.",
    email_invalid: "Please enter a valid email address.",
    email_not_confirmed: "Please confirm your email address first.",
    rate_limited: "Too many attempts. Please wait a moment.",
    generic_error: "Something went wrong. Please try again.",
    network_error: "Connection failed. Check your network.",
    not_authenticated: "Session expired. Please sign in again.",

    signed_in_as: "SIGNED IN AS",
    sign_out: "SIGN OUT",
    hello: "Hi, {{name}}",
    refresh: "REFRESH",

    level_card_title: "CREATOR LEVEL",
    xp_progress: "{{current}} / {{next}} XP",
    xp_next: "{{xp}} XP to level {{level}}",
    xp_max: "Max level reached",
    reach_rank: "REACH TIER",
    cpm: "YOUR CPM",
    cpm_unit: "€ / 1,000 views",
    streak: "WEEK STREAK",
    streak_weeks: "{{count}} weeks",
    followers: "FOLLOWERS",

    month_views: "VIEWS (MONTH)",
    payout: "PREVIEW",
    payout_note: "Billed monthly · payout from {{min}}",
    payout_ready: "Minimum payout reached ({{min}})",
    payout_below_min: "{{amount}} left to the minimum payout",
    payout_locked: "Earnings start at level {{level}}.",
    payout_locked_progress: "{{xp}} XP to level {{level}}",

    pool_title: "POST POOL {{month}}",
    pool_subtitle: "Your best 6 posts by 30-day views",
    pool_rank: "RANK",
    pool_score: "SCORE",
    pool_no_rank: "No score yet",
    pool_participants: "{{count}} creators with a score",
    pool_rules: "Only the first 30 days of views count per post – one piece of content counts once.",
    pool_rules_2: "Ranking is settled after the month ends.",

    intro_eyebrow: "NO CREATOR PROFILE YET",
    intro_title: "BECOME A GYMHUB CREATOR",
    intro_subtitle: "Post your training videos, collect XP and unlock earnings at level 10.",
    intro_bullet_1: "Level 2: creator badge on your profile",
    intro_bullet_2: "Level 5: 1 year of Pro Pass for free",
    intro_bullet_3: "Level 10: earnings start – €1.00 per 1,000 verified views",

    posts_title: "YOUR POSTS",
    submit_title: "SUBMIT A POST",
    send_post: "SUBMIT POST",
    sending_post: "SUBMITTING…",
    posts_empty: "No post submitted yet.",
    platform: "PLATFORM",
    url: "LINK TO POST",
    date: "PUBLISHED ON",
    content_key: "CONTENT ID (OPTIONAL)",
    content_key_hint: "Prevents the same video from being submitted twice.",
    submit_hint: "One piece of content = one post. Cross-posting counts once.",
    submit_success: "Post submitted – it is being reviewed.",
    duplicate: "This post has already been submitted.",
    invalid_url: "Please enter a valid link (https://…).",
    invalid_date: "The date cannot be in the future.",
    invalid_platform: "Please choose a platform.",

    table_platform: "PLATFORM",
    table_date: "DATE",
    table_views: "VIEWS",
    table_status: "STATUS",
    table_action: "LINK",
    open: "OPEN",
    status_pending: "IN REVIEW",
    status_approved: "APPROVED",
    status_rejected: "REJECTED",
    xp_pending: "+200 XP after approval",

    xp_title: "XP HISTORY",
    xp_empty: "No XP collected yet.",
    unlocks_title: "UNLOCKS",
    unlocks_reached: "Unlocked",
    unlocks_until: "From level {{level}}",
    unlock_badge: "Creator badge on your profile",
    unlock_pro: "1 year of Pro Pass for free",
    unlock_payout: "Earnings start (€1.00 / 1,000 views)",
    unlock_cpm: "+€{{value}} CPM bonus",
    unlock_revenue: "25% revenue share",

    kind_post_approved: "Post approved",
    kind_pool_global_win: "Post pool winner",
    kind_pool_class_win: "Weight class winner",
    kind_pool_top10: "Post pool top 10",
    kind_streak_week: "Week streak",
    kind_other: "XP credit",

    reach_bronze: "BRONZE",
    reach_silver: "SILVER",
    reach_gold: "GOLD",
    reach_platinum: "PLATINUM",
    reach_icon: "ICON",

    platform_tiktok: "TikTok",
    platform_instagram: "Instagram",
    platform_youtube: "YouTube",
    platform_other: "Other",

    load_error: "Your creator data could not be loaded.",
    retry: "TRY AGAIN",
    footer: "GYMHUB CREATOR PROGRAM · EARNINGS FROM LEVEL 10 · €1.00 PER 1,000 VERIFIED VIEWS",
  },
};

const LS_KEY = "gymhub-portal-lang";
let lang = "de";

function detect() {
  try {
    const stored = window.localStorage.getItem(LS_KEY);
    if (stored === "de" || stored === "en") return stored;
  } catch (_error) {
    /* localStorage kann blockiert sein */
  }
  return String(navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
}

lang = detect();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (next !== "de" && next !== "en") return;
  lang = next;
  try {
    window.localStorage.setItem(LS_KEY, next);
  } catch (_error) {
    /* ignorieren */
  }
  document.documentElement.setAttribute("lang", next);
}

export function t(key, vars) {
  const dict = DICT[lang] || DICT.de;
  let out = dict[key] ?? DICT.de[key] ?? key;
  if (vars) {
    out = out.replace(/\{\{(\w+)\}\}/g, (_match, name) => String(vars[name] ?? ""));
  }
  return out;
}
