import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId: string;
    isAuthenticated: boolean;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupSimpleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === adminUsername && password === adminPassword) {
      // Regenerate session to prevent session fixation
      req.session.regenerate(async (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to create session" });
        }

        // Create or get user
        const user = await authStorage.upsertUser({
          id: "admin-user",
          email: `${username}@local`,
          firstName: "Admin",
          lastName: "User",
        });

        req.session.userId = user.id;
        req.session.isAuthenticated = true;

        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ message: "Failed to save session" });
          }
          res.json({ success: true, user });
        });
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.clearCookie("connect.sid");
        res.json({ success: true });
      }
    });
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
