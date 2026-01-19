import jwt from "jsonwebtoken";
import { env } from "../env";
import type { UserRole } from "../../../shared/types";

export type AuthTokenPayload = {
  sub: string;
  uid: string;
  role: UserRole;
};

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });

export const signRefreshToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtAccessSecret) as AuthTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret) as AuthTokenPayload;

export const getTokenExpiry = (token: string) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new Error("Invalid token expiry");
  }
  return new Date(decoded.exp * 1000);
};
