"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


interface Blog {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  createdAt: string | Date;
  isPublished?: boolean;
  user?: {
    email: string;
  };
  _count?: {
    likes: number;
  };
}

interface BlogCardProps {
  blog: Blog; 
  isDashboard: boolean;
  onTogglePublish?: (id: string, status: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function BlogCard({ blog, isDashboard, onTogglePublish, onDelete, onEdit }: BlogCardProps) {
  const router = useRouter();
  
  const [likes, setLikes] = useState(blog._count?.likes || 0);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to like a post!");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/blogs/${blog.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.message && data.message.toLowerCase().includes('unliked')) {
          setLikes((prev: number) => Math.max(0, prev - 1));
        } else {
          setLikes((prev: number) => prev + 1);
        }
      } else {
        console.error("Backend refused the toggle. You might need to refresh.");
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isDashboard ? (
              blog.title
            ) : (
              <Link href={`/blogs/${blog.slug || blog.id}`} className="hover:text-blue-600 transition">
                {blog.title}
              </Link>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(blog.createdAt).toLocaleDateString()} • {blog.user?.email || "Anonymous"}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-6 line-clamp-3">
        {blog.summary || blog.content}
      </p>

      <div className="flex justify-between items-center border-t pt-4">
        {!isDashboard ? (
          <div className="flex gap-4">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-500 transition"
            >
              ❤️ {likes}
            </button>
            <Link href={`/blogs/${blog.slug || blog.id}`} className="text-sm font-medium text-blue-600 hover:underline">
              Read More &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            {onEdit && (
              <button onClick={() => onEdit(blog.id)} className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                Edit
              </button>
            )}
            {onTogglePublish && (
              <button 
                onClick={() => onTogglePublish(blog.id, blog.isPublished ?? false)} 
                className={`px-3 py-1 text-sm font-medium rounded-md ${blog.isPublished ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                {blog.isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(blog.id)} className="px-3 py-1 text-sm font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}