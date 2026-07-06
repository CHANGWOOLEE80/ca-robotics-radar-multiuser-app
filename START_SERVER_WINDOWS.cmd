@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Construction Automation ^& Robotics Radar - Server Launcher
echo ============================================================
echo.
echo This file must be used to start the app.
echo Do NOT double-click server.js directly.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not added to PATH.
  echo.
  echo Please install Node.js first, then run this file again.
  echo Recommended: Node.js 18 or later.
  echo.
  pause
  exit /b 1
)

echo [OK] Node.js found:
node -v
echo.

if "%PORT%"=="" set PORT=8080

echo Starting server on port %PORT% ...
echo.
echo Local access:
echo   http://localhost:%PORT%
echo.
echo For other group members, use this PC's IPv4 address.
echo Example:
echo   http://THIS_PC_IP:%PORT%
echo.
echo To find this PC's IP address, open another CMD and run: ipconfig
echo.
echo Press Ctrl+C to stop the server.
echo ============================================================
echo.

node server.js

echo.
echo Server stopped or failed to start.
pause
