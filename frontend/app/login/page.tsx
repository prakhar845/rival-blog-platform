"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast"; // <-- 1. Import toast

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        
        // 2. Added success toast!
        toast.success("Welcome back!"); 
        router.push("/dashboard");
      } else {
        const err = await res.json();
        
        // 3. Replaced error alert!
        toast.error(err.message || "Invalid email or password"); 
      }
    } catch (error) {
      console.error(error);
      
      // 4. Replaced fallback error alert!
      toast.error("Something went wrong connecting to the server."); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Welcome Back</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Do not have an account?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}