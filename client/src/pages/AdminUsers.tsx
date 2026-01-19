import { useEffect, useState } from "react";
import type { SafeUser } from "@shared/types";
import Card from "../components/Card";
import { api } from "../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ users: SafeUser[] }>("/api/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Admin users</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="divide-y">
        {users.map((user) => (
          <div key={user.id} className="py-3 text-sm">
            <div className="font-medium">{user.username}</div>
            <div className="text-slate-600">{user.email}</div>
            <div className="text-slate-500">Role: {user.role}</div>
          </div>
        ))}
        {users.length === 0 && !error && <p className="text-sm text-slate-500">No users yet.</p>}
      </div>
    </Card>
  );
}
