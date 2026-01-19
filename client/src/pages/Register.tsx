import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        fullName: form.fullName || undefined
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input label="Username" value={form.username} onChange={handleChange("username")} required />
        <Input label="Email" type="email" value={form.email} onChange={handleChange("email")} required />
        <Input label="Full name" value={form.fullName} onChange={handleChange("fullName")} />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange("password")}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit">Register</Button>
      </form>
    </Card>
  );
}
