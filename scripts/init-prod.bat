@echo off

REM ============================================================
REM init-prod.bat
REM Applique les migrations D1 en PROD (remote) puis déploie le
REM Worker Cloudflare. À utiliser manuellement quand une nouvelle
REM migration a été ajoutée et doit être poussée en production.
REM
REM Le déploiement du code seul (sans nouvelle migration) reste
REM automatique via Cloudflare (push Git) — ce script ne sert que
REM pour le cas où une migration doit être appliquée en remote
REM avant/avec le déploiement.
REM ============================================================

cd /d C:\dev\helloword\backend

echo Applying DB migrations (PROD)...
call npm run db:prod

if errorlevel 1 (
    echo.
    echo [ERREUR] La migration a echoue. Deploiement annule.
    pause
    exit /b 1
)

echo.
echo Migrations OK. Deploying to Cloudflare...
call npm run deploy

if errorlevel 1 (
    echo.
    echo [ERREUR] Le deploiement a echoue.
    pause
    exit /b 1
)

echo.
echo Done.
pause