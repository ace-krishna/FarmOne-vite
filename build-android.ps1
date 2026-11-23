#requires -Version 5.1
<#
.SYNOPSIS
    Automated Windows PowerShell script to install dependencies, build, and deploy the FarmOne Android APK.

.DESCRIPTION
    This script automates the complete Android build pipeline on Windows:
    1. Verifies and detects Node.js, npm, Java JDK (17 or 21), and Android SDK.
    2. Auto-configures JAVA_HOME and ANDROID_HOME environment variables.
    3. Synchronizes android/local.properties with the Windows Android SDK path.
    4. Runs 'npm install' to fetch dependencies and sync ONNX Runtime WebAssembly assets.
    5. Runs 'npm run build' to bundle Vite production assets with offline ONNX models.
    6. Runs 'npx cap sync android' to update native Capacitor Android assets.
    7. Runs 'gradlew.bat assembleDebug' to compile the Android debug APK.
    8. Copies the output APK to './FarmOne-debug.apk'.
    9. Optionally installs the APK directly to a connected Android device via ADB (-Install).

.PARAMETER Install
    Automatically installs the generated APK to an attached Android device via ADB.

.PARAMETER SkipDeps
    Skips 'npm install' for faster incremental builds when dependencies haven't changed.

.PARAMETER Clean
    Cleans previous build output ('dist', 'android/app/build', and 'FarmOne-debug.apk').

.PARAMETER JdkPath
    Custom path to Java JDK directory (e.g. C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot).

.PARAMETER AndroidSdkPath
    Custom path to Android SDK directory (e.g. C:\Users\<Username>\AppData\Local\Android\Sdk).

.PARAMETER Help
    Displays usage instructions and command flags.

.EXAMPLE
    # Standard automated build
    .\build-android.ps1

.EXAMPLE
    # Build and automatically install to a connected phone
    .\build-android.ps1 -Install

.EXAMPLE
    # Quick incremental build (skips npm install)
    .\build-android.ps1 -SkipDeps
#>

[CmdletBinding()]
param(
    [switch]$Install,
    [switch]$SkipDeps,
    [switch]$Clean,
    [string]$JdkPath = "",
    [string]$AndroidSdkPath = "",
    [switch]$Help
)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host @"
========================================================================
 FarmOne Android APK Automated Build Script (Windows PowerShell)
========================================================================

Usage:
    .\build-android.ps1 [-Install] [-SkipDeps] [-Clean] [-JdkPath <path>] [-AndroidSdkPath <path>]

Flags:
    -Install          Automatically installs the APK to an ADB-connected Android device.
    -SkipDeps         Skips 'npm install' to speed up subsequent rebuilds.
    -Clean            Cleans 'dist', Android build cache, and existing FarmOne-debug.apk.
    -JdkPath          Overrides path to Java JDK directory.
    -AndroidSdkPath   Overrides path to Android SDK directory.
    -Help             Shows this help manual.

Examples:
    .\build-android.ps1
    .\build-android.ps1 -Install
    .\build-android.ps1 -SkipDeps -Install
========================================================================
"@
    exit 0
}

# ----------------------------------------------------------------------
# Helper Functions
# ----------------------------------------------------------------------
function Write-Step {
    param([string]$Message)
    Write-Host "`n>>> [STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "    [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "    [WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "`n[ERROR] $Message" -ForegroundColor Red
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host @"
========================================================================
   ____                      ___             
  / __/__ _________  ___    / _ \___  ___    
 / _// _ `/ __/ _ \/ _ \  / // / _ \/ -_)   
/_/  \_,_/_/  /_//_/\___/  \___/_//_/\__/    
========================================================================
 FarmOne Android APK Automated Pipeline (Windows)
========================================================================
"@ -ForegroundColor Green

# ----------------------------------------------------------------------
# 1. Clean (if -Clean specified)
# ----------------------------------------------------------------------
if ($Clean) {
    Write-Step "Cleaning previous build artifacts..."
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "    Removed 'dist/'" -ForegroundColor DarkGray
    }
    if (Test-Path "android\app\build") {
        Remove-Item -Recurse -Force "android\app\build"
        Write-Host "    Removed 'android\app\build/'" -ForegroundColor DarkGray
    }
    if (Test-Path "FarmOne-debug.apk") {
        Remove-Item -Force "FarmOne-debug.apk"
        Write-Host "    Removed 'FarmOne-debug.apk'" -ForegroundColor DarkGray
    }
    Write-Success "Clean completed."
}

# ----------------------------------------------------------------------
# 2. Check Node.js and npm
# ----------------------------------------------------------------------
Write-Step "Checking Node.js & npm..."
try {
    $nodeVer = (node -v) 2>$null
    $npmVer = (npm -v) 2>$null
    if (-not $nodeVer -or -not $npmVer) {
        throw "Node.js or npm not detected in PATH."
    }
    Write-Success "Found Node.js $nodeVer and npm $npmVer"
} catch {
    Write-Err "Node.js and npm are required to build FarmOne."
    Write-Host "Install Node.js (LTS) via winget by running:" -ForegroundColor Yellow
    Write-Host "    winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host "or download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# ----------------------------------------------------------------------
# 3. Check and Configure Java JDK (JDK 17 or 21)
# ----------------------------------------------------------------------
Write-Step "Checking Java Development Kit (JDK 17 or 21)..."

$DetectedJava = $null

if ($JdkPath -and (Test-Path $JdkPath)) {
    $DetectedJava = $JdkPath
} elseif ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))) {
    $DetectedJava = $env:JAVA_HOME
} else {
    # Scan common installation paths on Windows
    $CommonJavaPatterns = @(
        "C:\Program Files\Eclipse Adoptium\jdk-21*",
        "C:\Program Files\Microsoft\jdk-21*",
        "C:\Program Files\Java\jdk-21*",
        "C:\Program Files\Android\Android Studio\jbr",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Microsoft\jdk-17*",
        "C:\Program Files\Java\jdk-17*"
    )
    foreach ($pattern in $CommonJavaPatterns) {
        $found = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found -and (Test-Path (Join-Path $found.FullName "bin\javac.exe"))) {
            $DetectedJava = $found.FullName
            break
        }
    }
}

