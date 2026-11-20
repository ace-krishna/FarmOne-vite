# FarmOne

Smart farm management app built with React, Vite, Tailwind CSS and Supabase.
Features animal registration, vaccination schedules, camera scan, and
English / Hindi / Marathi support, shown in an Expo Go style device preview.

## Run locally

Prerequisites: Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key
3. Create the database tables by running `supabase/schema.sql` and `supabase/vaccinations.sql` in the Supabase SQL editor
4. Start the app: `npm run dev` (http://localhost:3000)

## Scripts

- `npm run build` – production build
- `npm run lint` – type check
