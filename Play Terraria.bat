@echo off
rem Double-click to play: serves this folder on http://localhost:8765 and opens your browser.
rem Keep this window open while you play; closing it stops the server.
title Terraria (local server)
cd /d "%~dp0"
set PORT=8765

set PY=
where python >nul 2>&1 && set PY=python
if not defined PY (where py >nul 2>&1 && set PY=py)
if not defined PY (
  echo Python was not found on your PATH.
  echo Install it from https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^), then run this again.
  pause
  exit /b 1
)

rem already serving on this port? just open the game
netstat -ano | findstr /r /c:"LISTENING" | findstr /c:":%PORT% " >nul 2>&1
if not errorlevel 1 (
  echo A server is already running on port %PORT%; opening the game.
  start "" "http://localhost:%PORT%/"
  exit /b 0
)

echo Serving "%CD%" on http://localhost:%PORT%/
echo Close this window when you are done playing.
start "" "http://localhost:%PORT%/"
%PY% -m http.server %PORT% --bind 127.0.0.1
