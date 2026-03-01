"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }, 0);

    return () => clearTimeout(checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <html lang="en">
      <head>
        <title>Rival Blog Platform</title>
        <meta name="description" content="A modern full-stack blogging platform" />
      </head>
      <body className={inter.className}>
        
        {}
        <nav className="bg-white border-b border-gray-200 shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
            
            <Link href="/" className="text-2xl font-extrabold text-blue-600 hover:opacity-80 transition">
              RivalBlogs
            </Link>

            {}
            <div className="flex gap-6 items-center">
              {isLoggedIn ? (
                <>
                  <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                    Home
                  </Link>
                  <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-bold bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                    Sign Up
                  </Link>
                  <Link href="/login" className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {}
        {children}
        
      </body>
    </html>
  );
}