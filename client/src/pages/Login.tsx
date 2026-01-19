import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit">Sign in</Button>
      </form>
    </Card>
  );
}
