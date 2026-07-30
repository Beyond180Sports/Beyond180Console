# Beyond180

Monorepo for Beyond180 Sports web apps (Expo + React Native / TypeScript).

## Structure

```
apps/
  homepage/           # Beyond180 Sports landing page
  sports-analytics/   # Sports analytics app
packages/
  shared/             # Shared Supabase client, types, and data helpers
```

## Get started

From the repo root:

```bash
npm install
```

Run the homepage (`http://localhost:8081`):

```bash
npm run homepage
```

Run sports analytics (`http://localhost:8082`):

```bash
npm run analytics
```

## Environment

Each app reads `.env` from its own directory (`apps/homepage/.env`, `apps/sports-analytics/.env`).

Sports analytics needs:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_HOMEPAGE_URL=http://localhost:8081
```

Homepage (optional, for the Sports Analytics panel link):

```
EXPO_PUBLIC_SPORTS_ANALYTICS_URL=http://localhost:8082
```

## Production builds

```bash
npm run build:homepage
npm run build:analytics
```

Each app exports static web output to its own `dist/` folder.

## Railway

Use **two services** from the same repo. Keep the service root at the **repo root** so npm workspaces can resolve `@beyond180/shared`.

Use an explicit build + `serve` start (more reliable than Railpack SPA auto-detect for this monorepo):

| Service | Root directory | Build command | Start command |
|---|---|---|---|
| Homepage | `/` (blank) | `npm run build:homepage` | `npm run start:homepage` |
| Sports Analytics | `/` (blank) | `npm run build:analytics` | `npm run start:analytics` |

Also on each service:

- Remove `RAILPACK_SPA_OUTPUT_DIR` if you set it earlier (custom start replaces Caddy SPA mode)
- Set `RAILPACK_NO_SPA=1` so Railpack does not try to treat the workspace as a Caddy static app
- Leave **Target Port** blank / default (do not hardcode `8081` / `8082`)

App env vars (inlined at **build** time):

**Homepage**
```
EXPO_PUBLIC_SPORTS_ANALYTICS_URL=https://<analytics-domain>
RAILPACK_NO_SPA=1
```

**Sports Analytics**
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_HOMEPAGE_URL=https://beyond180sports.beyond180.com
RAILPACK_NO_SPA=1
```

Redeploy after changing any of these. If you still get a **502**, check the homepage service Settings → Networking: a leftover custom target port (e.g. `8081`) is a common cause.
