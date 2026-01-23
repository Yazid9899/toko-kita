# Toko-Kita Local Setup Guide

To run this project on your local machine, follow these steps.

## Prerequisites
- **Node.js**: Install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/).
- **PostgreSQL**: Install PostgreSQL and ensure it's running.

## Step 1: Clone the Repository
Download the project files to your computer.

## Step 2: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

## Step 3: Database Setup
1. Create a new PostgreSQL database (e.g., `toko_kita`).
2. Create a `.env` file in the root directory and add:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/toko_kita
   SESSION_SECRET=your_random_secret_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

## Step 4: Initializing the Database
Run the following command to set up your database tables:
```bash
npm run db:push
```

## Step 5: Windows Users - Fix npm Scripts
Windows Command Prompt doesn't recognize the `NODE_ENV=...` syntax. You need to modify `package.json` scripts.

Open `package.json` and change the scripts section from:
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  ...
}
```

To:
```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "start": "cross-env NODE_ENV=production node dist/index.cjs",
  ...
}
```

The `cross-env` package is already installed as a dependency.

## Step 6: Start the Application
Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

## Authentication
The app uses simple username/password authentication. 

**Default credentials:**
- Username: `admin`
- Password: `admin123`

To change credentials, update these environment variables in your `.env` file:
- `ADMIN_USERNAME` - Your desired username
- `ADMIN_PASSWORD` - Your desired password

## Notes
- This project uses **Drizzle ORM** for database management.
- Sessions are stored in the PostgreSQL database.
