@echo off

REM ============================================================
REM init.bat
REM Applique les migrations D1 en LOCAL (dev). À lancer après
REM avoir ajouté une nouvelle migration, avant de démarrer le
REM serveur de développement (npm run dev).
REM ============================================================

cd /d C:\dev\helloword

echo Running DB migrations (DEV)...
call npm run db:dev

if errorlevel 1 (
    echo.
    echo [ERREUR] La migration a echoue.
    pause
    exit /b 1
)

echo.
echo Done.
pause