import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Login failed");
        return;
      }

      queryClient.setQueryData(["/api/auth/user"], true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch {
      setError("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        {/* Left Side - Brand */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#5C6AC4] to-[#00848E] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Toko-Kita</h1>
            <p className="text-blue-100">Simple Order Management</p>
          </div>
          
          <div className="relative z-10 space-y-6">
             <h2 className="text-3xl font-light leading-tight">
               Manage your inventory,<br/>
               track orders,<br/>
               <span className="font-bold">grow your business.</span>
             </h2>
          </div>

          <div className="text-xs text-blue-200 relative z-10">
             © 2024 Toko-Kita Inc.
          </div>

          {/* Abstract circles */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Right Side - Login */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
              <p className="text-gray-500 mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg bg-[#5C6AC4] hover:bg-[#4d5baf] transition-all shadow-lg shadow-indigo-200"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-xs text-gray-400 mt-6">
              By logging in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
