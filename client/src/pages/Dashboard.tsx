import { useAuth } from "../hooks/useAuth";
import Card from "../components/Card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back{user ? `, ${user.username}` : ""}.
        </p>
      </Card>
      <Card>
        <h2 className="text-sm font-semibold text-slate-700">Quick info</h2>
        <div className="mt-3 text-sm text-slate-600">
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
      </Card>
    </div>
  );
}
