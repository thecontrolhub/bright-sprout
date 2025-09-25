#!/bin/bash

# This script is designed to be run in a Unix-like environment (e.g., Git Bash, WSL) on Windows.
# Change to the directory where the script is located
cd "$(dirname "$0")"

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Installing dependencies..."
yarn install

echo "Building the web application..."
# npx expo export typically outputs to a 'dist' directory by default
npx expo export

echo "Deploying to Firebase Hosting..."
# Ensure you are logged into Firebase CLI (firebase login) and have selected the correct project (firebase use --add)
firebase deploy --only hosting

echo "Deployment complete!"
