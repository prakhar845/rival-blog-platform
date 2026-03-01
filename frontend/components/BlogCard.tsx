"use client";

import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content?: string; // Added optional content to calculate reading time
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

interface BlogCardProps {
  blog: Blog;
  isDashboard: boolean;
  onTogglePublish?: (id: string, currentStatus: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string) => void; 
}

export default function BlogCard({ blog, isDashboard, onTogglePublish, onDelete, onEdit }: BlogCardProps) {
  
  const [likeCount, setLikeCount] = useState(blog._count?.likes || 0); 
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isDashboard) {
      fetch(`${API_URL}/blogs/${blog.id}/like`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.isLiked) setIsLiked(true);
        })
        .catch(() => {});
    }
  }, [blog.id, isDashboard]);

  const toggleLike = async () => {
    const token = localStorage.getItem("token"); 
    if (!token) {
      toast.error("You must be logged in to like a post!");
      return;
    }

    setIsLiking(true);

    try {
      const method = isLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/blogs/${blog.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Your session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }

        const errorData = await res.json();
        if (errorData.message === "You already liked this post.") {
          setIsLiked(true); 
          return;
        }
        throw new Error(errorData.message || "Failed to process like.");
      }

      const data = await res.json();
      setLikeCount(data.likeCount);
      setIsLiked(!isLiked); 
      
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong trying to like this post.");
      }
    } finally {
      setIsLiking(false);
    }
  };

  // --- PREMIUM UPGRADE: Date Formatter ---
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(blog.createdAt));

  // --- PREMIUM UPGRADE: Reading Time Calculator ---
  // Assumes ~200 words per minute average reading speed
  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
          
          {/* Apply the formatted date and reading time here! */}
          <div className="flex items-center text-sm text-gray-500 font-medium space-x-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
            {!isDashboard && blog.user?.email && (
              <>
                <span>•</span>
                <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{blog.user.email}</span>
              </>
            )}
          </div>
        </div>

        {isDashboard && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(blog.id)}
                className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              >
                Edit
              </button>
            )}
            {onTogglePublish && (
              <button
                onClick={() => onTogglePublish(blog.id, !!blog.isPublished)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition ${
                  blog.isPublished
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {blog.isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(blog.id)}
                className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
        {!isDashboard && (
          <button
            onClick={toggleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
              isLiked 
                ? "bg-red-50 text-red-600 border border-red-200" 
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            } disabled:opacity-50`}
          >
            <svg className={`w-5 h-5 ${isLiked ? "fill-current" : "fill-none stroke-current stroke-2"}`} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
        )}

        <Link href={`/blogs/${blog.slug}`} className="text-blue-600 font-semibold text-sm hover:underline ml-auto">
          Read More &rarr;
        </Link>
      </div>
    </div>
  );
}