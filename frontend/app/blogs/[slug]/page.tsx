"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Spinner from "../../../components/Spinner";
import CommentSection from "../../../components/CommentSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface BlogDetail {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  user?: {
    email: string;
  };
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/public/${slug}`);
        if (!res.ok) {
          throw new Error("Backend Fetch Failed!");
        }
        const data = await res.json();
        setBlog(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-red-600 mb-4">{error}</h2>
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          &larr; Go Back to Feed
        </Link>
      </div>
    );
  }

  if (!blog)
    return (
      <div className="text-center py-20 text-2xl font-bold">Blog not found</div>
    );

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(blog.createdAt));

  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white rounded-xl shadow-sm border border-gray-200">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-8 inline-block font-semibold"
      >
        &larr; Back to Feed
      </Link>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
        {blog.title}
      </h1>

      <div className="flex items-center text-sm text-gray-500 font-medium space-x-2 mb-10 pb-8 border-b border-gray-100">
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          {blog.user?.email}
        </span>
        <span>•</span>
        <span>{formattedDate}</span>
        <span>•</span>
        <span>{readingTime} min read</span>
      </div>

      {}
      <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap mb-16">
        {blog.content}
      </div>

      <CommentSection blogId={blog.id} />
    </div>
  );
}
