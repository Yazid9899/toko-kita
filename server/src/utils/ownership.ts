import { and, eq, type SQL } from "drizzle-orm";
import type { Request } from "express";

export const ownerFilter = (req: Request, column: any) => {
  if (req.user?.role === "admin") return undefined;
  return eq(column, req.user!.id);
};

export const buildWhere = (...conditions: Array<SQL | undefined>) => {
  const filtered = conditions.filter(Boolean) as SQL[];
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return and(...filtered);
};
