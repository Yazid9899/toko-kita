import { useAuth } from "../hooks/useAuth";
import Card from "../components/Card";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Card className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Profile</h1>
      <div className="space-y-2 text-sm text-slate-700">
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>
        <p>Full name: {user?.fullName ?? "-"}</p>
        <p>Bio: {user?.bio ?? "-"}</p>
      </div>
    </Card>
  );
}
