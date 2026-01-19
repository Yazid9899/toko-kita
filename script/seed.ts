import "dotenv/config";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../server/src/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/src/lib/hash";

const seedUsers = async () => {
  const entries = [
    {
      username: "demo",
      email: "demo@example.com",
      password: "password123",
      role: "user" as const
    },
    {
      username: "admin",
      email: "admin@example.com",
      password: "admin12345",
      role: "admin" as const
    }
  ];

  for (const entry of entries) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, entry.email))
      .limit(1);

    if (existing.length) {
      console.log(`Skipping ${entry.email} (already exists)`);
      continue;
    }

    const passwordHash = await hashPassword(entry.password);
    await db.insert(users).values({
      uid: randomUUID(),
      username: entry.username,
      email: entry.email,
      passwordHash,
      role: entry.role
    });

    console.log(`Created ${entry.email} (${entry.role})`);
  }
};

seedUsers()
  .then(async () => {
    await pool.end();
    console.log("Seed complete");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed", err);
    await pool.end();
    process.exit(1);
  });
