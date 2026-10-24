# Moasis · مؤسس

A bilingual founder practice studio for Oman. Founders write a business plan, spend practice capital from a wallet, forecast their first year, make CEO decisions in realistic scenarios, and learn the fundamentals. Practice balances are simulated; nothing here is real money or financial advice.

This is the 2026 rebuild. It merges the two earlier apps (the fuller "v2" app and the liquid-glass concept) into one product and keeps every v2 feature.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET to a long random string
npm run dev                  # http://localhost:3000
```

Accounts and workspaces are stored in Postgres when `DATABASE_URL` is set (Supabase, Neon or any hosted Postgres; on Vercel use the pooled connection string). Without it, a SQLite file is created at `./data/moasis.db` (override with `DATABASE_PATH`); on Vercel that file lives in /tmp and resets, so set `DATABASE_URL` for real accounts. Auth and workspace tables are created on first boot by `src/instrumentation.ts`; the first boot logs a harmless "schema mismatch" line while it does so.

Password reset emails go through [Resend](https://resend.com) when `RESEND_API_KEY` and `EMAIL_FROM` are set. Without them the link is printed to the server log in development, and the reset page says email isn't set up.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm test` | Unit tests (money, forecast, wallet, migration) |
| `npm run test:e2e` | Playwright journeys. Set `CHROMIUM_PATH` to use a preinstalled Chromium |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 (utilities only; the design system is plain CSS tokens) · motion · Radix primitives · Phosphor icons · zod · better-auth (email and password) · better-sqlite3 · Vitest · Playwright.

## How it fits together

```
src/
  app/
    welcome/              public landing page
    (auth)/               sign-in, sign-up
    (workspace)/          the app: Today, plan, wallet, forecast, practice, learn, consultant, settings, setup
    api/auth/[...all]     better-auth handler
    api/workspace         GET/PUT the signed-in user's workspace (optimistic revisions, 409 on conflict)
  content/                sectors, plan sections, lessons, scenarios, places (bilingual)
  domain/                 pure logic: state schema, forecast, wallet actions, progress, migration
  state/workspace.tsx     one provider for guest (localStorage) and account (server) persistence
  components/             ui primitives, shell, wallet card stack, charts, welcome page
  styles/                 tokens.css, base.css, components.css, pages.css, welcome.css
  server/                 database (Postgres or SQLite), auth and email
```

**Money** is stored as integer baisa (1 rial = 1,000 baisa), so sums are exact. It is converted only at input (`parseRials`, which accepts Arabic digits) and display (`<Money>`, which draws the Central Bank of Oman rial sign).

**Persistence.** Guests are saved to `localStorage` under `moasis-workspace`. On first sign-in the guest workspace is imported into the account. Account saves are debounced and use a revision number, so two tabs can't silently overwrite each other; a conflict shows a banner offering to reload.

**Auth** is better-auth with email and password, httpOnly cookies, and rate limits on the credential endpoints. Nothing trusts identity headers sent by a browser, and the workspace API checks the request origin on writes.

**Language.** The `moasis-lang` cookie is read on the server so `<html lang dir>` is correct on first paint. Every string is written in both English and Arabic next to each other (`t("…", "…")`); there is no machine translation.

## Design system

Four brand anchors (graphite `#202429`, slate `#7c8792`, silver `#c9d0d6`, ice `#f1f4f6`) generate every tonal ramp in `tokens.css`. Surfaces come in four material layers, each with a single purpose:

1. **Environment**: the canvas behind everything.
2. **Content** (`.panel`): matte reading planes.
3. **Chrome** (`.glass`): translucent navigation that floats over content.
4. **Overlay**: sheets, menus and the command palette.

Light and dark values are tuned separately rather than inverted. Translucency falls back to solid surfaces under `prefers-reduced-transparency`. Semantic colours (moss for positive, amber for caution, clay for danger) are muted and are always paired with text or an icon.

Type uses the system stacks (SF Pro, SF Arabic) on a 12/13/15/17/20/24/32 scale. Touch targets are at least 44px.

## Motion

There is one motion vocabulary, defined in `tokens.css` (`--ease-out`, `--ease-spring`, `--dur-*`) and in the motion defaults in `providers.tsx`:

- **Arrive**: each page rises 14px and pulls into focus (`(workspace)/template.tsx`). Grids stagger in by 45ms per item.
- **Respond**: controls scale to 0.97 on press. Cards pick up a soft light that follows the cursor.
- **Settle**: balances count to their new value, progress rings and bars fill on mount, and the wallet cards move on springs.
- **Tell a story**: the landing page draws the Origin mark, reveals the headline word by word, fans the wallet cards as you scroll, and runs a pinned four-step story.

Everything collapses to instant changes under `prefers-reduced-motion`. Nothing loops except the loading mark and the landing card's sheen.

## Migrating from the earlier apps

`domain/migrate.ts` reads all three shapes: the v3 rebuild, the v2 app (rials converted to baisa), and the concept app (its single balance becomes a capital entry). Guests are migrated automatically from the legacy keys `moasis-liquid-v1` and `moasis-practice-v1`. Backups downloaded from either earlier app can be restored in Settings.

## Not done yet

- Deployment. Don't deploy into the old live site without the owner's authorisation.
- Password reset and email verification (needs an email provider).
- Shared, multi-person consulting.
