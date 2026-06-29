@echo off

echo Starting frontend...
start cmd /k "cd /d C:\dev\helloword\frontend && npm run dev"

echo Starting backend...
start cmd /k "cd /d C:\dev\helloword\backend && npx wrangler dev"

pause