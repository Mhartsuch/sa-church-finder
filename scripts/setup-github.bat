@echo off
REM Run this from the sa-church-finder directory on your machine
REM Usage: cd to sa-church-finder folder, then run: scripts\setup-github.bat

echo Setting up git repo for SA Church Finder...

REM Remove broken .git if it exists
if exist .git (rmdir /s /q .git)
if exist .git-old (rmdir /s /q .git-old)

REM Initialize fresh repo
git init -b main
git config user.name "Matthew Hartsuch"
git config user.email "mhartsuch@gmail.com"

REM Add remote
git remote add origin https://github.com/Mhartsuch/sa-church-finder.git

REM Pull the README we created on GitHub
git fetch origin main
git reset --soft origin/main

REM Stage all files
git add -A

REM Create initial commit with all project files
git commit -m "Add project scaffolding: React + Express + Prisma"

REM Push to GitHub
git push -u origin main

echo.
echo Done! Your repo is live at: https://github.com/Mhartsuch/sa-church-finder
pause
