#!/bin/bash

echo "Setting up Llama 3 Chat Application..."

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Make sure your Llama 3 API server is running on port 3000"
echo "2. Run: npm start"
echo "3. Open http://localhost:3001 in your browser" 