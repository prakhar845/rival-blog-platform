"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const hasToken = !!token;
      
      setIsLoggedIn((prevStatus) => {
        if (prevStatus !== hasToken) return hasToken;
        return prevStatus;
      });
    };

    checkAuthStatus();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {}
          <Link href="/" className="text-2xl font-extrabold tracking-tight transition hover:opacity-80">
            <span className="text-blue-600">Rival</span>
            <span className="text-gray-900">Blogs</span>
          </Link>
          
          {}
          <div className="flex gap-6 items-center">
            {isLoggedIn ? (
              <>
                <Link href="/create" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
                  Write a Post
                </Link>
                <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-bold px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Log Out
                </button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
                    Log In
                  </Link>
                  <Link href="/register" className="text-sm font-bold px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}