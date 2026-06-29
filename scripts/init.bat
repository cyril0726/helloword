@echo off

cd /d C:\dev\helloword

echo Running DB migrations (DEV)...

npm run db:dev

echo Done.

pause