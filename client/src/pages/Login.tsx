import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/");
      } else {
        const data = await response.json();
        toast({
          title: "Login Failed",
          description: data.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center">
           <div className="w-full max-w-sm space-y-6">
              <div className="text-center">
                 <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
                 <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    data-testid="input-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#5C6AC4] transition-all shadow-lg shadow-indigo-200"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              
              <p className="text-xs text-gray-400 text-center">
                Default credentials can be changed via environment variables.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
