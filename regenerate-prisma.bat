@echo off
echo Cleaning up Prisma...
rmdir /s /q node_modules\.prisma
del /f /q node_modules\@prisma\client
echo Running Prisma generate...
npx prisma generate
echo Done!
pause
