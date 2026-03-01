"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "../../../components/Spinner"; // Adjust the import path if needed

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

export default function SingleBlogPage() {
  const params = useParams();
  const slug = params.slug;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        // FIXED: Using dynamic API_URL and placing cache bypass at the top level
        const res = await fetch(`${API_URL}/blogs/public/${slug}`, {
          cache: "no-store", 
        });

        if (!res.ok) {
          throw new Error("Failed to fetch the blog post.");
        }

        const data = await res.json();
        setBlog(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while loading the blog.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (isLoading) return <Spinner />;

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-md border border-red-200 shadow-sm">
          {error || "Blog post not found."}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <article className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
        <header className="mb-10 border-b pb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {blog.title}
          </h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="font-medium text-blue-600 mr-2">
              {blog.user?.email || "Anonymous"}
            </span>
            •
            <span className="ml-2">
              {new Date(blog.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>
        
        {/* whitespace-pre-wrap ensures your paragraph breaks are rendered correctly */}
        <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </article>
      
      {/* If you have a CommentSection component, it would go right here! */}
      {/* <div className="max-w-3xl mx-auto mt-8">
        <CommentSection blogId={blog.id} />
      </div> 
      */}
    </main>
  );
}