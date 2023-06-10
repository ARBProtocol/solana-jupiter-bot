#!/bin/bash

# Get current version from package.json
VERSION=$(node -p "require('./apps/arb-solana-bot/package.json').version")

# Echo the current version to stdout
echo Creating standalone version $VERSION
echo ------------------------------

# Remove existing zip file
rm -f arb-solana-bot-$VERSION.zip

# Go to app directory
cd apps/arb-solana-bot

# Create zip file with current version in the name
zip -r arb-solana-bot-$VERSION.zip src package.json .eslintrc.js tsconfig.json .env.example .gitignore

# Move zip file to root directory
mv arb-solana-bot-$VERSION.zip ../../

# Go back to root directory
cd ../../

# Echo the name of the zip file to stdout and echo file size in kb
echo ------------------------------
echo arb-solana-bot-$VERSION.zip created!

