"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BlogCard from "../../components/BlogCard";
import Spinner from "../../components/Spinner"; 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Blog {
  id: string;
  title: string;
  slug: string;
  createdAt: string | Date;
  isPublished?: boolean;
  user?: {
    email: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const fetchMyBlogs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      // FIXED: cache is now a top-level property of the fetch options
      const res = await fetch(`${API_URL}/blogs/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store' 
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMyBlogs();
  }, [fetchMyBlogs]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      if (res.ok) fetchMyBlogs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchMyBlogs();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">My Dashboard</h1>
      </div>
      
      <div className="flex flex-col gap-6">
        {blogs.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-4">You haven&apos;t written any posts yet.</p>
            <Link href="/create" className="text-blue-600 font-semibold hover:underline">Start writing &rarr;</Link>
          </div>
        ) : (
          blogs.map((blog: Blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              isDashboard={true}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
              onEdit={(id) => router.push(`/dashboard/edit/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}