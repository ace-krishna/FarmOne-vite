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

To build the debug APK via CLI (Linux/macOS):
```bash
cd android
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Windows Automated Build & Android Deployment

A complete automated build and deployment script is provided at [`build-android.ps1`](build-android.ps1) for Windows users. It automatically detects Node.js, Java JDK (17/21), and Android SDK, configures `local.properties` and environment variables, builds the web assets, compiles the APK with `gradlew.bat`, and can install it directly to an Android phone over USB.

### 1. Prerequisites on Windows
If you haven't installed the prerequisites yet, you can install them in Windows PowerShell (Run as Administrator) via `winget`:
```powershell
# 1. Install Node.js LTS
winget install OpenJS.NodeJS.LTS

# 2. Install Java JDK 21 (Microsoft OpenJDK or Eclipse Temurin)
winget install Microsoft.OpenJDK.21

# 3. Install Android Studio (includes Android SDK, command-line tools, and platform-tools)
winget install Google.AndroidStudio
```
> [!TIP]
> If Android Studio is installed, the Android SDK is automatically located at `%LOCALAPPDATA%\Android\Sdk` and Java JDK is located at `C:\Program Files\Android\Android Studio\jbr`. The script auto-detects these paths without manual configuration.

### 2. Run the Automated Build Script
Open Windows PowerShell in the `FarmOne-vite` directory and run:

```powershell
# Allow script execution for the current session (if restricted)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the automated build
.\build-android.ps1
```
*Or run via npm:*
```powershell
npm run build:apk
```

The script will:
1. Verify Node.js, Java JDK, and Android SDK.
2. Auto-configure `JAVA_HOME`, `ANDROID_HOME`, and `android/local.properties`.
3. Run `npm install` and synchronize ONNX WebAssembly binaries (`public/ort/`).
4. Run `npm run build` and `npx cap sync android`.
5. Compile the Android Debug APK using `gradlew.bat assembleDebug`.
6. Copy the output APK to `./FarmOne-debug.apk` (bundled with offline ONNX models and WASM engines).

### 3. Command Options & Fast Rebuilds

| Command | Purpose |
| :--- | :--- |
| `.\build-android.ps1` | Full build (installs npm dependencies, bundles Vite, compiles APK) |
| `.\build-android.ps1 -Install` | Full build + automatically installs to connected Android phone |
| `.\build-android.ps1 -SkipDeps` | Fast incremental rebuild (skips `npm install`) |
| `.\build-android.ps1 -SkipDeps -Install` | Fast rebuild and instant install on your phone |
| `.\build-android.ps1 -Clean` | Cleans previous build caches (`dist/`, `build/`, `FarmOne-debug.apk`) |
| `.\build-android.ps1 -JdkPath "C:\Path\To\JDK"` | Custom JDK directory override |
| `.\build-android.ps1 -AndroidSdkPath "C:\Path\To\Sdk"` | Custom Android SDK directory override |

---

## Installing the APK on an Android Device from Windows

### Method 1: Automatic 1-Click Install via USB (`adb`)
1. On your Android phone, enable **Developer Options** and **USB Debugging**:
   - Go to **Settings -> About Phone**.
   - Tap **Build Number** 7 times until you see *"You are now a developer!"*.
   - Go back to **Settings -> System -> Developer Options** (or search "Developer options").
   - Enable **USB Debugging**.
2. Connect your phone to your Windows PC with a USB cable.
3. Unlock your phone. If an authorization prompt appears (*"Allow USB debugging?"*), check **Always allow from this computer** and tap **Allow**.
4. In Windows PowerShell, run:
   ```powershell
   .\build-android.ps1 -Install
   ```
   *Or install directly with adb:*
   ```powershell
   adb install -r .\FarmOne-debug.apk
   ```
5. FarmOne will be installed and ready in your phone's app drawer!

### Method 2: Manual USB Cable Transfer
1. Connect your Android phone to your PC via USB cable.
2. On your phone, pull down the notification shade and set USB mode to **File Transfer / MTP**.
3. In Windows File Explorer, open your phone's storage and navigate to the **Downloads** folder.
4. Drag and drop `FarmOne-debug.apk` from the `FarmOne-vite` project folder into your phone's **Downloads** folder.
5. On your phone, open the **Files** / **My Files** app, navigate to **Downloads**, and tap **`FarmOne-debug.apk`**.
6. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and toggle **Allow from this source**.
7. Tap **Install** (or **Update**).

### Method 3: Wireless Local Network Transfer
If you don't have a USB cable handy:
1. In Windows PowerShell inside the project directory, run:
   ```powershell
   npx serve -p 8080 .
   ```
2. On your Android phone (connected to the same Wi-Fi), open Chrome and navigate to `http://<YOUR_PC_IP>:8080/FarmOne-debug.apk`.
3. Download the file and tap **Open -> Install**.

---

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
