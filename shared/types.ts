export type UserRole = "user" | "admin";

export type SafeUser = {
  id: string;
  uid: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
