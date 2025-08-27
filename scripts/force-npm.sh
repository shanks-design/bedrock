#!/bin/bash

# Force npm usage
echo "🔧 Forcing npm usage..."
export NPM_CONFIG_PACKAGE_MANAGER=npm
export NPM_CONFIG_LEGACY_PEER_DEPS=true
export NPM_CONFIG_FORCE=true
export NPM_CONFIG_PREFER_NPM=true

# Remove any existing lock files and package manager files
echo "🧹 Cleaning up ALL package manager files..."
rm -f pnpm-lock.yaml yarn.lock package-lock.json
rm -rf .pnpm-store .yarn .yarnrc.yml .npmrc

# Don't reinstall - Vercel already did this correctly
echo "📦 Dependencies already installed by Vercel..."

# Build
echo "🏗️ Building with npm..."
npm run build

echo "✅ Build completed with npm!"
