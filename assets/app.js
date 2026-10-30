import { PAYOUT_MIN_CENTS, PAYOUT_MIN_LEVEL } from "./config.js";
import { getLang, setLang, t } from "./i18n.js";
import {
  getSession,
  loadDashboard,
  loadProfile,
  savePassword,
  sendResetEmail,
  signInWithPassword,
  signOutUser,
  submitCreatorPost,
  supabase,
} from "./api.js";

const root = document.getElementById("app");
const PLATFORMS = ["tiktok", "instagram", "youtube", "other"];

/* ------------------------------------------------------------------ state */

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const state = {
  screen: "boot",
  user: null,
  profile: null,
  data: null,
  pool: null,
  participants: 0,
  busy: false,
  notice: null,
  loadError: false,
  form: {
    email: "",
    platform: "tiktok",
    url: "",
    date: todayISO(),
    contentKey: "",
  },
};

/* --------------------------------------------------------------- format */

const LOCALES = { de: "de-DE", en: "en-GB" };

function locale() {
  return LOCALES[getLang()] || LOCALES.de;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function num(value) {
  return new Intl.NumberFormat(locale()).format(Number(value) || 0);
}

function euro(cents) {
  return new Intl.NumberFormat(locale(), { style: "currency", currency: "EUR" }).format(
    (Number(cents) || 0) / 100,
  );
}

function decimal(value) {
  return new Intl.NumberFormat(locale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function fmtDay(value) {
  if (!value) return "—";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${day}.${month}.${year}`;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString(locale());
}

function fmtMonth(value) {
  if (!value) return "—";
  const [year, month] = String(value).split("-");
  if (!year || !month) return "—";
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return parsed.toLocaleDateString(locale(), { month: "long", year: "numeric", timeZone: "UTC" });
}

function isSafeUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

/* ---------------------------------------------------------------- domain */

function levelInfo(data) {
  const creator = data?.creator ?? null;
  const xp = Number(creator?.xp_total) || 0;
  const level = Number(creator?.level) || 1;
  const curve = Array.isArray(data?.level_curve) ? data.level_curve : [];
  const current = curve.find((entry) => Number(entry.level) === level) ?? null;
  const next = data?.next_level ?? null;
  const startXp = Number(current?.xp_required) || 0;
  const endXp = next ? Number(next.xp_required) : null;
  const progress = endXp && endXp > startXp
    ? Math.min(1, Math.max(0, (xp - startXp) / (endXp - startXp)))
    : 1;

  return {
    xp,
    level,
    next,
    curve,
    startXp,
    endXp,
    progress,
    remaining: endXp ? Math.max(0, endXp - xp) : 0,
    reach: creator?.reach_rank || "bronze",
    streak: Number(creator?.streak_weeks) || 0,
    followers: Number(creator?.reach_followers) || 0,
  };
}

function displayName() {
  const profile = state.profile;
  const full = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (profile?.username) return profile.username;
  const email = state.user?.email || "";
  return email.split("@")[0] || "Creator";
}

function userLabel() {
  return state.profile?.username || state.user?.email || "";
}

function reachLabel(rank) {
  const key = `reach_${rank}`;
  const label = t(key);
  return label === key ? t("reach_bronze") : label;
}

function kindLabel(kind) {
  const key = `kind_${kind}`;
  const label = t(key);
  return label === key ? t("kind_other") : label;
}

function mapErrorKey(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("duplicate")) return "duplicate";
  if (message.includes("invalid_url")) return "invalid_url";
  if (message.includes("invalid_date")) return "invalid_date";
  if (message.includes("invalid_platform")) return "invalid_platform";
  if (message.includes("not_authenticated") || message.includes("jwt")) return "not_authenticated";
  if (message.includes("invalid login credentials")) return "invalid_credentials";
  if (message.includes("email not confirmed")) return "email_not_confirmed";
  if (message.includes("rate limit") || message.includes("too many")) return "rate_limited";
  if (message.includes("password should be at least")) return "password_too_short";
  if (message.includes("failed to fetch") || message.includes("networkerror")) return "network_error";
  return "generic_error";
}

/* ----------------------------------------------------------------- views */

function noticeHtml() {
  if (!state.notice) return "";
  const type = state.notice.type === "ok" ? "ok" : "error";
  return `<div class="notice notice--${type}" role="status">${esc(state.notice.text)}</div>`;
}

function topbar() {
  const languages = ["de", "en"]
    .map(
      (code) =>
        `<button type="button" class="lang__btn ${
          code === getLang() ? "is-active" : ""
        }" data-action="lang" data-lang="${code}" aria-pressed="${code === getLang()}">${code.toUpperCase()}</button>`,
    )
    .join("");

  return `<header class="topbar">
    <div class="topbar__inner">
      <a class="brand" href="${esc(window.location.pathname)}">
        <span class="brand__mark" aria-hidden="true">G</span>
        <span class="brand__text">GYMHUB<span class="brand__sub">${t("brand_sub")}</span></span>
      </a>
      <div class="topbar__actions">
        <div class="lang" role="group" aria-label="Sprache">${languages}</div>
        ${state.user ? `<button type="button" class="btn btn--ghost btn--sm" data-action="sign-out">${t("sign_out")}</button>` : ""}
      </div>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="footer"><p>${t("footer")}</p></footer>`;
}

function field(id, label, control, hint) {
  return `<div class="field">
    <label class="label" for="${id}">${label}</label>
    ${control}
    ${hint ? `<span class="field__hint">${hint}</span>` : ""}
  </div>`;
}

function authShell(content) {
  return `<main id="main" class="auth-wrap"><div class="auth-card">${content}</div></main>`;
}

function loginScreen() {
  return authShell(`
    <h1>${t("login_title")}</h1>
    <p class="auth-sub">${t("login_subtitle")}</p>
    ${noticeHtml()}
    <form id="login-form" novalidate>
      ${field("email", t("email"), `<input class="input" id="email" name="email" type="email" autocomplete="email" inputmode="email" required value="${esc(state.form.email)}" />`)}
      ${field("password", t("password"), `<input class="input" id="password" name="password" type="password" autocomplete="current-password" required />`)}
      <button class="btn btn--primary btn--block" type="submit" ${state.busy ? "disabled" : ""}>${
        state.busy ? t("signing_in") : t("sign_in")
      }</button>
    </form>
    <button type="button" class="link-btn" data-action="goto-forgot">${t("forgot")}</button>
    <div class="auth-footnote">
      <p>${t("login_hint_1")}</p>
      <p>${t("login_hint_2")}</p>
    </div>
  `);
}

function forgotScreen() {
  return authShell(`
    <h1>${t("forgot_title")}</h1>
    <p class="auth-sub">${t("forgot_subtitle")}</p>
    ${noticeHtml()}
    <form id="forgot-form" novalidate>
      ${field("email", t("email"), `<input class="input" id="email" name="email" type="email" autocomplete="email" inputmode="email" required value="${esc(state.form.email)}" />`)}
      <button class="btn btn--primary btn--block" type="submit" ${state.busy ? "disabled" : ""}>${
        state.busy ? t("sending") : t("send_link")
      }</button>
    </form>
    <button type="button" class="link-btn" data-action="goto-login">${t("back_to_login")}</button>
  `);
}

function recoveryScreen() {
  return authShell(`
    <h1>${t("recovery_title")}</h1>
    <p class="auth-sub">${t("recovery_subtitle")}</p>
    ${noticeHtml()}
    <form id="recovery-form" novalidate>
      ${field("nav-password", t("new_password"), `<input class="input" id="nav-password" name="password" type="password" autocomplete="new-password" minlength="8" required />`)}
      ${field("nav-password2", t("repeat_password"), `<input class="input" id="nav-password2" name="password2" type="password" autocomplete="new-password" minlength="8" required />`)}
      <button class="btn btn--primary btn--block" type="submit" ${state.busy ? "disabled" : ""}>${t("save_password")}</button>
    </form>
    <button type="button" class="link-btn" data-action="goto-login">${t("back_to_login")}</button>
  `);
}

function loadingScreen() {
  return `<main id="main" class="container"><div class="loading-card"><span class="spinner" aria-hidden="true"></span><p>${t("loading")}</p></div></main>`;
}

function heroCard(info) {
  const progressPercent = Math.round(info.progress * 100);
  const xpLine = info.endXp
    ? t("xp_progress", { current: num(info.xp), next: num(info.endXp) })
    : t("xp_progress", { current: num(info.xp), next: "—" });
  const remaining = info.endXp
    ? t("xp_next", { xp: num(info.remaining), level: info.next ? info.next.level : info.level + 1 })
    : t("xp_max");

  return `<section class="card level-hero">
    <div class="level-hero__top">
      <div class="level-hero__badge">
        <span class="level-hero__label">${t("level_card_title")}</span>
        <span class="level-hero__level">${info.level}</span>
      </div>
      <div class="level-hero__xp">
        <div class="level-hero__xp-row">
          <strong>${xpLine}</strong>
          <span>${remaining}</span>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
          <div class="progress__bar" style="width:${progressPercent}%"></div>
        </div>
      </div>
    </div>
    <div class="chips">
      <div class="chip"><span class="chip__label">${t("reach_rank")}</span><strong class="rank rank--${esc(info.reach)}">${esc(reachLabel(info.reach))}</strong></div>
      <div class="chip"><span class="chip__label">${t("cpm")}</span><strong>${euro(state.data?.cpm_cents)}</strong></div>
      <div class="chip"><span class="chip__label">${t("streak")}</span><strong>${esc(t("streak_weeks", { count: info.streak }))}</strong></div>
      <div class="chip"><span class="chip__label">${t("followers")}</span><strong>${num(info.followers)}</strong></div>
    </div>
  </section>`;
}

function introCard() {
  return `<section class="card intro-card">
    <p class="eyebrow">${t("intro_eyebrow")}</p>
    <h2 class="intro-card__title">${t("intro_title")}</h2>
    <p class="card__note">${t("intro_subtitle")}</p>
    <ul class="bullet-list">
      <li>${t("intro_bullet_1")}</li>
      <li>${t("intro_bullet_2")}</li>
      <li>${t("intro_bullet_3")}</li>
    </ul>
  </section>`;
}

function payoutCard(info) {
  const monthViews = Number(state.data?.month_views) || 0;
  const cpm = Number(state.data?.cpm_cents) || 0;
  const payout = Math.round((monthViews * cpm) / 1000);
  const unlocked = info.level >= PAYOUT_MIN_LEVEL;
  const reachedMinimum = payout >= PAYOUT_MIN_CENTS;
  const payoutLevel = info.curve.find((entry) => Number(entry.level) === PAYOUT_MIN_LEVEL) ?? null;
  const xpToPayoutLevel = payoutLevel ? Math.max(0, Number(payoutLevel.xp_required) - info.xp) : 0;

  return `<section class="card">
    <div class="card__head">
      <h2 class="card__title">${t("payout")}</h2>
      <span class="card__hint">${esc(fmtMonth(state.data?.month))}</span>
    </div>
    <div class="payout__value ${unlocked ? "" : "is-locked"}">${euro(payout)}</div>
    <div class="kv"><span>${t("month_views")}</span><strong>${num(monthViews)}</strong></div>
    <div class="kv"><span>${t("cpm")}</span><strong>${euro(cpm)} ${t("cpm_unit")}</strong></div>
    ${
      unlocked
        ? reachedMinimum
          ? `<p class="card__note card__note--ok">${esc(t("payout_ready", { min: euro(PAYOUT_MIN_CENTS) }))}</p>`
          : `<p class="card__note">${esc(t("payout_below_min", { amount: euro(Math.max(0, PAYOUT_MIN_CENTS - payout)) }))}</p>`
        : `<p class="card__locked">${esc(t("payout_locked", { level: PAYOUT_MIN_LEVEL }))} ${esc(
            t("payout_locked_progress", { xp: num(xpToPayoutLevel), level: PAYOUT_MIN_LEVEL }),
          )}</p>`
    }
    <p class="card__note muted">${esc(t("payout_note", { min: euro(PAYOUT_MIN_CENTS) }))}</p>
  </section>`;
}

function poolCard() {
  const pool = state.pool;
  const rank = pool?.pool_rank ?? null;
  const score = Number(pool?.pool_score) || 0;

  return `<section class="card">
    <div class="card__head">
      <h2 class="card__title">${esc(t("pool_title", { month: fmtMonth(state.data?.month) }))}</h2>
      <span class="card__hint">${esc(t("pool_subtitle"))}</span>
    </div>
    <div class="pool">
      <div class="pool__cell">
        <span class="pool__label">${t("pool_rank")}</span>
        <strong class="pool__value">${rank ? "#" + esc(rank) : "—"}</strong>
      </div>
      <div class="pool__cell">
        <span class="pool__label">${t("pool_score")}</span>
        <strong class="pool__value">${num(score)}</strong>
      </div>
    </div>
    <p class="card__note">${rank ? esc(t("pool_participants", { count: state.participants })) : esc(t("pool_no_rank"))}</p>
    <p class="card__note">${t("pool_rules")}</p>
    <p class="card__note">${t("pool_rules_2")}</p>
  </section>`;
}

function unlocksCard(info) {
  const milestones = info.curve.filter((entry) => entry.unlock_type && entry.unlock_type !== "xp_only");
  if (!milestones.length) return "";

  const items = milestones
    .map((entry) => {
      const level = Number(entry.level);
      const reached = info.level >= level;
      let label;
      if (entry.unlock_type === "badge") label = t("unlock_badge");
      else if (entry.unlock_type === "pro_year") label = t("unlock_pro");
      else if (entry.unlock_type === "payout_start") label = t("unlock_payout");
      else if (entry.unlock_type === "cpm_bonus") label = t("unlock_cpm", { value: decimal(entry.cpm_bonus_eur) });
      else label = t("unlock_revenue");

      return `<li class="unlock ${reached ? "is-reached" : ""}">
        <span class="unlock__level">L${level}</span>
        <span class="unlock__label">${esc(label)}</span>
        <span class="unlock__state">${reached ? t("unlocks_reached") : esc(t("unlocks_until", { level }))}</span>
      </li>`;
    })
    .join("");

  return `<section class="card">
    <div class="card__head"><h2 class="card__title">${t("unlocks_title")}</h2></div>
    <ul class="unlock-list">${items}</ul>
  </section>`;
}

function submitCard() {
  const options = PLATFORMS.map(
    (platform) =>
      `<option value="${platform}" ${state.form.platform === platform ? "selected" : ""}>${esc(t("platform_" + platform))}</option>`,
  ).join("");

  return `<section class="card">
    <div class="card__head"><h2 class="card__title">${t("submit_title")}</h2></div>
    <form id="post-form" novalidate>
      <div class="form-grid">
        ${field("platform", t("platform"), `<select class="input" id="platform" name="platform">${options}</select>`)}
        ${field("date", t("date"), `<input class="input" id="date" name="date" type="date" max="${todayISO()}" value="${esc(state.form.date)}" />`)}
        ${field(
          "url",
          t("url"),
          `<input class="input" id="url" name="url" type="url" inputmode="url" placeholder="https://www.tiktok.com/@du/video/…" required value="${esc(state.form.url)}" />`,
        )}
        ${field(
          "contentKey",
          t("content_key"),
          `<input class="input" id="contentKey" name="contentKey" placeholder="video-123" value="${esc(state.form.contentKey)}" />`,
          esc(t("content_key_hint")),
        )}
      </div>
      <div class="form-footer">
        <button class="btn btn--primary" type="submit" ${state.busy ? "disabled" : ""}>${
          state.busy ? t("sending_post") : t("send_post")
        }</button>
        <p class="card__note">${t("submit_hint")}</p>
      </div>
    </form>
  </section>`;
}

function statusPill(status) {
  const key = status === "approved" ? "status_approved" : status === "rejected" ? "status_rejected" : "status_pending";
  const variant = status === "approved" || status === "rejected" ? status : "pending";
  return `<span class="pill pill--${variant}">${t(key)}</span>`;
}

function postsCard() {
  const posts = Array.isArray(state.data?.posts) ? state.data.posts : [];

  const rows = posts
    .map((post) => {
      const link = isSafeUrl(post.url)
        ? `<a class="btn btn--ghost btn--xs" href="${esc(post.url)}" target="_blank" rel="noopener noreferrer nofollow">${t("open")}</a>`
        : `<span class="muted">—</span>`;
      const note = post.review_note ? `<span class="row-note">${esc(post.review_note)}</span>` : "";
      const pending = post.status === "pending" ? `<span class="row-note muted">${t("xp_pending")}</span>` : "";

      return `<tr>
        <td><span class="platform platform--${esc(post.platform)}">${esc(t("platform_" + post.platform))}</span></td>
        <td>${esc(fmtDay(post.published_at))}</td>
        <td class="num">${num(post.views)}</td>
        <td>${statusPill(post.status)}${note}${pending}</td>
        <td>${link}</td>
      </tr>`;
    })
    .join("");

  return `<section class="card">
    <div class="card__head">
      <h2 class="card__title">${t("posts_title")}</h2>
      <span class="card__hint">${posts.length}</span>
    </div>
    ${
      posts.length
        ? `<div class="table-wrap"><table>
            <thead>
              <tr>
                <th>${t("table_platform")}</th>
                <th>${t("table_date")}</th>
                <th class="num">${t("table_views")}</th>
                <th>${t("table_status")}</th>
                <th>${t("table_action")}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table></div>`
        : `<p class="empty">${t("posts_empty")}</p>`
    }
  </section>`;
}

function xpCard() {
  const events = Array.isArray(state.data?.xp_events) ? state.data.xp_events : [];

  const items = events
    .slice(0, 10)
    .map(
      (event) => `<li class="xp-row">
        <span class="xp-row__kind">${esc(kindLabel(event.kind))}</span>
        <span class="xp-row__date">${esc(fmtDay(event.period || event.created_at))}</span>
        <strong class="xp-row__value">+${num(event.xp)} XP</strong>
      </li>`,
    )
    .join("");

  return `<section class="card">
    <div class="card__head"><h2 class="card__title">${t("xp_title")}</h2></div>
    ${items ? `<ul class="xp-list">${items}</ul>` : `<p class="empty">${t("xp_empty")}</p>`}
  </section>`;
}

function dashboardScreen() {
  if (state.loadError || !state.data) {
    return `<main id="main" class="container">
      ${noticeHtml()}
      <div class="card empty-state">
        <h2>${t("load_error")}</h2>
        <button class="btn btn--primary" type="button" data-action="refresh">${t("retry")}</button>
      </div>
    </main>`;
  }

  const info = levelInfo(state.data);
  const hasCreator = Boolean(state.data.creator);

  return `<main id="main" class="container">
    <div class="page-head">
      <div class="page-head__text">
        <p class="eyebrow">${t("signed_in_as")} ${esc(userLabel())}</p>
        <h1>${esc(t("hello", { name: displayName() }))}</h1>
      </div>
      <button class="btn btn--ghost btn--sm" type="button" data-action="refresh" ${state.busy ? "disabled" : ""}>${t("refresh")}</button>
    </div>
    ${noticeHtml()}
    <div class="grid">
      <div class="col">
        ${hasCreator ? heroCard(info) : introCard()}
        ${submitCard()}
        ${hasCreator ? postsCard() : ""}
      </div>
      <aside class="col">
        ${payoutCard(info)}
        ${poolCard()}
        ${unlocksCard(info)}
        ${xpCard()}
      </aside>
    </div>
  </main>`;
}

function body() {
  switch (state.screen) {
    case "login":
      return loginScreen();
    case "forgot":
      return forgotScreen();
    case "recovery":
      return recoveryScreen();
    case "dashboard":
      return dashboardScreen();
    default:
      return loadingScreen();
  }
}

function render() {
  document.documentElement.setAttribute("lang", getLang());
  if (state.screen === "boot") {
    root.innerHTML = `<div class="boot">${t("boot")}</div>`;
    return;
  }
  root.innerHTML = `${topbar()}${body()}${footer()}`;
}

/* ---------------------------------------------------------------- actions */

function resetSession() {
  state.user = null;
  state.profile = null;
  state.data = null;
  state.pool = null;
  state.participants = 0;
  state.loadError = false;
  state.notice = null;
  state.form.url = "";
  state.form.contentKey = "";
  state.form.date = todayISO();
}

async function refreshProfileAndData() {
  if (!state.user) return;
  try {
    const [profile, dashboard] = await Promise.all([loadProfile(state.user.id), loadDashboard()]);
    state.profile = profile;
    state.data = dashboard.data;
    state.pool = dashboard.me;
    state.participants = dashboard.participants;
    state.loadError = false;
  } catch (error) {
    state.loadError = true;
    state.notice = { type: "error", text: t(mapErrorKey(error)) };
  }
}

async function enterApp(user) {
  if (!user) {
    resetSession();
    state.screen = "login";
    state.busy = false;
    render();
    return;
  }
  state.user = user;
  state.screen = "loading";
  render();
  await refreshProfileAndData();
  state.screen = "dashboard";
  state.busy = false;
  render();
}

async function handleAction(action, element) {
  if (action === "lang") {
    setLang(element.dataset.lang);
    render();
    return;
  }
  if (action === "goto-forgot") {
    state.screen = "forgot";
    state.notice = null;
    render();
    return;
  }
  if (action === "goto-login") {
    state.screen = state.user ? "dashboard" : "login";
    state.notice = null;
    render();
    return;
  }
  if (action === "sign-out") {
    state.busy = true;
    render();
    try {
      await signOutUser();
    } catch (_error) {
      /* Session wird lokal trotzdem verworfen */
    }
    resetSession();
    state.busy = false;
    state.screen = "login";
    render();
    return;
  }
  if (action === "refresh") {
    state.busy = true;
    state.notice = null;
    render();
    await refreshProfileAndData();
    state.busy = false;
    render();
  }
}

async function handleLogin(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  state.form.email = email;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    state.notice = { type: "error", text: t("email_invalid") };
    render();
    return;
  }
  if (!password) {
    state.notice = { type: "error", text: t("invalid_credentials") };
    render();
    return;
  }

  state.busy = true;
  state.notice = null;
  render();

  try {
    await signInWithPassword(email, password);
    const session = await getSession();
    await enterApp(session?.user ?? null);
  } catch (error) {
    state.busy = false;
    state.notice = { type: "error", text: t(mapErrorKey(error)) };
    render();
  }
}

