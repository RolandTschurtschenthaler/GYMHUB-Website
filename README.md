# GymHub Creator Portal (Web)

Eigenständiges, statisches Web-Portal für das Creator-Programm – gedacht für Desktop-Nutzung.
Es nutzt dieselbe Supabase-Instanz und **exakt dieselben RPCs** wie die App
(`creator_my_state`, `creator_submit_post`, `creator_leaderboard`), es gibt also keine zweite
Datenhaltung und keine abweichende Logik.

## Warum kein Build-Schritt?

- Der Ordner ist reines HTML/CSS/JS (ES Modules). `supabase-js` kommt gepinnt über `esm.sh`.
- Auf Cloudflare Pages reicht dadurch ein Upload – es kann kein Build fehlschlagen und die
  Expo/Metro-Toolchain dieses Repos bleibt unberührt.
- Vorteil gegenüber einem Expo-Web-Export: kleiner Bundle, echte Desktop-Spalten, kein
  React-Native-Web-Overhead.

## Dateien

```
creator-portal/
  index.html            Shell der Anwendung
  _headers              Security-Header + Cache-Regeln (Cloudflare Pages)
  assets/config.js      Supabase-URL/Key, Auszahlungs-Schwellen
  assets/i18n.js        Texte (de/en)
  assets/api.js         Supabase-Client + RPC-Wrapper
  assets/app.js         Auth-Flow, Dashboard, Post-Einreichung
  assets/styles.css     Design-Tokens aus src/constants/theme.ts
```

## Funktionen

- Login per E-Mail/Passwort (GymHub-Konto), Passwort-Reset per E-Mail-Link
- Level-Karte: Level, XP-Fortschritt bis zum nächsten Level, Reach-Rang, CPM, Wochen-Streak, Follower
- Auszahlungs-Vorschau: Monats-Views × CPM, Mindestauszahlung, Hinweis bis Level 10
- Post-Pool: eigener Platz, Score, Teilnehmerzahl
- Freischaltungen (Badge, Pro-Jahr, Verdienst-Start, CPM-Bonus, Revenue-Share)
- Post einreichen (Plattform, Link, Datum, Content-ID) inkl. Fehler-Mapping
- Post-Liste mit Views, Status (`IN PRÜFUNG`/`FREIGEGEBEN`/`ABGELEHNT`) und Review-Notiz
- XP-Verlauf

## Deployment auf Cloudflare Pages (`gymhub.pages.dev`)

### Variante A – Git-Integration (empfohlen, auto-deploy bei Push)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Repository wählen, Projektname **`gymhub`** (ergibt `gymhub.pages.dev`).
3. Build-Einstellungen:
   - **Framework preset:** `None`
   - **Root directory:** `creator-portal`
   - **Build command:** *leer lassen*
   - **Build output directory:** `/` (bzw. `.`)
4. Deploy. Danach ist das Portal unter `https://gymhub.pages.dev` erreichbar.

### Variante B – Direkt-Upload per CLI

```bash
npx wrangler pages deploy creator-portal --project-name=gymhub
```

(Beim ersten Aufruf wird das Projekt angelegt und der Login im Browser geöffnet.)

### Lokal Testen

```bash
npx wrangler pages dev creator-portal --port 8788
```

## Pflicht-Einstellung in Supabase (Auth → URL Configuration)

Damit Passwort-Reset-Mails zurück ins Portal führen, müssen die Redirect-URLs eingetragen werden:

- `https://gymhub.pages.dev/**`
- `https://*.gymhub.pages.dev/**` (Preview-Deployments)
- `http://localhost:8788/**` (lokale Entwicklung)

Ohne diesen Eintrag funktionieren Login und Dashboard normal, nur der Reset-Link landet auf der
Site-URL statt im Portal.

## Sicherheit

- Nur der öffentliche Publishable-Key liegt im Client; alle Lesezugriffe laufen über
  `SECURITY DEFINER`-RPCs bzw. RLS-geschützte Tabellen.
- `_headers` setzt CSP (`script-src 'self' https://esm.sh`), `X-Frame-Options: DENY`,
  `Referrer-Policy` und `noindex`.
- Alle dynamischen Werte werden im Render escaped; Post-Links werden auf `http(s)` geprüft.
