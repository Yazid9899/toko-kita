import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { users } from "../../../shared/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { hashPassword } from "../lib/hash";
import { requireAuth, requireRole, requireSelfOrAdmin } from "../middleware/auth";
import { toSafeUser } from "../utils/userMapper";

const router = Router();

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(280).optional(),
  role: z.enum(["user", "admin"]).optional()
});

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  fullName: z.string().min(1).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(280).optional().nullable(),
  role: z.enum(["user", "admin"]).optional()
});

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const allUsers = await db.select().from(users);
    res.json({ users: allUsers.map(toSafeUser) });
  })
);

router.get(
  "/:id",
  requireAuth,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    if (!user) {
      throw new HttpError(404, "User not found", "NOT_FOUND");
    }

    res.json({ user: toSafeUser(user) });
  })
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = createUserSchema.parse(req.body);

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, body.email), eq(users.username, body.username)))
      .limit(1);

    if (existing.length) {
      throw new HttpError(409, "User already exists", "USER_EXISTS");
    }

    const passwordHash = await hashPassword(body.password);
    const [created] = await db
      .insert(users)
      .values({
        uid: randomUUID(),
        username: body.username,
        email: body.email,
        passwordHash,
        fullName: body.fullName ?? null,
        avatarUrl: body.avatarUrl ?? null,
        bio: body.bio ?? null,
        role: body.role ?? "user"
      })
      .returning();

    if (!created) {
      throw new HttpError(500, "Failed to create user");
    }

    res.status(201).json({ user: toSafeUser(created) });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireSelfOrAdmin,
  asyncHandler(async (req, res) => {
    const body = updateUserSchema.parse(req.body);

    if (body.role && req.user?.role !== "admin") {
      throw new HttpError(403, "Forbidden", "FORBIDDEN");
    }

    if (body.email || body.username) {
      const conditions = [];
      if (body.email) conditions.push(eq(users.email, body.email));
      if (body.username) conditions.push(eq(users.username, body.username));

      const whereClause = conditions.length === 1 ? conditions[0] : or(...conditions);
      const existing = await db.select().from(users).where(whereClause).limit(1);
      if (existing.length && existing[0]?.id !== req.params.id) {
        throw new HttpError(409, "User already exists", "USER_EXISTS");
      }
    }

    const update: Record<string, unknown> = {};
    if (body.username !== undefined) update.username = body.username;
    if (body.email !== undefined) update.email = body.email;
    if (body.fullName !== undefined) update.fullName = body.fullName;
    if (body.avatarUrl !== undefined) update.avatarUrl = body.avatarUrl;
    if (body.bio !== undefined) update.bio = body.bio;
    if (body.role !== undefined) update.role = body.role;

    if (body.password) {
      update.passwordHash = await hashPassword(body.password);
    }

    if (Object.keys(update).length === 0) {
      throw new HttpError(400, "No changes provided", "INVALID_REQUEST");
    }

    const [updated] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, req.params.id))
      .returning();

    if (!updated) {
      throw new HttpError(404, "User not found", "NOT_FOUND");
    }

    res.json({ user: toSafeUser(updated) });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, req.params.id))
      .returning();

    if (!deleted) {
      throw new HttpError(404, "User not found", "NOT_FOUND");
    }

    res.json({ success: true });
  })
);

export default router;
