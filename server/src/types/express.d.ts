import "express";
import type { UserRole } from "../../shared/types";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      uid: string;
      role: UserRole;
    };
  }
}
