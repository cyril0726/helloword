@echo off

REM ============================================================
REM start.bat
REM Lance l'environnement de développement complet (frontend +
REM backend simultanément, via concurrently — voir package.json
REM racine, script "dev"). Usage quotidien standard.
REM
REM Ne gère pas les migrations D1 : si une nouvelle migration a
REM été ajoutée, lancer init.bat avant celui-ci.
REM ============================================================

cd /d C:\dev\helloword
npm run dev
pause