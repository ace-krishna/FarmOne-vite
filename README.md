# FarmOne

Smart farm management app for livestock owners, built with React, Vite, Tailwind CSS, Supabase, and Capacitor.
Includes 100% offline-capable onnxruntime-web disease diagnosis for Cattle and Poultry and builds as a standalone Android APK.

**Features**
- Register animals (cow, buffalo, goat, hen) with breed, coat colour, date of birth, sex
- Vaccination schedules and reminders per animal, with reschedule and "all caught up" states
- Camera scan screen with instant 100% offline AI disease diagnosis (Cattle & Poultry YOLOv8 ONNX models)
- Multi-language UI: English, Hindi, Marathi
- Packaged as an Android native app (`.apk`) via Capacitor

## Tech stack

| Area | Tool |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS 4, Motion, lucide-react |
| Build | Vite 8 |
| Mobile Runtime | Capacitor 8 (Android) |
| Offline ML Engine | `onnxruntime-web` (WebAssembly, single-thread, zero CDN dependency) |
| Backend / database | Supabase (Postgres + REST) via `@supabase/supabase-js` |

## Build from source

### 1. Prerequisites
- Node.js 20 or newer (tested on 22/24) and npm
- Java 21 & Android SDK (for building the Android APK locally)
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

### 5. Web Development
```bash
npm run dev        # development server at http://localhost:3000
npm run lint       # TypeScript type check
npm run build      # outputs static files to dist/
npm run preview    # serves dist/ locally to verify offline mode
```

### 6. Android Build & Capacitor Sync
To compile the web assets and synchronize them into the Android native project:
```bash
npm run mobile:sync     # builds dist/ and runs npx cap sync android
```

To open Android Studio:
```bash
npm run android:open    # opens android/ in Android Studio
```

To build the debug APK via CLI:
```bash
cd android
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Automated CI/CD (GitHub Actions)
The repository includes [.github/workflows/mobile-build.yml](.github/workflows/mobile-build.yml) which automatically builds the Android Debug APK and attaches `FarmOne-debug-apk` as a downloadable artifact on pushes to `main` or manual trigger (`workflow_dispatch`).

## Project structure

```
android/                       Native Android project (Capacitor)
public/
  models/                      Offline ONNX models (model.onnx, cattle_best.onnx, poultry_best.onnx, metadata.json)
  ort/                         ONNX Runtime WebAssembly binaries (.wasm and .mjs)
scripts/
  copy-ort-wasm.js             Postinstall asset synchronizer for ONNX WASM binaries
  export_onnx.py               Python PyTorch-to-ONNX model export & parity checker
  verify-onnx-parity.mjs       Node-based offline inference verifier
src/
  App.tsx                      app entry, screen switching
  components/
    simulator/ExpoGoShell.tsx  phone frame / Expo Go style shell
    screens/                   Home, Register Animal, Vaccination, Camera Scan, Diagnosis
  context/LanguageContext.tsx  language state
  i18n/translations.ts         English / Hindi / Marathi strings
  lib/                         Supabase client, animal queries, vaccination logic
  services/
    mlInference.ts             Offline ONNX Runtime engine (in-memory caching & canvas preprocessing)
```

## Offline ML Disease Detection
- Models run 100% on-device inside the WebView using `onnxruntime-web` with WebAssembly (`ort-wasm-simd-threaded.wasm`).
- Single-threaded execution (`ort.env.wasm.numThreads = 1`) avoids `SharedArrayBuffer` / COOP-COEP restrictions.
- Zero network requests are made during inference.
