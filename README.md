# FarmOne

Smart farm management app for livestock owners, built with React, Vite, Tailwind CSS and Supabase.
The UI is a mobile app shown inside an Expo Go style phone frame in the browser.

**Features**
- Register animals (cow, buffalo, goat, hen) with breed, coat colour, date of birth, sex
- Vaccination schedules and reminders per animal, with reschedule and "all caught up" states
- Camera scan screen for animal health scans
- Multi-language UI: English, Hindi, Marathi

## Tech stack

| Area | Tool |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4, Motion, lucide-react |
| Build | Vite 8 |
| Backend / database | Supabase (Postgres + REST) via `@supabase/supabase-js` |

## Build from source

### 1. Prerequisites
- Node.js 20 or newer (tested on 24) and npm
- A free [Supabase](https://supabase.com) account

### 2. Get the code and install dependencies
```bash
git clone https://github.com/ace-krishna/FarmOne-vite.git
cd FarmOne-vite
npm install
```

### 3. Set up Supabase
1. Create a new project in the Supabase dashboard.
2. Open **SQL Editor -> New query**, paste the contents of [supabase/schema.sql](supabase/schema.sql) and run it. This creates the `animals` table.
3. Do the same with [supabase/vaccinations.sql](supabase/vaccinations.sql). This creates the `vaccinations` table (run `schema.sql` first, because it references `animals`).
4. Open **Project Settings -> API** and copy the **Project URL** and the **anon public** key.

### 4. Configure environment variables
```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR-ANON-PUBLIC-KEY"
```
`.env` is git-ignored. Never commit it, and never use the `service_role` key in this app.
If the variables are missing, the app still starts but cannot read or save data.

### 5. Run
```bash
npm run dev        # development server at http://localhost:3000
```

### 6. Production build
```bash
npm run build      # outputs static files to dist/
npm run preview    # serves dist/ locally to check it
npm run lint       # TypeScript type check
```
`dist/` is a static site and can be hosted on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
Set the two `VITE_SUPABASE_*` variables in the host's build settings, because Vite embeds them at build time.

## Project structure

```
src/
  App.tsx                      app entry, screen switching
  components/
    simulator/ExpoGoShell.tsx  phone frame / Expo Go style shell
    screens/                   Home, Register Animal, Vaccination, Camera Scan
  context/LanguageContext.tsx  language state
  i18n/translations.ts         English / Hindi / Marathi strings
  lib/
    supabase.ts                Supabase client (reads .env)
    animals.ts                 animal queries
    vaccinations.ts            vaccination queries
    vaccinationRecords.ts      vaccination record helpers
    vaccineRules.js            vaccine schedule rules per species
  types/index.ts               shared types
supabase/                      SQL for the database tables
```

## Known limitations / next steps

- **No login yet.** Both tables use a temporary open Row Level Security policy ("temporary open access"), so anyone with the app's anon key can read and write all rows. Before real users, add Supabase Auth and replace the policy with the owner-based one. The ready-to-use replacement is in the comments at the bottom of each SQL file. `animals.owner_id` is already in place for this.
- **Camera access** needs `localhost` or HTTPS. The browser blocks it on plain `http://` over a LAN address.
- The app is a web preview of a mobile UI, not a native Expo build.

## Troubleshooting

- `npm install` fails with a peer dependency error: use Node 20+ and delete `node_modules` and retry.
- Data does not load or save: check `.env` values, restart `npm run dev` after editing it, and confirm both SQL files ran.
