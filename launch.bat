@echo off
setlocal
cd /d "%~dp0"

set "TARGET=apps\desktop\src-tauri\target"
if defined CARGO_TARGET_DIR set "TARGET=%CARGO_TARGET_DIR%"
set "EXE=%TARGET%\release\angkorgit.exe"

if /i "%~1"=="rebuild" goto build
if exist "%EXE%" goto launch

:build
echo AngKorGit is not built yet. Building it now, this can take several minutes...
echo.

where cargo >nul 2>nul
if errorlevel 1 (
  echo Rust is not installed. Install it from https://rustup.rs and run this again.
  goto fail
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20+ is not installed. Install it from https://nodejs.org and run this again.
  goto fail
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm not found, installing it with npm...
  call npm install -g pnpm@10.32.1 || goto fail
)

if not exist "node_modules" (
  call pnpm install || goto fail
)

call pnpm tauri:build --no-bundle || goto fail

if not exist "%EXE%" (
  echo Build finished but %EXE% was not found.
  goto fail
)

:launch
start "" "%EXE%"
exit /b 0

:fail
echo.
echo Launch failed.
pause
exit /b 1
