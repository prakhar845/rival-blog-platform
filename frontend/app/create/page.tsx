"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner";

export default function CreateBlogPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 1. Route Protection: Check auth before rendering the form
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a post.");
      router.push("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, isPublished: true }),
      });

      if (res.ok) {
        toast.success("Post published successfully!");
        router.push("/dashboard");
      } else {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Your session expired. Please log in again.");
          router.push("/login");
          return;
        }
        const err = await res.json();
        toast.error(err.message || "Failed to create post");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while publishing.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show a spinner while we check if the user is allowed to be here
  if (isCheckingAuth) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Create New Post</h1>
        <Link href="/dashboard" className="text-blue-600 font-semibold hover:underline transition">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Post Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a catchy title..."
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your amazing post here..."
            className="p-3 border border-gray-300 rounded-lg h-64 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
            required
          />
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg disabled:opacity-50 transition shadow-sm"
          >
            {isSaving ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
}