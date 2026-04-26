"use client";

interface BlogData {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view your dashboard");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/blogs/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load your blogs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBlogs();
  }, [router, API_URL]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg text-gray-500 font-semibold">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          My Author Dashboard
        </h1>
        <button
          onClick={() => router.push("/editor")}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Create New Post
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No blogs published yet.
          </h2>
          <p className="text-gray-500 mb-6">
            Start writing your first piece of content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: BlogData) => (
            <div
              key={blog.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {blog.published ? "🟢 Published" : "🟡 Draft"} •{" "}
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 font-semibold hover:underline text-sm">
                  Edit
                </button>
                <button className="text-red-600 font-semibold hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
