import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { randomUUID } from "crypto";
import { and, eq, or, isNull } from "drizzle-orm";
import { db } from "../db";
import { users, refreshTokens } from "../../../shared/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../middleware/error";
import { hashPassword, verifyPassword } from "../lib/hash";
import {
  getTokenExpiry,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../lib/jwt";
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies
} from "../lib/tokens";
import { toSafeUser } from "../utils/userMapper";
import { requireAuth } from "../middleware/auth";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(280).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const issueTokens = async (user: typeof users.$inferSelect, req: Request) => {
  const payload = { sub: user.id, uid: user.uid, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getTokenExpiry(refreshToken),
    userAgent: req.get("user-agent") ?? null,
    ip: req.ip
  });

  return { accessToken, refreshToken };
};

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

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
        bio: body.bio ?? null
      })
      .returning();

    if (!created) {
      throw new HttpError(500, "Failed to create user");
    }

    const { accessToken, refreshToken } = await issueTokens(created, req);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user: toSafeUser(created), accessToken });
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) {
      throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user: toSafeUser(user), accessToken });
  })
);

router.post(
  "/refresh",
  authLimiter,
  asyncHandler(async (req, res) => {
    const token = getRefreshTokenFromRequest(req);
    if (!token) {
      throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const tokenHash = hashToken(token);
    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, stored.id));

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) {
      throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const { accessToken, refreshToken } = await issueTokens(user, req);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user: toSafeUser(user), accessToken });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = getRefreshTokenFromRequest(req);
    if (token) {
      const tokenHash = hashToken(token);
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
    }

    clearAuthCookies(res);
    res.json({ success: true });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user) {
      throw new HttpError(404, "User not found", "NOT_FOUND");
    }

    res.json({ user: toSafeUser(user) });
  })
);

export default router;
