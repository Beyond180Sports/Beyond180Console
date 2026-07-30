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

| Service | Root directory | Build command | Static output / `SPA_OUTPUT_DIR` | Start |
|---|---|---|---|---|
| Homepage | `/` (blank) | `npm run build:homepage` | `apps/homepage/dist` | leave blank |
| Sports Analytics | `/` (blank) | `npm run build:analytics` | `apps/sports-analytics/dist` | leave blank |

Set `EXPO_PUBLIC_*` env vars on each service (including cross-app URLs). Expo inlines `EXPO_PUBLIC_*` at **build** time.
