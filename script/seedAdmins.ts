import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { adminUsers } from "../shared/schema";
import { hashPassword } from "../server/auth/passwords";

type SeedEntry = {
  username: string;
  password: string;
};

function parseSeedUsers(value: string): SeedEntry[] {
  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, ...rest] = entry.split(":");
      const password = rest.join(":");

      if (!username || !password) {
        throw new Error(
          `Invalid ADMIN_SEED_USERS entry "${entry}". Expected format "username:password".`
        );
      }

      return { username, password };
    });

  if (entries.length === 0) {
    throw new Error("ADMIN_SEED_USERS did not contain any valid entries.");
  }

  return entries;
}

async function seedAdmins() {
  const seedUsers = process.env.ADMIN_SEED_USERS;
  if (!seedUsers) {
    throw new Error(
      "ADMIN_SEED_USERS is not set. Example: admin:password,admin2:password2"
    );
  }

  const entries = parseSeedUsers(seedUsers);

  for (const entry of entries) {
    const passwordHash = await hashPassword(entry.password);

    await db
      .insert(adminUsers)
      .values({
        username: entry.username,
        passwordHash,
        role: "admin",
      })
      .onConflictDoUpdate({
        target: adminUsers.username,
        set: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

    console.log(`Seeded admin: ${entry.username}`);
  }

  const totalAdmins = await db.select().from(adminUsers);
  console.log(`Total admins in DB: ${totalAdmins.length}`);
}

seedAdmins()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed admins:", error);
    process.exit(1);
  });
