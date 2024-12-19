# Stop any running Node processes
taskkill /F /IM node.exe

# Remove Prisma directories and files
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\@prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Clean npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Reinstall dependencies
npm install

# Generate Prisma Client
npx prisma generate 