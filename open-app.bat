@echo off
title OmniBuild OS - 24-Pillar Flagship Showroom Cockpit
cd /d "%~dp0"
echo ====================================================================
echo   OmniBuild OS (SHREE VINAYAKA Godrej Interio Rayagada Flagship)
echo   24-Pillar Sovereign Enterprise Operating Cockpit
echo ====================================================================
echo.
echo Opening in default browser: http://localhost:5173
start http://localhost:5173
echo.
npm run dev -- --host 0.0.0.0 --port 5173
pause
