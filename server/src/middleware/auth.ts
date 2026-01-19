import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { getAccessTokenFromRequest } from "../lib/tokens";
import { HttpError } from "./error";
import type { UserRole } from "../../../shared/types";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return next(new HttpError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, uid: payload.uid, role: payload.role };
    return next();
  } catch {
    return next(new HttpError(401, "Unauthorized", "UNAUTHORIZED"));
  }
};

export const requireRole = (role: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return next(new HttpError(403, "Forbidden", "FORBIDDEN"));
    }
    return next();
  };
};

export const requireSelfOrAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new HttpError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  if (req.user.role === "admin" || req.user.id === req.params.id) {
    return next();
  }

  return next(new HttpError(403, "Forbidden", "FORBIDDEN"));
};
