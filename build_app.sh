#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Build the application
echo "Building the application..."
npm run package

if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "The new application is available in the 'dist' folder."
else
  echo "Build failed. Check error logs."
  exit 1
fi
