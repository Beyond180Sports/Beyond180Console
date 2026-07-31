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

Use **two services** from the same repo. Keep **Root Directory blank**.

### Recommended (matches a working analytics-style SPA deploy)

| Service | Build command | Start command | Env |
|---|---|---|---|
| Homepage | `npm run build:homepage` | *(leave blank)* | `RAILPACK_SPA_OUTPUT_DIR=apps/homepage/dist` |
| Sports Analytics | `npm run build:analytics` | *(leave blank)* | `RAILPACK_SPA_OUTPUT_DIR=apps/sports-analytics/dist` |

Do **not** set `RAILPACK_NO_SPA`. Do **not** set a custom start command. Leave **Target Port** default.

### Alternative (explicit Node static server)

| Service | Build command | Start command | Env |
|---|---|---|---|
| Homepage | `npm run build:homepage` | `npm run start:homepage` | `RAILPACK_NO_SPA=1` |
| Sports Analytics | `npm run build:analytics` | `npm run start:analytics` | `RAILPACK_NO_SPA=1` |

Remove `RAILPACK_SPA_OUTPUT_DIR` when using this mode.

### App env vars (build-time)

**Homepage**
```
EXPO_PUBLIC_SPORTS_ANALYTICS_URL=https://<analytics-domain>
```

**Sports Analytics**
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_HOMEPAGE_URL=https://beyond180sports.beyond180.com
```

### If you see Bad Gateway / container exited

1. Open the failed deploy **Build Logs** and **Deploy Logs** (not just Console).
2. Confirm the homepage service is not using a leftover Start Command like `expo start` or a bad `serve` listen flag.
3. Prefer the **Recommended** SPA settings above (blank start + `RAILPACK_SPA_OUTPUT_DIR`).
4. Ensure Target Port is unset/default.
