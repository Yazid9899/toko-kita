import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SafeUser } from "@shared/types";
import { api, setAccessToken, type AuthResponse } from "../lib/api";

type AuthContextValue = {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: SafeUser }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/api/auth/login", { email, password });
    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => {
    const data = await api.post<AuthResponse>("/api/auth/register", payload);
    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
