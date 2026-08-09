@echo off
title Oxalis Travel - Gestion Agence
cd /d "%~dp0"

echo ============================================
echo    OXALIS TRAVEL - DEMARRAGE DU LOGICIEL
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n est pas installe sur ce PC.
  echo Telechargez-le sur https://nodejs.org puis relancez ce fichier.
  pause
  exit /b
)

if not exist .env (
  copy .env.example .env >nul
  echo Fichier .env cree.
  echo Si votre mot de passe PostgreSQL n est pas "postgres",
  echo ouvrez le fichier .env et corrigez la ligne PGPASSWORD.
  echo.
  pause
)

if not exist node_modules (
  echo Installation des composants ... patientez.
  call npm install --silent
)

echo.
echo Preparation de la base de donnees ...
call node src/preparer.js
if errorlevel 1 goto erreur

call node src/migrate.js
if errorlevel 1 goto erreur

echo.
echo Ouverture du logiciel dans votre navigateur ...
start "" http://localhost:3000
call npm start
goto fin

:erreur
echo.
echo ---- Un probleme est survenu (voir le message ci-dessus) ----
pause

:fin
pause
