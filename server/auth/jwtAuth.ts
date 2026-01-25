import "dotenv/config";
import type { Express, Request, RequestHandler, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { adminUsers } from "@shared/schema";
import { verifyPassword } from "./passwords";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthTokenPayload;
  }
}

type AuthTokenPayload = JwtPayload & {
  sub: string;
  username?: string;
};

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || "auth_token";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set in .env.");
  }
  return secret;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function getToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[JWT_COOKIE_NAME] || null;
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearAuthCookie(res: Response) {
  res.clearCookie(JWT_COOKIE_NAME);
}

export async function setupAuth(app: Express) {
  if (!process.env.JWT_SECRET && !process.env.SESSION_SECRET) {
    console.warn(
      "JWT_SECRET is not set. Add JWT_SECRET to .env for local auth."
    );
  }
  app.set("trust proxy", 1);
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export function registerAuthRoutes(app: Express): void {
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials payload" });
    }

    try {
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username));

      if (!user) {
        const hasAdmins = await db
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .limit(1);

        if (hasAdmins.length === 0) {
          return res.status(500).json({
            message: "No admin users found. Run npm run seed:admins.",
          });
        }

        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await verifyPassword(
        password,
        user.passwordHash
      );

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = jwt.sign(
        { sub: String(user.id), username: user.username },
        getJwtSecret(),
        {
        expiresIn: JWT_EXPIRES_IN,
        }
      );

      setAuthCookie(res, token);
      return res.json({ success: true });
    } catch (error) {
      console.error("Login failed:", error);
      return res.status(500).json({ message: "Failed to login" });
    }
  });

  const logoutHandler: RequestHandler = (_req, res) => {
    clearAuthCookie(res);
    return res.json({ success: true });
  };

  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      return res.json({ authenticated: true });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