if (-not $DetectedJava) {
    # Check if javac is available directly in PATH
    $javacCmd = Get-Command javac -ErrorAction SilentlyContinue
    if ($javacCmd) {
        $DetectedJava = Split-Path -Parent (Split-Path -Parent $javacCmd.Source)
    }
}

if ($DetectedJava -and (Test-Path $DetectedJava)) {
    $env:JAVA_HOME = $DetectedJava
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    Write-Success "Configured JAVA_HOME: $env:JAVA_HOME"
    $javaVerStr = (& java -version 2>&1 | Select-Object -First 1)
    Write-Host "    Java version: $javaVerStr" -ForegroundColor DarkGray
} else {
    Write-Err "Java Development Kit (JDK 17 or 21) was not found."
    Write-Host "Please install Java JDK 21 using winget:" -ForegroundColor Yellow
    Write-Host "    winget install Microsoft.OpenJDK.21" -ForegroundColor White
    Write-Host "Or install Eclipse Temurin 21:" -ForegroundColor Yellow
    Write-Host "    winget install EclipseAdoptium.Temurin.21.JDK" -ForegroundColor White
    Write-Host "If Android Studio is already installed, set JAVA_HOME to:" -ForegroundColor Yellow
    Write-Host "    C:\Program Files\Android\Android Studio\jbr" -ForegroundColor White
    exit 1
}

# ----------------------------------------------------------------------
# 4. Check and Configure Android SDK
# ----------------------------------------------------------------------
Write-Step "Checking Android SDK..."

$DetectedSdk = $null

if ($AndroidSdkPath -and (Test-Path $AndroidSdkPath)) {
    $DetectedSdk = $AndroidSdkPath
} elseif ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $DetectedSdk = $env:ANDROID_HOME
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    $DetectedSdk = $env:ANDROID_SDK_ROOT
} else {
    $CommonSdkPaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "C:\Android\Sdk",
        "$env:ProgramFiles(x86)\Android\android-sdk"
    )
    foreach ($candidate in $CommonSdkPaths) {
        if ($candidate -and (Test-Path $candidate)) {
            $DetectedSdk = $candidate
            break
        }
    }
}

if ($DetectedSdk -and (Test-Path $DetectedSdk)) {
    $env:ANDROID_HOME = $DetectedSdk
    $env:ANDROID_SDK_ROOT = $DetectedSdk
    $env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"
    Write-Success "Configured ANDROID_HOME: $env:ANDROID_HOME"

    # Synchronize android/local.properties with Windows path (forward-slash formatted for Gradle compatibility)
    $localPropFile = Join-Path $ScriptDir "android\local.properties"
    $sdkDirFormatted = $DetectedSdk.Replace('\', '/')
    "sdk.dir=$sdkDirFormatted" | Out-File -FilePath $localPropFile -Encoding ascii -Force
    Write-Success "Synchronized android\local.properties (sdk.dir=$sdkDirFormatted)"
} else {
    Write-Err "Android SDK directory was not found."
    Write-Host "Please install Android Studio to automatically set up the Android SDK:" -ForegroundColor Yellow
    Write-Host "    winget install Google.AndroidStudio" -ForegroundColor White
    Write-Host "Default Windows path is usually: $env:LOCALAPPDATA\Android\Sdk" -ForegroundColor Yellow
    exit 1
}

# ----------------------------------------------------------------------
# 5. NPM Dependencies
# ----------------------------------------------------------------------
if (-not $SkipDeps) {
    Write-Step "Installing NPM dependencies & copying WASM binaries..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Err "npm install failed with exit code $LASTEXITCODE."
        exit $LASTEXITCODE
    }
    Write-Success "Dependencies installed and WASM assets synchronized."
} else {
    Write-Host "`n>>> [STEP] Skipping dependency installation (-SkipDeps passed)." -ForegroundColor DarkGray
}

