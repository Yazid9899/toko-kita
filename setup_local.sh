#!/bin/bash

# Toko-Kita Local Setup Script

echo "Starting local setup for Toko-Kita..."

# 1. Install dependencies
echo "Installing dependencies..."
npm install

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "Creating .env template..."
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/toko_kita" > .env
    echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
    echo ".env file created. Please update DATABASE_URL with your local PostgreSQL credentials."
fi

# 3. Reminder for database
echo ""
echo "Setup complete!"
echo "Next steps:"
echo "1. Ensure PostgreSQL is running and you have created a database named 'toko_kita'."
echo "2. Update the DATABASE_URL in your .env file."
echo "3. Run 'npm run db:push' to initialize the database."
echo "4. Run 'npm run dev' to start the application."
