import type { User } from "../../../shared/schema";
import type { SafeUser } from "../../../shared/types";

export const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  uid: user.uid,
  username: user.username,
  email: user.email,
  fullName: user.fullName ?? null,
  avatarUrl: user.avatarUrl ?? null,
  bio: user.bio ?? null,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});
