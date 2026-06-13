@echo off
title Codex Platform Starter
echo ==========================================
echo       CODEX PLATFORM BOOTSTRAPPER
echo ==========================================
echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "Codex Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Starting Frontend Vite Server...
start "Codex Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo  Codex is booting! 
echo  - Backend log is in "Codex Backend" window
echo  - Frontend log is in "Codex Frontend" window
echo  
echo  Press any key to close this launcher...
echo ==========================================
pause > nul
