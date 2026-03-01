import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rival Blog Platform",
  description: "A full-stack blogging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>
        {}
        <Toaster position="bottom-right" /> 
        
        {}
        <Navbar /> 
        
        {}
        <main className="grow pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}