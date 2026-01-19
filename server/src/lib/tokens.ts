import crypto from "crypto";
import type { Request, Response } from "express";
import { env } from "../env";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const getAccessTokenFromRequest = (req: Request) => {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  if (cookieToken) return cookieToken as string;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return null;
};

export const getRefreshTokenFromRequest = (req: Request) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE];
  if (cookieToken) return cookieToken as string;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return null;
};

const baseCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax" as const,
  domain: env.cookieDomain,
  path: "/"
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookieOptions);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOptions });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions });
};
