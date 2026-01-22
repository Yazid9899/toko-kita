import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
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
           <div className="w-full max-w-sm space-y-8 text-center">
              <div>
                 <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
                 <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full h-12 text-lg bg-[#5C6AC4] hover:bg-[#4d5baf] transition-all shadow-lg shadow-indigo-200"
              >
                Log in with Replit
              </Button>
              
              <p className="text-xs text-gray-400 mt-8">
                By logging in, you agree to our Terms of Service and Privacy Policy.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