async function handleForgot(formData) {
  const email = String(formData.get("email") || "").trim();
  state.form.email = email;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    state.notice = { type: "error", text: t("email_invalid") };
    render();
    return;
  }

  state.busy = true;
  state.notice = null;
  render();

  try {
    await sendResetEmail(email);
    state.notice = { type: "ok", text: t("forgot_sent") };
  } catch (error) {
    state.notice = { type: "error", text: t(mapErrorKey(error)) };
  } finally {
    state.busy = false;
    render();
  }
}

async function handleRecovery(formData) {
  const password = String(formData.get("password") || "");
  const repeat = String(formData.get("password2") || "");

  if (password.length < 8) {
    state.notice = { type: "error", text: t("password_too_short") };
    render();
    return;
  }
  if (password !== repeat) {
    state.notice = { type: "error", text: t("password_mismatch") };
    render();
    return;
  }

  state.busy = true;
  state.notice = null;
  render();

  try {
    await savePassword(password);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    state.notice = { type: "ok", text: t("password_saved") };
    const session = await getSession();
    await enterApp(session?.user ?? state.user);
  } catch (error) {
    state.busy = false;
    state.notice = { type: "error", text: t(mapErrorKey(error)) };
    render();
  }
}

async function handlePost(formData) {
  const platform = String(formData.get("platform") || "tiktok");
  const url = String(formData.get("url") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const contentKey = String(formData.get("contentKey") || "").trim();

  state.form.platform = PLATFORMS.includes(platform) ? platform : "tiktok";
  state.form.url = url;
  state.form.date = date;
  state.form.contentKey = contentKey;

  if (!PLATFORMS.includes(platform)) {
    state.notice = { type: "error", text: t("invalid_platform") };
    render();
    return;
  }
  if (!isSafeUrl(url) || url.length < 12) {
    state.notice = { type: "error", text: t("invalid_url") };
    render();
    return;
  }
  if (date && date > todayISO()) {
    state.notice = { type: "error", text: t("invalid_date") };
    render();
    return;
  }

  state.busy = true;
  state.notice = null;
  render();

  try {
    await submitCreatorPost({
      platform,
      url,
      contentKey,
      publishedAt: date || todayISO(),
    });
    state.notice = { type: "ok", text: t("submit_success") };
    state.form.url = "";
    state.form.contentKey = "";
    await refreshProfileAndData();
  } catch (error) {
    state.notice = { type: "error", text: t(mapErrorKey(error)) };
  } finally {
    state.busy = false;
    render();
  }
}

root.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  event.preventDefault();
  void handleAction(trigger.dataset.action, trigger);
});

