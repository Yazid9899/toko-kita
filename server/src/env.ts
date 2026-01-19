import "dotenv/config";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
  cookieSecure: (process.env.COOKIE_SECURE ?? "false") === "true",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  port: Number(process.env.PORT ?? "3000")
};
