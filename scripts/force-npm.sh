#!/bin/bash

# Force npm usage
echo "🔧 Forcing npm usage..."
export NPM_CONFIG_PACKAGE_MANAGER=npm
export NPM_CONFIG_LEGACY_PEER_DEPS=true
export NPM_CONFIG_FORCE=true

# Remove any existing lock files
echo "🧹 Cleaning up lock files..."
rm -f pnpm-lock.yaml yarn.lock

# Install with npm
echo "📦 Installing dependencies with npm..."
npm install --legacy-peer-deps --force

# Build
echo "🏗️ Building with npm..."
npm run build

echo "✅ Build completed with npm!"
