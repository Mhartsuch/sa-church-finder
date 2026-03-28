#!/bin/bash
# Run this from the sa-church-finder directory on your machine
# Usage: bash scripts/setup-github.sh

set -e

echo "Setting up git repo for SA Church Finder..."

# Remove broken .git if it exists
if [ -f .git ] || [ -d .git ]; then
  rm -rf .git
fi

# Remove old .git backup
if [ -d .git-old ]; then
  rm -rf .git-old
fi

# Initialize fresh repo
git init -b main
git config user.name "Matthew Hartsuch"
git config user.email "mhartsuch@gmail.com"

# Add remote
git remote add origin https://github.com/Mhartsuch/sa-church-finder.git

# Pull the README we created on GitHub
git fetch origin main
git reset --soft origin/main

# Stage all files
git add -A

# Create initial commit with all project files
git commit -m "Add project scaffolding: React + Express + Prisma

Full project setup including:
- React 18 + TypeScript + Vite frontend with Tailwind/shadcn
- Node.js + Express + Prisma backend with PostGIS support
- CI/CD workflows, PR template, and deployment scripts
- Architecture docs, API specs, data models, and feature specs"

# Push to GitHub
git push -u origin main

echo ""
echo "Done! Your repo is live at: https://github.com/Mhartsuch/sa-church-finder"
