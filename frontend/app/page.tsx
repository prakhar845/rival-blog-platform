"use client";

import { useState, useEffect } from "react";
import BlogCard from "../components/BlogCard";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function PublicFeed() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 5;
  
  // Safely extract the API URL from the environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        // 1. Using API_URL instead of hardcoded localhost
        // 2. Added cache: 'no-store' to ensure we always get fresh data
        const res = await fetch(
          `${API_URL}/blogs/public/feed?page=${currentPage}&limit=${limit}`, 
          { cache: 'no-store' }
        );
        
        if (!res.ok) throw new Error("Failed to fetch public feed.");

        const json = await res.json();
        
        setBlogs(json.data);
        setTotalPages(json.meta.totalPages);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentPage, API_URL]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading the latest posts...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-600">Rival Blog Platform</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <h2 className="text-xl font-bold mb-2">It&apos;s quiet here...</h2>
            <p className="text-gray-500 mb-6">No published blogs found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} isDashboard={false} />
            ))}
          </div>
        )}

        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
            >
              &larr; Previous
            </button>

            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// forcing vercel to rebuild