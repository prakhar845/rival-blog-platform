import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rival Blog Platform",
  description: "A modern full-stack blogging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {}
        <nav className="bg-white border-b border-gray-200 shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
            
            {}
            <Link href="/" className="text-2xl font-extrabold text-blue-600 hover:opacity-80 transition">
              RivalBlogs
            </Link>

            <div className="flex gap-6 items-center">
              <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link href="/login" className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 transition">
                Log In
              </Link>
            </div>
          </div>
        </nav>

        {}
        {children}
        
      </body>
    </html>
  );
}