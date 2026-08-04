# Beyond180

Monorepo for Beyond180 Sports web apps (Expo + React Native / TypeScript).

## Structure

```
apps/
  console/            # Beyond180 Console (homepage + sports analytics)
packages/
  shared/             # Shared Supabase client, types, and data helpers
```

## Get started

From the repo root:

```bash
npm install
```

Run the console (`http://localhost:8081`):

```bash
npm run console
```

## Environment

The console reads `.env` from `apps/console/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Production builds

```bash
npm run build:console
```

Exports static web output to `apps/console/dist/`.

## Railway

Use **one service** from this repo. Keep **Root Directory blank**.

### Recommended (SPA deploy)

| Service | Build command | Start command | Env |
|---|---|---|---|
| Console | `npm run build:console` | *(leave blank)* | `RAILPACK_SPA_OUTPUT_DIR=apps/console/dist` |

Do **not** set `RAILPACK_NO_SPA`. Do **not** set a custom start command. Leave **Target Port** default.

### Alternative (explicit Node static server)

| Service | Build command | Start command | Env |
|---|---|---|---|
| Console | `npm run build:console` | `npm run start:console` | `RAILPACK_NO_SPA=1` |

Remove `RAILPACK_SPA_OUTPUT_DIR` when using this mode.

### App env vars (build-time)

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### If you see Bad Gateway / container exited

1. Open the failed deploy **Build Logs** and **Deploy Logs** (not just Console).
2. Confirm the service is not using a leftover Start Command like `expo start` or a bad `serve` listen flag.
3. Prefer the **Recommended** SPA settings above (blank start + `RAILPACK_SPA_OUTPUT_DIR`).
4. Ensure Target Port is unset/default.
