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
2. Create a `.env` file in the root directory and add your database connection string:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/toko_kita
   SESSION_SECRET=your_random_secret_here
   JWT_SECRET=your_jwt_secret_here
   ADMIN_SEED_USERS=admin:admin123,admin2:change_me
   ```

## Step 4: Initializing the Database
Run the following command to set up your database tables:
```bash
npm run db:push
```
Then seed your admin accounts:
```bash
npm run seed:admins
```

## Step 5: Start the Application
Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

## Notes
- This project uses **Drizzle ORM** for database management.
- Login uses a local **username/password** stored in the database with a **JWT** stored in an HTTP-only cookie.
- You can remove `ADMIN_SEED_USERS` from `.env` after seeding.