root.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const formData = new FormData(form);

  if (form.id === "login-form") void handleLogin(formData);
  else if (form.id === "forgot-form") void handleForgot(formData);
  else if (form.id === "recovery-form") void handleRecovery(formData);
  else if (form.id === "post-form") void handlePost(formData);
});

/* ------------------------------------------------------------------- boot */

function hashInfo() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return { type: null, error: null };
  const params = new URLSearchParams(raw);
  return {
    type: params.get("type"),
    error: params.get("error_description") || params.get("error"),
  };
}

async function boot() {
  setLang(getLang());
  const info = hashInfo();

  if (info.error) {
    state.notice = { type: "error", text: t("generic_error") };
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      state.user = session?.user ?? null;
      state.screen = "recovery";
      state.busy = false;
      render();
      return;
    }
    if (event === "SIGNED_OUT" && state.screen !== "login") {
      resetSession();
      state.busy = false;
      state.screen = "login";
      render();
    }
  });

  let session = null;
  try {
    session = await getSession();
  } catch (_error) {
    session = null;
  }

  if (session && info.type === "recovery") {
    state.user = session.user;
    state.screen = "recovery";
    render();
    return;
  }

  if (session) {
    await enterApp(session.user);
    return;
  }

  state.screen = "login";
  render();
}

void boot();