# ----------------------------------------------------------------------
# 6. Build Web Assets & Sync Capacitor
# ----------------------------------------------------------------------
Write-Step "Building Vite application (production bundle + offline ONNX)..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Err "Vite production build ('npm run build') failed."
    exit $LASTEXITCODE
}
Write-Success "Vite build succeeded ('dist/' generated)."

Write-Step "Syncing web assets to Capacitor Android project..."
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Err "Capacitor synchronization ('npx cap sync android') failed."
    exit $LASTEXITCODE
}
Write-Success "Assets synced to 'android/app/src/main/assets/public'."

# ----------------------------------------------------------------------
# 7. Compile APK using Gradle (gradlew.bat)
# ----------------------------------------------------------------------
Write-Step "Compiling Android Debug APK with Gradle (gradlew.bat assembleDebug)..."
Push-Location "android"
try {
    if (-not (Test-Path ".\gradlew.bat")) {
        throw "Could not locate 'gradlew.bat' in the 'android' folder."
    }
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle compilation failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
Write-Success "Gradle assembleDebug completed successfully!"

# ----------------------------------------------------------------------
# 8. Copy and Verify Output APK
# ----------------------------------------------------------------------
$sourceApk = Join-Path $ScriptDir "android\app\build\outputs\apk\debug\app-debug.apk"
$destApk = Join-Path $ScriptDir "FarmOne-debug.apk"

if (Test-Path $sourceApk) {
    Copy-Item -Path $sourceApk -Destination $destApk -Force
    $apkSizeMB = [Math]::Round(((Get-Item $destApk).Length / 1MB), 2)
    Write-Host "`n" + ("=" * 72) -ForegroundColor Green
    Write-Host " BUILD COMPLETE: FarmOne Android APK Generated Successfully!" -ForegroundColor Green
    Write-Host ("=" * 72) -ForegroundColor Green
    Write-Host " Output File: $destApk" -ForegroundColor White
    Write-Host " File Size:   $apkSizeMB MB (Offline models & WASM engines bundled)" -ForegroundColor White
    Write-Host ("=" * 72) -ForegroundColor Green
} else {
    Write-Err "Could not find compiled APK at: $sourceApk"
    exit 1
}

# ----------------------------------------------------------------------
# 9. ADB Device Check & Automated Installation
# ----------------------------------------------------------------------
$adbCmd = Get-Command adb -ErrorAction SilentlyContinue
if ($adbCmd) {
    $devices = & adb devices | Where-Object { $_ -match "\bdevice\b" -and $_ -notmatch "List of devices" }
    
    if ($devices) {
        Write-Host "`n[ADB] Detected connected Android device(s):" -ForegroundColor Cyan
        $devices | ForEach-Object { Write-Host "    $_" -ForegroundColor White }

        $shouldInstall = $Install
        if (-not $shouldInstall) {
            $response = Read-Host "`nDo you want to install FarmOne-debug.apk onto your connected phone now? (Y/N)"
            if ($response -match "^[Yy]") {
                $shouldInstall = $true
            }
        }

        if ($shouldInstall) {
            Write-Step "Installing FarmOne-debug.apk via ADB..."
            & adb install -r $destApk
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n" + ("*" * 72) -ForegroundColor Green
                Write-Host " SUCCESS: FarmOne has been installed onto your phone!" -ForegroundColor Green
                Write-Host " You can now open FarmOne from your phone's app drawer." -ForegroundColor Green
                Write-Host ("*" * 72) -ForegroundColor Green
            } else {
                Write-Warn "ADB install exited with code $LASTEXITCODE. Verify your device is unlocked and authorized."
            }
        }
    } else {
        if ($Install) {
            Write-Warn "The -Install flag was passed, but no authorized Android device was found by ADB."
            Write-Host "Ensure USB debugging is turned ON and run:" -ForegroundColor Yellow
            Write-Host "    adb install -r .\FarmOne-debug.apk" -ForegroundColor White
        } else {
            Write-Host "`n[TIP] To install on your phone:" -ForegroundColor Cyan
            Write-Host "  1. Connect your phone via USB with USB Debugging enabled and run: adb install -r .\FarmOne-debug.apk" -ForegroundColor White
            Write-Host "  2. Or transfer 'FarmOne-debug.apk' to your phone and open it from your Files / Downloads app." -ForegroundColor White
        }
    }
} else {
    Write-Host "`n[TIP] 'adb' was not found in PATH." -ForegroundColor DarkGray
    Write-Host "Transfer 'FarmOne-debug.apk' to your phone via USB cable or Google Drive, then tap to install." -ForegroundColor White
}
